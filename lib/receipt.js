// 掃描收據：用 Cloudflare Workers AI 讀收據相片（每日有免費額度，不需要 API key）
import { wrap, json, HttpError } from "./db.js";

export const RECEIPT_PROMPT = `你是日本購物收據的讀取助手。請仔細閱讀這張收據相片，只回覆一個 JSON（不要其他文字、不要 markdown），格式如下：
{"store":"店名（看不到就留空）","date":"YYYY-MM-DD","time":"HH:MM","currency":"JPY","pay":"cash|ic|card|other","taxFree":true,"total":0,"discount":0,"items":[{"name":"繁體中文商品名稱（翻譯，盡量寫出品牌和規格）","orig":"收據上的原文","qty":1,"price":0,"amount":0}]}
規則：
- 每件商品一行；qty 是數量，price 是折扣後的單價，amount 是該行折扣後的小計（= price × qty）。
- 收據上的「値引」是折扣，要用折扣後的金額；「本体」是原價。
- total 是最後實際支付的總額；discount 是總折扣（沒有就 0）。
- pay：現金／お預り＝cash；交通系IC（ICOCA、Suica 等）＝ic；VISA、MASTER、JCB、クレジット＝card；其他＝other。
- 日期的「26/10/25」代表 2026-10-25。
- 數字只寫阿拉伯數字，不要逗號和貨幣符號。`;

const MODELS = ["@cf/meta/llama-4-scout-17b-16e-instruct", "@cf/meta/llama-3.2-11b-vision-instruct"];

// 從 AI 回覆中取出 JSON
export function pickJSON(text) {
  if (!text) return null;
  if (typeof text === "object") return text;
  const s = String(text).replace(/```(?:json)?/g, "");
  const a = s.indexOf("{"), b = s.lastIndexOf("}");
  if (a < 0 || b <= a) return null;
  try { return JSON.parse(s.slice(a, b + 1)); } catch { return null; }
}

async function runModel(env, model, dataUrl) {
  if (model.includes("llama-4")) {
    const r = await env.AI.run(model, {
      messages: [{ role: "user", content: [{ type: "text", text: RECEIPT_PROMPT }, { type: "image_url", image_url: { url: dataUrl } }] }],
      max_tokens: 2048, temperature: 0.1,
    });
    return r && (r.response ?? r.result ?? r);
  }
  // Llama 3.2 Vision：第一次使用要先同意授權條款
  const bytes = [...Uint8Array.from(atob(dataUrl.split(",")[1]), (c) => c.charCodeAt(0))];
  try { await env.AI.run(model, { prompt: "agree" }); } catch {}
  const r = await env.AI.run(model, { prompt: RECEIPT_PROMPT, image: bytes, max_tokens: 2048, temperature: 0.1 });
  return r && (r.response ?? r.result ?? r);
}

export const scanReceipt = wrap(async ({ env, request }) => {
  if (!env.AI) throw new HttpError(501, "網站未啟用 Workers AI");
  const body = await request.json().catch(() => null);
  const img = body && body.image;
  if (!img || !/^data:image\/(jpeg|png|webp);base64,/.test(img)) throw new HttpError(400, "請上傳收據相片");
  if (img.length > 4_000_000) throw new HttpError(413, "相片太大");
  let lastErr = null;
  for (const m of MODELS) {
    try {
      const out = await runModel(env, m, img);
      const data = pickJSON(out);
      if (data && Array.isArray(data.items)) return json({ model: m, data });
      lastErr = new Error("AI 回覆格式不正確");
    } catch (e) { lastErr = e; }
  }
  throw new HttpError(502, "AI 讀取失敗：" + ((lastErr && lastErr.message) || "未知錯誤"));
});
