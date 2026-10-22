import { wrap, json, HttpError } from "../../../lib/db.js";

const MAX = 1_900_000; // D1 單行上限約 2MB（base64 後）

// POST 原始圖片 bytes（content-type: image/jpeg 等）
export const onRequestPost = wrap(async ({ env, request }) => {
  const mime = (request.headers.get("content-type") || "").split(";")[0];
  if (!/^image\/(jpeg|png|webp|gif)$/.test(mime)) throw new HttpError(415, "只接受 JPEG / PNG / WebP / GIF 圖片");
  const buf = new Uint8Array(await request.arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
  const b64 = btoa(bin);
  if (b64.length > MAX) throw new HttpError(413, "圖片太大，請壓縮後再上傳");
  const id = crypto.randomUUID().replace(/-/g, "");
  await env.DB.prepare("INSERT INTO photos (id, mime, data, created_at) VALUES (?, ?, ?, ?)").bind(id, mime, b64, Date.now()).run();
  return json({ id, url: "/api/photos/" + id });
});
