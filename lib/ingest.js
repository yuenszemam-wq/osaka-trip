// 由其他程式（緞帶小金庫）同步支出到旅程：用密鑰認證，不需要裝置認證
//   GET    /api/ingest/trips      → 旅程列表（最新的排第一）
//   POST   /api/ingest/expense    → 新增／更新一筆支出（以 ref 識別，重覆推送只會更新）
//   POST   /api/ingest/unexpense  → 移除一筆支出
// 以下要在旅行手帳內（已認證裝置）操作：
//   GET    /api/ingest/status、POST /api/ingest/key（產生密鑰，只顯示一次）、DELETE /api/ingest/key
import { json, HttpError, ensureSchema } from "./db.js";
import { migrate } from "./migrations.js";

const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const sha256 = async (s) => hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
function same(a, b) { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }
const CORS = { "access-control-allow-origin": "*", "access-control-allow-methods": "GET, POST, OPTIONS", "access-control-allow-headers": "authorization, content-type", "access-control-max-age": "86400" };
const cj = (data, status = 200) => json(data, status, CORS);
const TYPES = ["place", "food", "shop", "stay", "transport", "flight"];
const PAYS = ["cash", "ic", "card", "other"];

async function getCfg(env) {
  const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'ingest'").first();
  return row ? JSON.parse(row.value) : null;
}

// 旅程中每一日的日期（與前端 dayDate 相同的推算方法）
function dayDates(doc) {
  const days = doc.days.filter((x) => x.kind === "day");
  const y = +((/(20\d\d)/.exec((doc.meta && doc.meta.dates) || "") || [])[1] || new Date().getFullYear());
  const first = /^(\d{1,2})/.exec((days[0] && days[0].sub) || "");
  const pad = (n) => String(n).padStart(2, "0");
  return days.map((d) => {
    if (d.date) return [d.id, d.date];
    const m = /^(\d{1,2})[.\/-](\d{1,2})$/.exec((d.sub || "").trim());
    if (!m) return [d.id, null];
    const yy = first && +m[1] < +first[1] ? y + 1 : y;
    return [d.id, `${yy}-${pad(m[1])}-${pad(m[2])}`];
  });
}
const tripStart = (doc) => (dayDates(doc).map((x) => x[1]).filter(Boolean).sort()[0] || null);

// 讀取 → 修改 → 寫回（有衝突就重試），並留下版本紀錄
async function editTrip(env, id, fn) {
  for (let i = 0; i < 4; i++) {
    const row = await env.DB.prepare("SELECT version, doc, updated_at FROM trips WHERE id = ?").bind(id).first();
    if (!row) throw new HttpError(404, "找不到這個旅程");
    const doc = JSON.parse(row.doc);
    migrate(doc);
    const out = fn(doc);
    if (out === false) return { changed: false };
    const now = Date.now();
    const res = await env.DB.batch([
      env.DB.prepare("UPDATE trips SET version = ?, doc = ?, updated_at = ? WHERE id = ? AND version = ?").bind(row.version + 1, JSON.stringify(doc), now, id, row.version),
      env.DB.prepare("INSERT INTO trip_revisions (trip_id, version, doc, created_at) VALUES (?, ?, ?, ?)").bind(id, row.version, row.doc, row.updated_at),
    ]);
    if (res[0].meta.changes) return { changed: true, ...(typeof out === "object" ? out : {}) };
  }
  throw new HttpError(409, "旅程正在更新，請稍後再試");
}

export async function handleIngest(request, env, devOk) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  try {
    await ensureSchema(env);
    const p = new URL(request.url).pathname.replace(/\/+$/, ""), M = request.method;
    const cfg = await getCfg(env);

    // ---- 旅行手帳內的設定（需要已認證裝置） ----
    if (p === "/api/ingest/status" || p === "/api/ingest/key") {
      if (!(await devOk())) return json({ error: "需要裝置認證", auth: true }, 401);
      if (p === "/api/ingest/status" && M === "GET") return json({ enabled: !!cfg, created: cfg ? cfg.created : null });
      if (p === "/api/ingest/key" && M === "POST") {
        const key = "tk_" + hex(crypto.getRandomValues(new Uint8Array(20)));
        await env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('ingest', ?)").bind(JSON.stringify({ hash: await sha256(key), created: Date.now() })).run();
        return json({ ok: true, key });
      }
      if (p === "/api/ingest/key" && M === "DELETE") {
        await env.DB.prepare("DELETE FROM settings WHERE key = 'ingest'").run();
        return json({ ok: true });
      }
      return json({ error: "找不到" }, 404);
    }

    // ---- 其他程式用密鑰存取 ----
    const key = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (!cfg) return cj({ error: "旅行手帳未產生同步密鑰（菜單 → 行程管理 → 連接緞帶小金庫）" }, 401);
    if (!key || !same(cfg.hash, await sha256(key))) return cj({ error: "同步密鑰不正確" }, 401);

    if (p === "/api/ingest/trips" && M === "GET") {
      const { results } = await env.DB.prepare("SELECT id, doc, updated_at, created_at FROM trips").all();
      const trips = results.map((r) => {
        const doc = JSON.parse(r.doc), m = doc.meta || {};
        return { id: r.id, title: m.title || doc.title || "未命名旅程", dates: m.dates || "", cur: m.currency || "", start: tripStart(doc), created: r.created_at };
      }).sort((a, b) => (b.start || "").localeCompare(a.start || "") || b.created - a.created);
      return cj({ trips });
    }

    const b = await request.json().catch(() => ({}));
    const trip = String(b.trip || ""), ref = String(b.ref || "").slice(0, 60);
    if (!/^[\w-]{1,60}$/.test(trip)) return cj({ error: "請選擇旅程" }, 400);
    if (!/^[\w-]{1,60}$/.test(ref)) return cj({ error: "缺少紀錄編號" }, 400);

    if (p === "/api/ingest/expense" && M === "POST") {
      const actual = Math.round(Number(b.actual) * 100) / 100;
      if (!Number.isFinite(actual) || !actual) return cj({ error: "金額不正確" }, 400);
      const cur = /^[A-Z]{3}$/.test(String(b.cur || "")) ? String(b.cur) : "HKD";
      const hkd = cur !== "HKD" && Number(b.hkd) ? Math.round(Number(b.hkd) * 100) / 100 : null;
      const vals = {
        title: String(b.title || "支出").slice(0, 60), type: TYPES.includes(b.type) ? b.type : "shop",
        plan: null, actual, cur, pay: PAYS.includes(b.pay) ? b.pay : "card", note: String(b.note || "").slice(0, 80),
      };
      const date = /^\d{4}-\d{2}-\d{2}$/.test(String(b.date || "")) ? String(b.date) : null;
      const r = await editTrip(env, trip, (doc) => {
        doc.expenses = doc.expenses || [];
        const dd = dayDates(doc).find((x) => x[1] === date);
        let o = doc.expenses.find((x) => x.ref === ref);
        if (!o) { o = { id: "e-" + crypto.randomUUID().replace(/-/g, "").slice(0, 10), ref }; doc.expenses.push(o); }
        Object.assign(o, vals, { dayId: dd ? dd[0] : "" });
        if (hkd != null) o.hkd = hkd; else delete o.hkd;
        return { id: o.id, day: !!dd };
      });
      return cj({ ok: true, id: r.id, inDay: r.day });
    }
    if (p === "/api/ingest/unexpense" && M === "POST") {
      await editTrip(env, trip, (doc) => {
        const n = (doc.expenses || []).length;
        doc.expenses = (doc.expenses || []).filter((x) => x.ref !== ref);
        return doc.expenses.length === n ? false : true;
      });
      return cj({ ok: true });
    }
    return cj({ error: "找不到" }, 404);
  } catch (e) {
    return cj({ error: e.message || String(e) }, e.status || 500);
  }
}
