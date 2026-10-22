// 本機測試用：模擬 Cloudflare Pages Functions + D1（用 node:sqlite）
// 用法：node --experimental-sqlite scripts/devserver.mjs
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const sqlite = new DatabaseSync(process.env.DB_FILE || ":memory:");

class Stmt {
  constructor(sql, args = []) { this.sql = sql; this.args = args; }
  bind(...a) { return new Stmt(this.sql, a); }
  async first() { return sqlite.prepare(this.sql).get(...this.args) ?? null; }
  async all() { return { results: sqlite.prepare(this.sql).all(...this.args) }; }
  async run() { const r = sqlite.prepare(this.sql).run(...this.args); return { meta: { changes: Number(r.changes) } }; }
}
const DB = {
  prepare: (sql) => new Stmt(sql),
  async batch(list) { const out = []; sqlite.exec("BEGIN"); try { for (const s of list) out.push(await s.run()); sqlite.exec("COMMIT"); } catch (e) { sqlite.exec("ROLLBACK"); throw e; } return out; },
};

const routes = [
  [/^\/api\/trip$/, "functions/api/trip.js"],
  [/^\/api\/photos$/, "functions/api/photos/index.js"],
  [/^\/api\/photos\/([^/]+)$/, "functions/api/photos/[id].js"],
  [/^\/api\/revisions$/, "functions/api/revisions/index.js"],
  [/^\/api\/revisions\/([^/]+)$/, "functions/api/revisions/[id].js"],
];
const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".webmanifest": "application/manifest+json" };

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  for (const [re, file] of routes) {
    const m = re.exec(url.pathname);
    if (!m) continue;
    const mod = await import(path.join(root, file));
    const fn = mod["onRequest" + req.method[0] + req.method.slice(1).toLowerCase()];
    if (!fn) { res.writeHead(405); return res.end(); }
    const chunks = []; for await (const c of req) chunks.push(c);
    const request = new Request(url, { method: req.method, headers: req.headers, body: ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks) });
    const r = await fn({ request, env: { DB }, params: { id: m[1] } });
    res.writeHead(r.status, Object.fromEntries(r.headers));
    return res.end(Buffer.from(await r.arrayBuffer()));
  }
  let p = path.join(root, "public", url.pathname === "/" ? "index.html" : url.pathname);
  if (!fs.existsSync(p)) p = path.join(root, "public", "index.html");
  res.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
}).listen(process.env.PORT || 8788, () => console.log("http://localhost:" + (process.env.PORT || 8788)));
