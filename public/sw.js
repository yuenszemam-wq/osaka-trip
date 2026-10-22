// 離線支援：
// - 網站外殼（HTML/CSS/JS）：網絡優先，沒有網絡時用快取
// - 圖片：快取優先（看過或在「準備離線使用」下載過的圖片，離線時都可以看）
// - 地圖程式庫（cdnjs）和地圖底圖：快取優先，底圖最多保留約 1500 張
const SHELL = "shell-v34", PHOTOS = "photos-v1", LIBS = "libs-v1", TILES = "tiles-v1";
const FILES = ["/", "/index.html", "/style.css", "/app.js", "/manifest.webmanifest", "/icon-192.png", "/icon-180.png", "/icon-64.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => ![SHELL, PHOTOS, LIBS, TILES].includes(k)).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
async function cacheFirst(name, req, limit) {
  const c = await caches.open(name);
  const hit = await c.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === "opaque") {
    await c.put(req, res.clone());
    if (limit) c.keys().then((k) => { if (k.length > limit) Promise.all(k.slice(0, k.length - limit).map((x) => c.delete(x))); });
  }
  return res;
}
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.hostname === "cdnjs.cloudflare.com") { e.respondWith(cacheFirst(LIBS, e.request)); return; }
  if (url.hostname === "tile.openstreetmap.org") { e.respondWith(cacheFirst(TILES, e.request, 1500).catch(() => new Response("", { status: 504 }))); return; }
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith("/api/photos/")) { e.respondWith(cacheFirst(PHOTOS, e.request)); return; }
  if (url.pathname.startsWith("/api/")) return; // 行程資料由網頁自己快取
  e.respondWith(fetch(e.request).then((res) => {
    // 只保存成功的回應（未認證時的認證頁是 401，不會覆蓋網站外殼）
    if (res.ok) { const copy = res.clone(); caches.open(SHELL).then((c) => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("/index.html"))));
});
