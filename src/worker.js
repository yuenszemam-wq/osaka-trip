// Cloudflare Workers 入口：先做裝置認證檢查，/api/* 由 lib/api.js 處理，其他由 public/ 靜態檔案提供
import { handleApi } from "../lib/api.js";
import { handleAuth, gate, loginPage } from "../lib/auth.js";
import { json } from "../lib/db.js";

// 不需要認證的檔案（只有圖示等，沒有行程資料）
const OPEN = /^\/(icon[\w-]*\.png|manifest\.webmanifest|favicon\.ico)$/;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const p = url.pathname;
    if (p.startsWith("/api/auth/")) return handleAuth(request, env);
    if (!OPEN.test(p)) {
      let g;
      try { g = await gate(request, env); } catch (e) { return json({ error: e.message || String(e) }, 500); }
      if (!g.ok) return p.startsWith("/api/") ? json({ error: "這部裝置未認證", auth: true }, 401) : loginPage();
    }
    if (p.startsWith("/api/")) return handleApi(request, env, ctx);
    return env.ASSETS.fetch(request);
  },
};
