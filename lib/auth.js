// 裝置認證：啟用後只有已認證的裝置可以開啟網站
// - 用密碼認證一次，伺服器發出裝置 cookie（10 年，不會過期）
// - 已認證的裝置可以查看／移除其他裝置、改密碼、停用認證
import { json, ensureSchema } from "./db.js";

const COOKIE = "tdev";
const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const rand = (n) => hex(crypto.getRandomValues(new Uint8Array(n)));
const sha256 = async (s) => hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
async function pbkdf2(pass, salt) {
  const key = await crypto.subtle.importKey("raw", enc.encode(pass), "PBKDF2", false, ["deriveBits"]);
  return hex(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(salt), iterations: 100000, hash: "SHA-256" }, key, 256));
}
function same(a, b) { // 固定時間比較
  if (a.length !== b.length) return false;
  let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

let schemaReady = false;
async function ensureAuth(env) {
  await ensureSchema(env);
  if (schemaReady) return;
  await env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS devices (id TEXT PRIMARY KEY, token_hash TEXT NOT NULL, name TEXT NOT NULL, created_at INTEGER NOT NULL, last_seen INTEGER NOT NULL)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS auth_fail (ip TEXT PRIMARY KEY, n INTEGER NOT NULL, t INTEGER NOT NULL)"),
  ]);
  schemaReady = true;
}

// 設定和裝置檢查的結果短暫快取，減少每個請求都查資料庫
let cfgCache = null;
const devCache = new Map();
async function getConfig(env) {
  if (cfgCache && Date.now() - cfgCache.t < 30000) return cfgCache.v;
  await ensureAuth(env);
  const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'auth'").first();
  const v = row ? JSON.parse(row.value) : null;
  cfgCache = { t: Date.now(), v };
  return v;
}
function readCookie(request) {
  const m = /(?:^|;\s*)tdev=([^;]+)/.exec(request.headers.get("cookie") || "");
  return m ? decodeURIComponent(m[1]) : null;
}
export async function currentDevice(request, env) {
  const c = readCookie(request); if (!c) return null;
  const [id, token] = c.split(".");
  if (!id || !token) return null;
  const hit = devCache.get(c);
  if (hit && Date.now() - hit.t < 5 * 60000) return hit.dev;
  await ensureAuth(env);
  const row = await env.DB.prepare("SELECT id, name, token_hash, last_seen FROM devices WHERE id = ?").bind(id).first();
  const dev = row && same(row.token_hash, await sha256(token)) ? { id: row.id, name: row.name } : null;
  if (dev && Date.now() - row.last_seen > 3600e3) await env.DB.prepare("UPDATE devices SET last_seen = ? WHERE id = ?").bind(Date.now(), id).run();
  devCache.set(c, { t: Date.now(), dev });
  return dev;
}
// 網站入口檢查：未啟用認證時全部放行
export async function gate(request, env) {
  const cfg = await getConfig(env);
  if (!cfg) return { ok: true, enabled: false };
  const dev = await currentDevice(request, env);
  return { ok: !!dev, enabled: true, dev };
}

async function newDevice(env, name) {
  const id = "d" + rand(6), token = rand(24), now = Date.now();
  await env.DB.prepare("INSERT INTO devices (id, token_hash, name, created_at, last_seen) VALUES (?, ?, ?, ?, ?)").bind(id, await sha256(token), name, now, now).run();
  const secure = true;
  const cookie = `${COOKIE}=${id}.${token}; Path=/; Max-Age=315360000; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`;
  return { id, cookie };
}
const cleanName = (s) => String(s || "").trim().slice(0, 40) || "未命名裝置";
const ipOf = (request) => request.headers.get("cf-connecting-ip") || "local";
async function tooMany(env, ip) {
  const r = await env.DB.prepare("SELECT n, t FROM auth_fail WHERE ip = ?").bind(ip).first();
  return r && r.n >= 8 && Date.now() - r.t < 15 * 60000;
}
async function failed(env, ip) {
  const r = await env.DB.prepare("SELECT n, t FROM auth_fail WHERE ip = ?").bind(ip).first();
  const fresh = !r || Date.now() - r.t > 15 * 60000;
  await env.DB.prepare("INSERT OR REPLACE INTO auth_fail (ip, n, t) VALUES (?, ?, ?)").bind(ip, fresh ? 1 : r.n + 1, Date.now()).run();
}
async function checkPass(env, cfg, pass) { return !!cfg && same(cfg.hash, await pbkdf2(String(pass || ""), cfg.salt)); }
async function savePass(env, pass) {
  const salt = rand(16);
  await env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('auth', ?)").bind(JSON.stringify({ salt, hash: await pbkdf2(pass, salt) })).run();
  cfgCache = null;
}
const body = (request) => request.json().catch(() => ({}));

export async function handleAuth(request, env) {
  try {
    await ensureAuth(env);
    const url = new URL(request.url), p = url.pathname.replace(/\/+$/, ""), M = request.method;
    const cfg = await getConfig(env);
    const dev = cfg ? await currentDevice(request, env) : null;

    if (p === "/api/auth/status" && M === "GET") return json({ enabled: !!cfg, device: dev });

    if (p === "/api/auth/setup" && M === "POST") {
      if (cfg) return json({ error: "裝置認證已經啟用" }, 409);
      const b = await body(request);
      if (String(b.pass || "").length < 6) return json({ error: "密碼最少 6 個字" }, 400);
      await savePass(env, String(b.pass));
      const d = await newDevice(env, cleanName(b.name));
      return json({ ok: true, device: { id: d.id } }, 200, { "set-cookie": d.cookie });
    }
    if (p === "/api/auth/login" && M === "POST") {
      if (!cfg) return json({ ok: true });
      const ip = ipOf(request);
      if (await tooMany(env, ip)) return json({ error: "嘗試次數太多，請 15 分鐘後再試" }, 429);
      const b = await body(request);
      if (!(await checkPass(env, cfg, b.pass))) { await failed(env, ip); return json({ error: "密碼不正確" }, 403); }
      await env.DB.prepare("DELETE FROM auth_fail WHERE ip = ?").bind(ip).run();
      const d = await newDevice(env, cleanName(b.name));
      return json({ ok: true, device: { id: d.id } }, 200, { "set-cookie": d.cookie });
    }

    // 以下需要已認證的裝置
    if (!cfg) return json({ error: "裝置認證未啟用" }, 400);
    if (!dev) return json({ error: "需要裝置認證", auth: true }, 401);
    if (p === "/api/auth/devices" && M === "GET") {
      const { results } = await env.DB.prepare("SELECT id, name, created_at, last_seen FROM devices ORDER BY created_at").all();
      return json({ devices: results.map((r) => ({ ...r, me: r.id === dev.id })) });
    }
    let m = /^\/api\/auth\/devices\/([\w]+)$/.exec(p);
    if (m && M === "DELETE") {
      await env.DB.prepare("DELETE FROM devices WHERE id = ?").bind(m[1]).run();
      devCache.clear();
      return json({ ok: true });
    }
    if (m && M === "PATCH") {
      const b = await body(request);
      await env.DB.prepare("UPDATE devices SET name = ? WHERE id = ?").bind(cleanName(b.name), m[1]).run();
      devCache.clear();
      return json({ ok: true });
    }
    if (p === "/api/auth/password" && M === "POST") {
      const b = await body(request);
      if (!(await checkPass(env, cfg, b.old))) return json({ error: "目前的密碼不正確" }, 403);
      if (String(b.pass || "").length < 6) return json({ error: "新密碼最少 6 個字" }, 400);
      await savePass(env, String(b.pass));
      return json({ ok: true });
    }
    if (p === "/api/auth/disable" && M === "POST") {
      const b = await body(request);
      if (!(await checkPass(env, cfg, b.pass))) return json({ error: "密碼不正確" }, 403);
      await env.DB.batch([env.DB.prepare("DELETE FROM settings WHERE key = 'auth'"), env.DB.prepare("DELETE FROM devices")]);
      cfgCache = null; devCache.clear();
      return json({ ok: true });
    }
    return json({ error: "找不到" }, 404);
  } catch (e) {
    return json({ error: e.message || String(e) }, e.status || 500);
  }
}

// 未認證時顯示的頁面（401，不會被離線快取存起來）
export function loginPage() {
  return new Response(`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#f6f4f0"><title>旅行手帳 · 裝置認證</title>
<link rel="icon" href="/icon-64.png"><link rel="apple-touch-icon" href="/icon-180.png"><link rel="manifest" href="/manifest.webmanifest">
<style>
:root{--p:#f6f4f0;--w:#fffdf9;--ink:#2b2433;--muted:#8a8193;--line:#e6e1ea;--purple:#72598e}
@media (prefers-color-scheme:dark){:root{--p:#1d1a24;--w:#28242f;--ink:#f1edf5;--muted:#a69db0;--line:#3a3443;--purple:#c4a8e6}}
*{box-sizing:border-box}body{margin:0;min-height:100dvh;display:grid;place-items:center;background:var(--p);color:var(--ink);font:16px/1.6 -apple-system,BlinkMacSystemFont,"PingFang HK","Noto Sans TC",sans-serif;padding:24px 16px}
.card{width:100%;max-width:380px;background:var(--w);border:1px solid var(--line);border-radius:24px;padding:28px 22px;text-align:center}
img{width:84px;height:84px}h1{font-size:21px;margin:10px 0 4px}p{color:var(--muted);font-size:14px;margin:0 0 18px}
label{display:block;text-align:left;font-size:13px;color:var(--muted);margin:10px 0 4px}
input{width:100%;font:inherit;font-size:16px;padding:11px 12px;border:1px solid var(--line);border-radius:12px;background:var(--p);color:var(--ink);outline:none}
input:focus{border-color:var(--purple)}
button{margin-top:18px;width:100%;font:inherit;font-weight:700;padding:12px;border:0;border-radius:14px;background:var(--purple);color:var(--w)}
button:disabled{opacity:.6}.err{color:#d0544b;font-size:13px;min-height:20px;margin-top:10px}
</style></head><body><form class="card" id="f" onsubmit="return false">
<img src="/icon-192.png" alt=""><h1>裝置認證</h1><p>這個旅行手帳只限已認證的裝置開啟。<br>輸入密碼認證這部裝置（只需一次，不會過期）。</p>
<label>密碼</label><input type="password" name="pass" autocomplete="current-password" autofocus>
<label>這部裝置的名稱</label><input type="text" name="name" id="nm">
<button id="go">認證這部裝置</button><div class="err" id="err"></div></form>
<script>
var ua=navigator.userAgent,n=/iPhone/.test(ua)?"iPhone":/iPad/.test(ua)?"iPad":/Android/.test(ua)?"Android 手機":/Mac/.test(ua)?"Mac":/Windows/.test(ua)?"Windows 電腦":"裝置";
document.getElementById("nm").value=n+(window.matchMedia("(display-mode: standalone)").matches?"（主畫面 App）":"");
document.getElementById("go").onclick=async function(){var f=document.getElementById("f"),b=this,e=document.getElementById("err");
if(!f.pass.value){e.textContent="請輸入密碼";return}b.disabled=true;e.textContent="";
try{var r=await fetch("/api/auth/login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({pass:f.pass.value,name:f.name.value})});var j=await r.json();
if(!r.ok)throw new Error(j.error||r.status);location.reload()}catch(x){e.textContent=x.message;b.disabled=false}};
</script></body></html>`, { status: 401, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
