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

import worker from "../src/worker.js";
const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".webmanifest": "application/manifest+json" };
const ASSETS = {
  async fetch(req) {
    const u = new URL(req.url);
    let p = path.join(root, "public", u.pathname === "/" ? "index.html" : u.pathname);
    if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) return new Response("Not found", { status: 404 });
    return new Response(fs.readFileSync(p), { headers: { "content-type": MIME[path.extname(p)] || "application/octet-stream" } });
  },
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const chunks = []; for await (const c of req) chunks.push(c);
  const request = new Request(url, { method: req.method, headers: req.headers, body: ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks) });
  const r = await worker.fetch(request, { DB, ASSETS }, {});
  res.writeHead(r.status, Object.fromEntries(r.headers));
  res.end(Buffer.from(await r.arrayBuffer()));
}).listen(process.env.PORT || 8788, () => console.log("http://localhost:" + (process.env.PORT || 8788)));
