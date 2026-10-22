import seed from "./seed.js";
import { migrate } from "./migrations.js";

export const DEFAULT_TRIP = "osaka";
let ready = false;

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });
}

export async function ensureSchema(env) {
  if (!env.DB) throw new HttpError(500, "未設定 D1 資料庫綁定（變數名稱必須是 DB）");
  if (ready) return;
  const DB = env.DB;
  await DB.batch([
    DB.prepare("CREATE TABLE IF NOT EXISTS trip (id INTEGER PRIMARY KEY, version INTEGER NOT NULL, doc TEXT NOT NULL, updated_at INTEGER NOT NULL)"),
    DB.prepare("CREATE TABLE IF NOT EXISTS revisions (id INTEGER PRIMARY KEY AUTOINCREMENT, version INTEGER NOT NULL, doc TEXT NOT NULL, created_at INTEGER NOT NULL)"),
    DB.prepare("CREATE TABLE IF NOT EXISTS photos (id TEXT PRIMARY KEY, mime TEXT NOT NULL, data TEXT NOT NULL, created_at INTEGER NOT NULL)"),
    DB.prepare("CREATE TABLE IF NOT EXISTS trips (id TEXT PRIMARY KEY, version INTEGER NOT NULL, doc TEXT NOT NULL, updated_at INTEGER NOT NULL, created_at INTEGER NOT NULL)"),
    DB.prepare("CREATE TABLE IF NOT EXISTS trip_revisions (id INTEGER PRIMARY KEY AUTOINCREMENT, trip_id TEXT NOT NULL, version INTEGER NOT NULL, doc TEXT NOT NULL, created_at INTEGER NOT NULL)"),
    DB.prepare("CREATE INDEX IF NOT EXISTS trip_revisions_trip ON trip_revisions (trip_id, id)"),
  ]);
  const any = await DB.prepare("SELECT id FROM trips LIMIT 1").first();
  if (!any) {
    // 由舊版（單一行程）搬到新版（多個旅程）
    const old = await DB.prepare("SELECT version, doc, updated_at FROM trip WHERE id = 1").first();
    const now = Date.now();
    if (old) {
      await DB.batch([
        DB.prepare("INSERT OR IGNORE INTO trips (id, version, doc, updated_at, created_at) VALUES (?, ?, ?, ?, ?)").bind(DEFAULT_TRIP, old.version, old.doc, old.updated_at, now),
        DB.prepare("INSERT INTO trip_revisions (trip_id, version, doc, created_at) SELECT ?, version, doc, created_at FROM revisions ORDER BY id").bind(DEFAULT_TRIP),
      ]);
    } else {
      await DB.prepare("INSERT OR IGNORE INTO trips (id, version, doc, updated_at, created_at) VALUES (?, 1, ?, ?, ?)")
        .bind(DEFAULT_TRIP, JSON.stringify(seed), now, now).run();
    }
  }
  ready = true;
}

// 讀取旅程；有未做的資料更新就先做並儲存
export async function loadTrip(env, id) {
  const row = await env.DB.prepare("SELECT version, doc, updated_at FROM trips WHERE id = ?").bind(id).first();
  if (!row) throw new HttpError(404, "找不到這個旅程");
  const doc = JSON.parse(row.doc);
  if (migrate(doc)) {
    const now = Date.now();
    const res = await env.DB.batch([
      env.DB.prepare("UPDATE trips SET version = ?, doc = ?, updated_at = ? WHERE id = ? AND version = ?").bind(row.version + 1, JSON.stringify(doc), now, id, row.version),
      env.DB.prepare("INSERT INTO trip_revisions (trip_id, version, doc, created_at) VALUES (?, ?, ?, ?)").bind(id, row.version, row.doc, row.updated_at),
    ]);
    if (res[0].meta.changes) return { version: row.version + 1, doc, updatedAt: now };
    return loadTrip(env, id);
  }
  return { version: row.version, doc, updatedAt: row.updated_at };
}

export function wrap(fn) {
  return async (ctx) => {
    try {
      await ensureSchema(ctx.env);
      return await fn(ctx);
    } catch (e) {
      return json({ error: e.message || String(e) }, e.status || 500);
    }
  };
}
