// 分享日記：產生公開連結，沒有裝置認證的人也可以瀏覽（唯讀），只會傳出日記需要的內容（不含金額）
import { wrap, json, HttpError, loadTrip } from "./db.js";

const newToken = () => [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(36).padStart(2, "0")).join("").slice(0, 24);
async function getShare(env, token) {
  if (!/^[\w-]{8,64}$/.test(token || "")) return null;
  const row = await env.DB.prepare("SELECT value FROM settings WHERE key = ?").bind("share:" + token).first();
  return row ? JSON.parse(row.value) : null;
}
// ---- 需要認證：管理分享連結 ----
export const listShares = wrap(async ({ env }) => {
  const { results } = await env.DB.prepare("SELECT key, value FROM settings WHERE key LIKE 'share:%'").all();
  return json({ shares: results.map((r) => ({ token: r.key.slice(6), ...JSON.parse(r.value) })) });
});
export const createShare = wrap(async ({ env, request }) => {
  const body = await request.json().catch(() => null);
  const trips = Array.isArray(body && body.trips) ? body.trips.filter((x) => typeof x === "string").slice(0, 30) : [];
  if (!trips.length) throw new HttpError(400, "請選擇要分享的旅程");
  for (const id of trips) await loadTrip(env, id); // 確認旅程存在
  const token = body.token && (await getShare(env, body.token)) ? body.token : newToken();
  const v = { trips, created: Date.now() };
  await env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").bind("share:" + token, JSON.stringify(v)).run();
  return json({ token, ...v });
});
export const deleteShare = wrap(async ({ env, params }) => {
  await env.DB.prepare("DELETE FROM settings WHERE key = ?").bind("share:" + params.token).run();
  return json({ ok: true });
});

// ---- 公開：只讀的日記內容 ----
function slimItem(x) {
  const v = (x.variants || [])[x.active || 0] || (x.variants || [])[0] || {};
  const links = (v.links || []).filter((l) => l.kind === "map" || /google\.[^/]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/.test(l.url || "")).map((l) => ({ kind: "map", label: l.label, url: l.url, ...(l.addr ? { addr: l.addr } : {}) }));
  const out = { id: x.id, start: x.start ?? null, ...(x.done ? { done: true } : {}), active: 0,
    variants: [{ id: v.id, title: v.title || "", type: v.type || "place", dur: v.dur || 0, details: "", links, ...(v.area ? { area: v.area } : {}),
      ...(v.cost && (v.cost.photos || []).length ? { cost: { photos: v.cost.photos } } : {}) }] };
  if (x.memo) out.memo = { photos: x.memo.photos || [], note: x.memo.note || "", ...(x.memo.caption ? { caption: x.memo.caption } : {}), ...(x.memo.fav ? { fav: true } : {}) };
  if (x.area) out.area = x.area;
  out.children = (x.children || []).map(slimItem);
  return out;
}
function slimNode(n) {
  if (n.branch) return { id: n.id, branch: true, active: n.active || 0, routes: (n.routes || []).map((r) => ({ id: r.id, name: r.name, items: (r.items || []).map(slimItem) })) };
  return slimItem(n);
}
export function diaryDoc(doc) {
  const m = doc.meta || {};
  const days = (doc.days || []).filter((d) => d.kind === "day").map((d) => ({ id: d.id, kind: "day", label: d.label, sub: d.sub, title: d.title, ...(d.date ? { date: d.date } : {}), journal: d.journal || "", items: (d.items || []).map(slimNode) }));
  const expenses = (doc.expenses || []).filter((e) => (e.photos || []).length).map((e) => ({ id: e.id, title: e.title, type: e.type, dayId: e.dayId, ...(e.time != null ? { time: e.time } : {}), photos: e.photos }));
  return { meta: { title: m.title, dates: m.dates, name: m.name, subtitle: m.subtitle, cur: m.cur }, days, expenses, wallet: {}, shopping: [] };
}
const photoIds = (d) => new Set((JSON.stringify(d).match(/"photos":\[[^\]]*\]/g) || []).flatMap((s) => JSON.parse(s.slice(9))));

export const publicShare = wrap(async ({ env, params, request }) => {
  const sh = await getShare(env, params.token);
  if (!sh) throw new HttpError(404, "分享連結已失效");
  const want = new URL(request.url).searchParams.get("trip");
  const tripId = sh.trips.includes(want) ? want : sh.trips[0];
  const trips = [];
  for (const id of sh.trips) { try { const t = await loadTrip(env, id); trips.push({ id, title: (t.doc.meta && t.doc.meta.title) || "旅程", dates: t.doc.meta && t.doc.meta.dates }); } catch {} }
  const t = await loadTrip(env, tripId);
  return json({ trips, tripId, doc: diaryDoc(t.doc) }, 200);
});
export const publicSharePhoto = wrap(async ({ env, params }) => {
  const sh = await getShare(env, params.token);
  if (!sh) throw new HttpError(404, "分享連結已失效");
  // 只可以讀取分享旅程日記中的相片
  let ok = false;
  for (const id of sh.trips) { try { const t = await loadTrip(env, id); if (photoIds(diaryDoc(t.doc)).has(params.id)) { ok = true; break; } } catch {} }
  if (!ok) return json({ error: "找不到圖片" }, 404);
  const row = await env.DB.prepare("SELECT mime, data FROM photos WHERE id = ?").bind(params.id).first();
  if (!row) return json({ error: "找不到圖片" }, 404);
  const bin = atob(row.data), bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Response(bytes, { headers: { "content-type": row.mime, "cache-control": "public, max-age=86400" } });
});
