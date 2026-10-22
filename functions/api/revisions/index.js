import { wrap, json } from "../../../lib/db.js";

export const onRequestGet = wrap(async ({ env }) => {
  const { results } = await env.DB.prepare("SELECT id, version, created_at, length(doc) AS size FROM revisions ORDER BY id DESC LIMIT 80").all();
  return json({ revisions: results });
});
