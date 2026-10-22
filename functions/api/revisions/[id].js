import { wrap, json } from "../../../lib/db.js";

export const onRequestGet = wrap(async ({ env, params }) => {
  const row = await env.DB.prepare("SELECT id, version, doc, created_at FROM revisions WHERE id = ?").bind(Number(params.id)).first();
  if (!row) return json({ error: "找不到這個版本" }, 404);
  return json({ id: row.id, version: row.version, createdAt: row.created_at, doc: JSON.parse(row.doc) });
});
