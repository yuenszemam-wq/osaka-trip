// Cloudflare Workers 入口：/api/* 由這裡處理，其他由 public/ 靜態檔案提供
import * as trip from "../functions/api/trip.js";
import * as photosIndex from "../functions/api/photos/index.js";
import * as photoOne from "../functions/api/photos/[id].js";
import * as revIndex from "../functions/api/revisions/index.js";
import * as revOne from "../functions/api/revisions/[id].js";

const routes = [
  [/^\/api\/trip\/?$/, trip],
  [/^\/api\/photos\/?$/, photosIndex],
  [/^\/api\/photos\/([^/]+)$/, photoOne],
  [/^\/api\/revisions\/?$/, revIndex],
  [/^\/api\/revisions\/([^/]+)$/, revOne],
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    for (const [re, mod] of routes) {
      const m = re.exec(url.pathname);
      if (!m) continue;
      const method = request.method[0] + request.method.slice(1).toLowerCase();
      const fn = mod["onRequest" + method];
      if (!fn) return new Response("Method Not Allowed", { status: 405 });
      return fn({ request, env, ctx, params: { id: m[1] ? decodeURIComponent(m[1]) : undefined } });
    }
    if (url.pathname.startsWith("/api/")) return new Response(JSON.stringify({ error: "找不到" }), { status: 404, headers: { "content-type": "application/json" } });
    return env.ASSETS.fetch(request);
  },
};
