import { wrap, json, HttpError } from "../../lib/db.js";

const KEEP_REVISIONS = 80;

export const onRequestGet = wrap(async ({ env }) => {
  const row = await env.DB.prepare("SELECT version, doc, updated_at FROM trip WHERE id = 1").first();
  return json({ version: row.version, updatedAt: row.updated_at, doc: JSON.parse(row.doc) });
});

// body: { version: 目前手上的版本, doc: {...}, force?: true }
export const onRequestPut = wrap(async ({ env, request }) => {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.doc !== "object" || !Array.isArray(body.doc.days)) throw new HttpError(400, "資料格式錯誤");
  const text = JSON.stringify(body.doc);
  if (text.length > 1_500_000) throw new HttpError(413, "行程資料太大");

  const cur = await env.DB.prepare("SELECT version, doc, updated_at FROM trip WHERE id = 1").first();
  if (!body.force && body.version !== cur.version) {
    return json({ error: "conflict", version: cur.version, updatedAt: cur.updated_at, doc: JSON.parse(cur.doc) }, 409);
  }
  const next = cur.version + 1;
  const now = Date.now();
  const res = await env.DB.batch([
    env.DB.prepare("UPDATE trip SET version = ?, doc = ?, updated_at = ? WHERE id = 1 AND version = ?").bind(next, text, now, cur.version),
    env.DB.prepare("INSERT INTO revisions (version, doc, created_at) VALUES (?, ?, ?)").bind(cur.version, cur.doc, cur.updated_at),
    env.DB.prepare("DELETE FROM revisions WHERE id NOT IN (SELECT id FROM revisions ORDER BY id DESC LIMIT ?)").bind(KEEP_REVISIONS),
  ]);
  if (!res[0].meta.changes) return json({ error: "conflict" }, 409);
  return json({ version: next, updatedAt: now });
});
