import { wrap, json } from "../../../lib/db.js";

export const onRequestGet = wrap(async ({ env, params }) => {
  const row = await env.DB.prepare("SELECT mime, data FROM photos WHERE id = ?").bind(params.id).first();
  if (!row) return json({ error: "找不到圖片" }, 404);
  const bin = atob(row.data);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Response(bytes, {
    headers: { "content-type": row.mime, "cache-control": "public, max-age=31536000, immutable" },
  });
});
