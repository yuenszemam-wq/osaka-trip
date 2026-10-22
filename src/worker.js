// Cloudflare Workers 入口：/api/* 由 lib/api.js 處理，其他由 public/ 靜態檔案提供
import { handleApi } from "../lib/api.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return handleApi(request, env, ctx);
    return env.ASSETS.fetch(request);
  },
};
