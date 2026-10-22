import seed from "./seed.js";
import { migrate } from "./migrations.js";

let ready = false;

export async function ensureSchema(env) {
  if (!env.DB) throw new HttpError(500, "未設定 D1 資料庫綁定（變數名稱必須是 DB）");
  if (ready) return;
  await env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS trip (id INTEGER PRIMARY KEY, version INTEGER NOT NULL, doc TEXT NOT NULL, updated_at INTEGER NOT NULL)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS revisions (id INTEGER PRIMARY KEY AUTOINCREMENT, version INTEGER NOT NULL, doc TEXT NOT NULL, created_at INTEGER NOT NULL)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS photos (id TEXT PRIMARY KEY, mime TEXT NOT NULL, data TEXT NOT NULL, created_at INTEGER NOT NULL)"),
  ]);
  const row = await env.DB.prepare("SELECT id FROM trip WHERE id = 1").first();
  if (!row) {
    await env.DB.prepare("INSERT OR IGNORE INTO trip (id, version, doc, updated_at) VALUES (1, 1, ?, ?)")
      .bind(JSON.stringify(seed), Date.now()).run();
  }
  const cur = await env.DB.prepare("SELECT version, doc, updated_at FROM trip WHERE id = 1").first();
  const doc = JSON.parse(cur.doc);
  if (migrate(doc)) {
    await env.DB.batch([
      env.DB.prepare("UPDATE trip SET version = ?, doc = ?, updated_at = ? WHERE id = 1 AND version = ?").bind(cur.version + 1, JSON.stringify(doc), Date.now(), cur.version),
      env.DB.prepare("INSERT INTO revisions (version, doc, created_at) VALUES (?, ?, ?)").bind(cur.version, cur.doc, cur.updated_at),
    ]);
  }
  ready = true;
}

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });
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
