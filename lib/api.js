// 所有 /api/* 的處理
import { wrap, json, HttpError, loadTrip, DEFAULT_TRIP } from "./db.js";
import { migrate } from "./migrations.js";
import { scanReceipt } from "./receipt.js";

const KEEP_REVISIONS = 80;
const MAX_PHOTO = 1_900_000;

function validDoc(doc) {
  if (!doc || typeof doc !== "object" || !Array.isArray(doc.days)) throw new HttpError(400, "資料格式錯誤");
  const text = JSON.stringify(doc);
  if (text.length > 1_500_000) throw new HttpError(413, "行程資料太大");
  return text;
}
const tripSummary = (id, doc, updatedAt) => ({
  id, updatedAt,
  title: (doc.meta && doc.meta.title) || doc.title || "未命名旅程",
  name: doc.meta && doc.meta.name, dates: doc.meta && doc.meta.dates,
  days: doc.days.filter((d) => d.kind === "day").length,
});

// ---- 旅程列表 ----
export const listTrips = wrap(async ({ env }) => {
  const { results } = await env.DB.prepare("SELECT id, doc, updated_at, created_at FROM trips ORDER BY created_at, id").all();
  return json({ trips: results.map((r) => tripSummary(r.id, JSON.parse(r.doc), r.updated_at)), default: DEFAULT_TRIP });
});
export const createTrip = wrap(async ({ env, request }) => {
  const body = await request.json().catch(() => null);
  const doc = body && body.doc;
  const text = validDoc(doc);
  const id = "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const now = Date.now();
  migrate(doc);
  await env.DB.prepare("INSERT INTO trips (id, version, doc, updated_at, created_at) VALUES (?, 1, ?, ?, ?)").bind(id, JSON.stringify(doc), now, now).run();
  return json({ id, version: 1, updatedAt: now, doc });
});

// ---- 單一旅程 ----
export const getTrip = wrap(async ({ env, params }) => json(await loadTrip(env, params.id)));
export const putTrip = wrap(async ({ env, request, params }) => {
  const body = await request.json().catch(() => null);
  if (!body) throw new HttpError(400, "資料格式錯誤");
  const text = validDoc(body.doc);
  const cur = await env.DB.prepare("SELECT version, doc, updated_at FROM trips WHERE id = ?").bind(params.id).first();
  if (!cur) throw new HttpError(404, "找不到這個旅程");
  if (!body.force && body.version !== cur.version) {
    return json({ error: "conflict", version: cur.version, updatedAt: cur.updated_at, doc: JSON.parse(cur.doc) }, 409);
  }
  const next = cur.version + 1, now = Date.now();
  const res = await env.DB.batch([
    env.DB.prepare("UPDATE trips SET version = ?, doc = ?, updated_at = ? WHERE id = ? AND version = ?").bind(next, text, now, params.id, cur.version),
    env.DB.prepare("INSERT INTO trip_revisions (trip_id, version, doc, created_at) VALUES (?, ?, ?, ?)").bind(params.id, cur.version, cur.doc, cur.updated_at),
    env.DB.prepare("DELETE FROM trip_revisions WHERE trip_id = ? AND id NOT IN (SELECT id FROM trip_revisions WHERE trip_id = ? ORDER BY id DESC LIMIT ?)").bind(params.id, params.id, KEEP_REVISIONS),
  ]);
  if (!res[0].meta.changes) return json({ error: "conflict" }, 409);
  return json({ version: next, updatedAt: now });
});
export const deleteTrip = wrap(async ({ env, params }) => {
  const { results } = await env.DB.prepare("SELECT id FROM trips").all();
  if (results.length <= 1) throw new HttpError(400, "至少要保留一個旅程");
  await env.DB.batch([
    env.DB.prepare("DELETE FROM trips WHERE id = ?").bind(params.id),
    env.DB.prepare("DELETE FROM trip_revisions WHERE trip_id = ?").bind(params.id),
  ]);
  return json({ ok: true });
});

// ---- 版本紀錄 ----
export const listRevisions = wrap(async ({ env, params }) => {
  const { results } = await env.DB.prepare("SELECT id, version, created_at FROM trip_revisions WHERE trip_id = ? ORDER BY id DESC LIMIT ?").bind(params.id, KEEP_REVISIONS).all();
  return json({ revisions: results });
});
export const getRevision = wrap(async ({ env, params }) => {
  const row = await env.DB.prepare("SELECT id, version, doc, created_at FROM trip_revisions WHERE trip_id = ? AND id = ?").bind(params.id, Number(params.rid)).first();
  if (!row) throw new HttpError(404, "找不到這個版本");
  return json({ id: row.id, version: row.version, createdAt: row.created_at, doc: JSON.parse(row.doc) });
});

// ---- 圖片 ----
export const uploadPhoto = wrap(async ({ env, request }) => {
  const mime = (request.headers.get("content-type") || "").split(";")[0];
  if (!/^image\/(jpeg|png|webp|gif)$/.test(mime)) throw new HttpError(415, "只接受 JPEG / PNG / WebP / GIF 圖片");
  const buf = new Uint8Array(await request.arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
  const b64 = btoa(bin);
  if (b64.length > MAX_PHOTO) throw new HttpError(413, "圖片太大，請壓縮後再上傳");
  const id = crypto.randomUUID().replace(/-/g, "");
  await env.DB.prepare("INSERT INTO photos (id, mime, data, created_at) VALUES (?, ?, ?, ?)").bind(id, mime, b64, Date.now()).run();
  return json({ id, url: "/api/photos/" + id });
});
export const getPhoto = wrap(async ({ env, params }) => {
  const row = await env.DB.prepare("SELECT mime, data FROM photos WHERE id = ?").bind(params.id).first();
  if (!row) return json({ error: "找不到圖片" }, 404);
  const bin = atob(row.data);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Response(bytes, { headers: { "content-type": row.mime, "cache-control": "public, max-age=31536000, immutable" } });
});

// ---- 旅行願望清單（所有旅程共用） ----
export const getWish = wrap(async ({ env }) => {
  const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'wishlist'").first();
  const v = row ? JSON.parse(row.value) : { version: 0, doc: { items: [] } };
  return json(v);
});
export const putWish = wrap(async ({ env, request }) => {
  const body = await request.json().catch(() => null);
  if (!body || !body.doc || !Array.isArray(body.doc.items)) throw new HttpError(400, "資料格式錯誤");
  const text = JSON.stringify(body.doc);
  if (text.length > 1_500_000) throw new HttpError(413, "資料太大");
  const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'wishlist'").first();
  const cur = row ? JSON.parse(row.value) : { version: 0 };
  if ((body.version || 0) !== cur.version) return json({ error: "願望清單已在其他裝置更新", conflict: true, ...cur }, 409);
  const next = { version: cur.version + 1, doc: body.doc, updatedAt: Date.now() };
  await env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('wishlist', ?)").bind(JSON.stringify(next)).run();
  return json({ version: next.version, updatedAt: next.updatedAt });
});

// ---- 路由表 ----
export const ROUTES = [
  ["GET", /^\/api\/trips\/?$/, listTrips, []],
  ["POST", /^\/api\/trips\/?$/, createTrip, []],
  ["GET", /^\/api\/trips\/([\w-]+)\/?$/, getTrip, ["id"]],
  ["PUT", /^\/api\/trips\/([\w-]+)\/?$/, putTrip, ["id"]],
  ["DELETE", /^\/api\/trips\/([\w-]+)\/?$/, deleteTrip, ["id"]],
  ["GET", /^\/api\/trips\/([\w-]+)\/revisions\/?$/, listRevisions, ["id"]],
  ["GET", /^\/api\/trips\/([\w-]+)\/revisions\/(\d+)$/, getRevision, ["id", "rid"]],
  // 舊網址（舊版網頁仍可使用）
  ["GET", /^\/api\/trip\/?$/, getTrip, [], { id: DEFAULT_TRIP }],
  ["PUT", /^\/api\/trip\/?$/, putTrip, [], { id: DEFAULT_TRIP }],
  ["POST", /^\/api\/photos\/?$/, uploadPhoto, []],
  ["GET", /^\/api\/photos\/([^/]+)$/, getPhoto, ["id"]],
  ["GET", /^\/api\/wishlist\/?$/, getWish, []],
  ["PUT", /^\/api\/wishlist\/?$/, putWish, []],
  ["POST", /^\/api\/receipt\/?$/, scanReceipt, []],
];

export async function handleApi(request, env, ctx) {
  const url = new URL(request.url);
  let pathMatched = false;
  for (const [method, re, fn, names, fixed] of ROUTES) {
    const m = re.exec(url.pathname);
    if (!m) continue;
    pathMatched = true;
    if (method !== request.method) continue;
    const params = { ...(fixed || {}) };
    names.forEach((n, i) => (params[n] = decodeURIComponent(m[i + 1])));
    return fn({ request, env, ctx, params });
  }
  return json({ error: pathMatched ? "Method Not Allowed" : "找不到" }, pathMatched ? 405 : 404);
}
