/* 旅行手帳 — 前端（不需編譯） */
(() => {
"use strict";

// ---------- 類別、圖示、貨幣 ----------
const CATS = {
  place: ["活動", "sparkles", "activity"],
  food: ["餐飲", "utensils", "food"],
  shop: ["購物", "bag", "shop"],
  stay: ["住宿", "bed", "stay"],
  transport: ["交通", "train", "transport"],
  flight: ["航班", "plane", "flight"],
  info: ["資訊", "info", "info"],
};
const TYPES = Object.fromEntries(Object.entries(CATS).map(([k, c]) => [k, c[0]]));
const catOf = (t) => CATS[t] || CATS.place;
const catVar = (t) => `var(--c-${catOf(t)[2]})`;
const isInfo = (it) => V(it).type === "info";

const ICONS = {
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 12 10 5 10-5M2 17l10 5 10-5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  train: '<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M9 21l1.5-4M15 21l-1.5-4M8.5 14h.01M15.5 14h.01"/>',
  plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/>',
  bed: '<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>',
  sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 3v4M17 5h4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  up: '<path d="m18 15-6-6-6 6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  branch: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="7" r="2.5"/><path d="M6 8.5v7M18 9.5c0 4.5-6 3.5-10.5 7"/>',
  nav: '<path d="m3 11 19-9-9 19-2-8z"/>',
  ext: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  book: '<path d="M4 19.5V5a2 2 0 0 1 2-2h13v16H6.5A2.5 2.5 0 0 0 4 21.5 2.5 2.5 0 0 0 6.5 24H19"/><path d="M8 7h7M8 11h5"/>',
  wallet: '<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v3M21 12v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5"/><path d="M17 12h4v4h-4a2 2 0 0 1 0-4z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  auto: '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  pencil: '<path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>',
  archive: '<rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M10 12h4"/>',
  back: '<path d="M9 14 4 9l5-5"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.8 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3.1 14H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 3.1V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 20.9 10H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  note: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
  bulb: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2z"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  swap: '<path d="M16 3l4 4-4 4M20 7H4M8 21l-4-4 4-4M4 17h16"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  suitcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
};
const icon = (n) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ""}</svg>`;

// 貨幣：港幣合計；當地貨幣以匯率換算
const CUR = { JPY: "¥", HKD: "HK$", TWD: "NT$", KRW: "₩", CNY: "人民幣¥", USD: "US$", EUR: "€", GBP: "£", THB: "฿", SGD: "S$", MYR: "RM", AUD: "A$", CAD: "C$", VND: "₫" };
const CUR_NAME = { JPY: "日圓", HKD: "港幣", TWD: "新台幣", KRW: "韓圜", CNY: "人民幣", USD: "美元", EUR: "歐元", GBP: "英鎊", THB: "泰銖", SGD: "新加坡元", MYR: "馬幣", AUD: "澳元", CAD: "加元", VND: "越南盾" };
const NO_DEC = new Set(["JPY", "KRW", "VND", "TWD"]);
function money(n, cur) {
  if (n == null || isNaN(n)) return "";
  const dec = cur === "HKD" ? (Math.abs(n) >= 100 ? 0 : 1) : NO_DEC.has(cur) ? 0 : 2;
  const s = Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: dec, minimumFractionDigits: 0 });
  return (n < 0 ? "−" : "") + (CUR[cur] || cur + " ") + s;
}
const localCur = () => (S.doc && S.doc.meta && S.doc.meta.currency) || "JPY";
function toHKD(n, cur) {
  if (n == null || n === "" || isNaN(n)) return null;
  if (cur === "HKD") return +n;
  const m = S.doc.meta || {};
  if (cur === (m.currency || "JPY") && m.rate) return +n * m.rate;
  return null;
}
const numOrNull = (v) => { const s = String(v ?? "").replace(/[,，\s]/g, ""); if (s === "") return null; const n = Number(s); return isFinite(n) ? n : null; };

const S = {
  tripId: null, trips: [], doc: null, version: 0, dayId: null, q: "",
  saving: false, pending: false, timer: null, conflict: null, offline: false,
  undo: [], open: new Set(), expanded: new Set(), closed: new Set(), altOpen: new Set(),
  photoMode: null, ideaFilter: "all", mapFilter: "all", mapSel: 0, mapDay: null, markers: [], view: "list", map: null, manage: false, theme: "auto",
};
const MONEY = "__money";
const DIARY = "__diary";

// ---------- helpers ----------
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const clone = (o) => JSON.parse(JSON.stringify(o));
const safeUrl = (u) => /^https?:\/\//i.test(String(u || "").trim()) ? String(u).trim() : null;
const ls = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};
// 每個旅程各自的本機快取
const K = (name) => `trip.${S.tripId}.${name}`;
const API = (p = "") => `/api/trips/${encodeURIComponent(S.tripId)}${p}`;

function fmt(min) {
  if (min == null || isNaN(min)) return "";
  const next = min >= 1440;
  const m = ((min % 1440) + 1440) % 1440;
  return (next ? "翌日" : "") + String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
}
function hhmm(min) { // for <input type=time>
  if (min == null) return "";
  const m = ((min % 1440) + 1440) % 1440;
  return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
}
function parseHHMM(v) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(v || "");
  return m ? +m[1] * 60 + +m[2] : null;
}
const V = (it) => it.variants[Math.min(it.active || 0, it.variants.length - 1)];
const endOf = (it) => it.start == null ? null : it.start + (V(it).dur || 0);
const day = () => S.doc.days.find((d) => d.id === S.dayId) || S.doc.days[0];
// 一天的行程結構：d.items 是共用行程；其中可以有「分叉」節點
//   { id, branch: true, active: routeId, routes: [{ id, name, items: [...] }] }
// 分叉之前、之後的行程所有路線共用；只有分叉內的行程會隨路線切換。
const isBranch = (n) => !!(n && n.branch);
const activeRoute = (b) => b.routes.find((r) => r.id === b.active) || b.routes[0];
// 按顯示次序列出目前路線的所有主行程：{ item, arr, idx, branch }
function seq(d) {
  const out = [];
  d.items.forEach((n, i) => {
    if (isBranch(n)) activeRoute(n).items.forEach((it, k) => out.push({ item: it, arr: activeRoute(n).items, idx: k, branch: n }));
    else out.push({ item: n, arr: d.items, idx: i, branch: null });
  });
  return out;
}
// 在一天裡找出行程（包括未使用的路線和子行程）
function locate(d, id) {
  const scan = (arr, branch, route) => {
    for (let i = 0; i < arr.length; i++) {
      const it = arr[i];
      if (isBranch(it)) {
        for (const r of it.routes) { const f = scan(r.items, it, r); if (f) return f; }
        continue;
      }
      if (it.id === id) return { day: d, item: it, index: i, arr, parent: null, branch, route };
      const ci = (it.children || []).findIndex((c) => c.id === id);
      if (ci >= 0) return { day: d, item: it.children[ci], index: ci, arr: it.children, parent: it, branch, route };
    }
    return null;
  };
  return scan(d.items, null, null);
}
function findItem(id) {
  for (const d of S.doc.days) { const f = locate(d, id); if (f) return f; }
  return null;
}
const findItemIn = locate;
// 插入位置在顯示次序中的前一項（-1 = 最前面）
function insertPos(d, route, at) {
  const list = seq(d);
  let p = -1;
  if (route) {
    const { branch, route: r } = findRoute(d, route);
    if (at >= 0) return list.findIndex((x) => x.item === r.items[at]);
    const bi = d.items.indexOf(branch);
    list.forEach((x, k) => { if (x.arr === d.items && x.idx < bi) p = k; });
    return p;
  }
  if (at < 0) return -1;
  list.forEach((x, k) => { const top = x.branch ? d.items.indexOf(x.branch) : x.idx; if (top <= at) p = k; });
  return p;
}
function findBranch(d, id) { return d.items.find((n) => isBranch(n) && n.id === id); }
function findRoute(d, rid) {
  for (const n of d.items) if (isBranch(n)) { const r = n.routes.find((x) => x.id === rid); if (r) return { branch: n, route: r }; }
  return null;
}
function newItem(start, type = "place") {
  return { id: uid(), start, locked: false, done: false, active: 0, children: [],
    variants: [{ id: uid(), title: "", type, dur: 60, details: "", links: [], photos: [] }] };
}

// ---------- 時間自動調整 ----------
function shiftItem(it, delta) {
  if (it.start != null) it.start += delta;
  for (const c of it.children || []) if (c.start != null) c.start += delta;
}
// 把顯示次序第 pos 項之後的主行程全部移動 delta 分鐘，遇到「固定時間」的行程就停
function rippleFrom(d, pos, delta) {
  if (!delta) return 0;
  const list = seq(d);
  let n = 0;
  for (let j = pos + 1; j < list.length; j++) {
    const it = list[j].item;
    if (it.start == null) continue;
    if (it.locked) break;
    shiftItem(it, delta);
    n++;
  }
  return n;
}
const posOf = (d, it) => seq(d).findIndex((x) => x.item === it);
function ripple(d, it, delta) { return rippleFrom(d, posOf(d, it), delta); }
function conflicts(d) {
  const out = {};
  let prevEnd = null, prevTitle = "";
  for (const { item: it } of seq(d)) {
    if (it.start == null) continue;
    if (prevEnd != null && it.start < prevEnd) out[it.id] = `與上一項「${prevTitle}」重疊 ${prevEnd - it.start} 分鐘`;
    prevEnd = endOf(it); prevTitle = V(it).title;
  }
  return out;
}
// ---------- 分叉路線 ----------
function copyItems(items) {
  return clone(items).map((it) => ({
    ...it, id: uid(), done: false,
    children: (it.children || []).map((c) => ({ ...c, id: uid(), done: false, variants: c.variants.map((v) => ({ ...v, id: uid() })) })),
    variants: it.variants.map((v) => ({ ...v, id: uid() })),
  }));
}
const planLetter = (i) => String.fromCharCode(65 + i);
// 連結分兩類：地圖（kind: "map"）和一般連結；舊資料按網址判斷
const MAP_RE = /google\.[^/]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|maps\.apple\.com/;
const isMapLink = (l) => l.kind ? l.kind === "map" : MAP_RE.test(l.url || "");
function normUrl(u) {
  u = String(u || "").trim(); if (!u) return "";
  if (!/^[a-z]+:\/\//i.test(u) && /^[\w.-]+\.[a-z]{2,}/i.test(u)) u = "https://" + u;
  return safeUrl(u) || null;
}
function routeEnd(r) {
  let e = null;
  for (const it of r.items) { const x = endOf(it); if (x != null && (e == null || x > e)) e = x; }
  return e;
}
// 切換路線：之後的共用行程按兩條路線的結束時間差移動
function switchRoute(d, b, rid) {
  const oldR = activeRoute(b), newR = b.routes.find((r) => r.id === rid);
  if (!newR || oldR === newR) return 0;
  const oe = routeEnd(oldR), ne = routeEnd(newR);
  b.active = rid;
  if (oe == null || ne == null || oe === ne) return { n: 0, delta: 0 };
  const list = seq(d);
  const bi = d.items.indexOf(b);
  const firstAfter = list.findIndex((x) => x.arr === d.items && x.idx > bi);
  if (firstAfter < 0) return { n: 0, delta: 0 };
  return { n: rippleFrom(d, firstAfter - 1, ne - oe), delta: ne - oe };
}

const durText = (m) => m >= 60 ? `${Math.floor(m / 60)} 小時${m % 60 ? ` ${m % 60} 分` : ""}` : `${m} 分鐘`;

// ---------- 修改與儲存 ----------
function commit(mut, msg) {
  S.undo.push(JSON.stringify(S.doc));
  if (S.undo.length > 40) S.undo.shift();
  const res = mut(S.doc);
  persistLocal(true);
  render();
  scheduleSave();
  if (msg || (res && res.msg)) toast(msg || res.msg, true);
}
// 不需要「復原」的背景修改（例如定位結果、匯率）
function quietSave() { persistLocal(true); scheduleSave(); }
function undo() {
  const prev = S.undo.pop();
  if (!prev) return;
  S.doc = JSON.parse(prev);
  persistLocal(true);
  render();
  scheduleSave();
  toast("已復原");
}
function persistLocal(pending) {
  ls.set(K("doc"), JSON.stringify(S.doc));
  ls.set(K("version"), String(S.version));
  if (pending) { S.pending = true; ls.set(K("pending"), "1"); }
}
function scheduleSave() {
  clearTimeout(S.timer);
  S.timer = setTimeout(save, 900);
  syncUI();
}
async function save(force = false) {
  if (S.saving || (!S.pending && !force) || !S.tripId) return;
  S.saving = true; syncUI();
  const tripAtStart = S.tripId;
  try {
    const r = await fetch(API(), {
      method: "PUT", headers: { "content-type": "application/json" },
      body: JSON.stringify({ version: S.version, doc: S.doc, force }),
    });
    const data = await r.json().catch(() => ({}));
    if (tripAtStart !== S.tripId) return;
    if (r.status === 409) { S.conflict = data; S.offline = false; }
    else if (!r.ok) throw new Error(data.error || r.status);
    else {
      S.version = data.version; S.pending = false; S.conflict = null; S.offline = false;
      S.savedAt = data.updatedAt;
      ls.del(K("pending")); persistLocal(false);
    }
    S.saveError = null;
  } catch (e) {
    S.offline = !navigator.onLine || e instanceof TypeError;
    S.lastError = e.message;
    if (!S.offline) { S.saveError = e.message; toast("雲端儲存失敗：" + e.message + "（會自動重試）"); }
  } finally {
    S.saving = false;
    syncUI();
    if (S.conflict) render();
  }
}
// 找出要開啟的旅程：網址 #t=… → 上次開啟 → 伺服器預設
async function pickTrip() {
  const fromHash = (location.hash.match(/t=([\w-]+)/) || [])[1];
  if (fromHash) return fromHash;
  const last = ls.get("trip.current");
  if (last) return last;
  try {
    const r = await fetch("/api/trips", { cache: "no-store" });
    const j = await r.json();
    S.trips = j.trips || [];
    return j.default || (S.trips[0] && S.trips[0].id) || "osaka";
  } catch { return "osaka"; }
}
async function loadTrips() {
  try {
    const r = await fetch("/api/trips", { cache: "no-store" });
    if (!r.ok) return;
    S.trips = (await r.json()).trips || [];
    ls.set("trip.list", JSON.stringify(S.trips));
  } catch { try { S.trips = JSON.parse(ls.get("trip.list") || "[]"); } catch {} }
}
async function load() {
  const id = S.tripId;
  // 舊版只有一個旅程：沿用舊的本機快取
  if (id === "osaka" && !ls.get(K("doc")) && ls.get("trip.doc")) {
    ls.set(K("doc"), ls.get("trip.doc")); ls.set(K("version"), ls.get("trip.version") || "0");
    if (ls.get("trip.pending")) ls.set(K("pending"), "1");
    ls.del("trip.doc"); ls.del("trip.pending");
  }
  const cached = ls.get(K("doc"));
  S.doc = null;
  if (cached) {
    try { S.doc = JSON.parse(cached); S.version = +ls.get(K("version")) || 0; S.pending = ls.get(K("pending")) === "1"; } catch {}
  }
  S.dayId = ls.get(K("day")) || ls.get("trip.day");
  if (S.doc) render();
  try {
    const r = await fetch(API(), { cache: "no-store" });
    const data = await r.json();
    if (id !== S.tripId) return;
    if (r.status === 404) {
      ls.del("trip.current"); ls.del(K("doc"));
      S.tripId = null; S.tripId = await pickTrip(); if (S.tripId === id) S.tripId = "osaka";
      return load();
    }
    if (!r.ok) throw new Error(data.error || r.status);
    if (S.pending && S.doc) {
      if (data.version === S.version) await save(); // 離線時的修改，補上傳
      else S.conflict = data;
    } else {
      S.doc = data.doc; S.version = data.version; S.savedAt = data.updatedAt;
      persistLocal(false);
    }
    S.offline = false;
  } catch (e) {
    S.offline = true; S.lastError = e.message;
    if (!S.doc) { $("#main").innerHTML = `<div class="banner">無法載入行程：${esc(e.message)}<div class="row"><button class="btn" onclick="location.reload()">重新載入</button></div></div>`; syncUI(); return; }
  }
  ls.set("trip.current", S.tripId);
  render(); syncUI();
  autoRate();
}
async function switchTrip(id) {
  if (id === S.tripId) return;
  if (S.pending) await save();
  closeSheet();
  S.tripId = id; S.doc = null; S.version = 0; S.undo = []; S.conflict = null; S.pending = false; S.q = ""; S.manage = false;
  S.open.clear(); S.expanded.clear();
  ls.set("trip.current", id);
  history.replaceState(null, "", "#t=" + id);
  $("#main").innerHTML = `<p class="loading">載入中…</p>`;
  window.scrollTo(0, 0);
  await load();
}
async function refresh() {
  if (S.pending || S.saving || document.hidden || !S.tripId) return;
  try {
    const r = await fetch(API(), { cache: "no-store" });
    if (!r.ok) return;
    const data = await r.json();
    if (data.version !== S.version && !S.pending && !$("#sheet:not([hidden])")) {
      S.doc = data.doc; S.version = data.version; S.savedAt = data.updatedAt;
      persistLocal(false); render();
    }
    S.offline = false; syncUI();
  } catch { S.offline = true; syncUI(); }
}

function syncUI() {
  const dot = $("#syncDot"), t = $("#syncText");
  let cls = "ok", text = "已同步";
  if (S.saving) { cls = "busy"; text = "儲存中…"; }
  else if (S.conflict) { cls = "err"; text = "版本衝突"; }
  else if (S.pending && S.offline) { cls = "err"; text = "離線・未上傳"; }
  else if (S.pending && S.saveError) { cls = "err"; text = "儲存失敗・按此重試"; }
  else if (S.pending) { cls = "busy"; text = "等待儲存…"; }
  else if (S.offline) { cls = "err"; text = "離線・已存版本"; }
  else if (S.savedAt) text = "已同步 " + new Date(S.savedAt).toLocaleTimeString("zh-HK", { hour: "2-digit", minute: "2-digit", hour12: false });
  if (dot) dot.className = cls;
  if (t) t.textContent = text;
  const u = $("#undoBtn"); if (u) u.disabled = !S.undo.length;
}

let toastTimer;
function toast(msg, withUndo = false) {
  return; // 已取消所有彈出通知（復原在標題旁的按鈕）
  const el = $("#toast");
  el.innerHTML = `<span>${esc(msg)}</span>` + (withUndo ? `<button data-act="undo">復原</button>` : "");
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), withUndo ? 6000 : 2600);
}

// ---------- 匯率 ----------
async function fetchRate(cur) {
  const tries = [
    async () => { const r = await fetch(`https://api.frankfurter.app/latest?from=${cur}&to=HKD`); const j = await r.json(); return j.rates && j.rates.HKD; },
    async () => { const r = await fetch(`https://open.er-api.com/v6/latest/${cur}`); const j = await r.json(); return j.rates && j.rates.HKD; },
  ];
  for (const t of tries) { try { const v = await t(); if (v) return +v; } catch {} }
  throw new Error("暫時取得不到匯率");
}
async function updateRate(manualClick) {
  const m = S.doc.meta = S.doc.meta || {};
  const cur = m.currency || "JPY";
  if (cur === "HKD") { m.rate = 1; m.rateDate = Date.now(); quietSave(); render(); return; }
  try {
    const rate = await fetchRate(cur);
    m.rate = rate; m.rateDate = Date.now(); m.rateManual = false;
    quietSave(); render();
    if (manualClick) toast(`匯率已更新：1 ${cur} = ${rate.toFixed(4)} HKD`);
  } catch (e) { if (manualClick) toast(e.message + "，可以在旅程設定手動輸入"); }
}
function autoRate() {
  const m = (S.doc && S.doc.meta) || {};
  if (!navigator.onLine || m.rateManual) return;
  if (!m.rate || !m.rateDate || Date.now() - m.rateDate > 12 * 3600e3) updateRate(false);
}

// ---------- 圖片 ----------
async function compress(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    let maxW = 1300, maxH = 3400, q = 0.82, blob;
    for (let attempt = 0; attempt < 4; attempt++) {
      const s = Math.min(1, maxW / img.naturalWidth, maxH / img.naturalHeight);
      const c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      blob = await new Promise((r) => c.toBlob(r, "image/jpeg", q));
      if (blob.size < 1_200_000) break;
      maxW = Math.round(maxW * 0.8); maxH = Math.round(maxH * 0.8); q -= 0.08;
    }
    return blob;
  } finally { URL.revokeObjectURL(url); }
}
async function uploadFiles(files, onProgress) {
  const ids = [];
  for (const f of files) {
    onProgress && onProgress(ids.length, files.length);
    const blob = await compress(f);
    const r = await fetch("/api/photos", { method: "POST", headers: { "content-type": "image/jpeg" }, body: blob });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || "上傳失敗");
    ids.push(data.id);
  }
  return ids;
}
const photoUrl = (id) => "/api/photos/" + encodeURIComponent(id);

// ---------- 畫面 ----------
const isIdeas = (d) => d && (d.id === "ideas" || (d.kind === "info" && /備選/.test((d.label || "") + (d.title || ""))));
const noteIcon = (d) => d.id === "stay" || /住宿/.test(d.label) ? "bed" : isIdeas(d) ? "bulb" : "note";

function renderChrome() {
  const m = S.doc.meta || {};
  $("#brand").innerHTML = `<div style="min-width:0;flex:1"><div class="kicker">${esc(m.dates || "")}</div>
    <h1>${esc(m.name || m.title || "Trip.")}<small>${esc(m.subtitle || m.title || "")}</small></h1></div>
    <div class="status">
      <button class="sync" data-act="sync" id="syncBtn" aria-label="同步狀態"><i id="syncDot"></i><span id="syncText"></span></button>
      <div class="status-btns">
        <button class="iconbtn sm" data-act="refresh" id="refreshBtn" aria-label="刷新：讀取最新內容">${icon("refresh")}</button>
        <button class="iconbtn sm" data-act="undo-btn" id="undoBtn" aria-label="復原" disabled>${icon("undo")}</button>
      </div></div>`;
  const notes = S.doc.days.filter((x) => x.kind !== "day");
  const days = S.doc.days.filter((x) => x.kind === "day");
  $("#tabs").innerHTML = `<div class="rowtabs" role="tablist" aria-label="備注">
      <button class="ntab menu" data-act="menu" aria-label="菜單">${icon("menu")}</button>
      ${notes.map((x) => `<button class="ntab" data-act="tab" data-id="${esc(x.id)}" aria-pressed="${x.id === S.dayId}">${icon(noteIcon(x))}${esc(x.label)}</button>`).join("")}
      <button class="ntab" data-act="tab" data-id="${MONEY}" aria-pressed="${S.dayId === MONEY}">${icon("wallet")}支出</button>
      <button class="ntab" data-act="tab" data-id="${DIARY}" aria-pressed="${S.dayId === DIARY}">${icon("book")}日記</button>
      <button class="addtab" data-act="add-day" data-kind="info" aria-label="新增備注頁">＋</button>
    </div>
    <div class="rowtabs" role="tablist" aria-label="旅遊日">
      ${days.map((x) => `<button class="dtab" data-act="tab" data-id="${esc(x.id)}" aria-pressed="${x.id === S.dayId}">${esc(x.label)}<small>${esc(x.sub || "")}</small></button>`).join("")}
      <button class="addtab day" data-act="add-day" data-kind="day" aria-label="新增一天">＋</button>
    </div>
    ${S.dayId !== MONEY && S.dayId !== DIARY && day() ? `<div class="toprow3">
      ${day().kind === "day" ? `<div class="switch"><button data-act="view" data-id="list" aria-pressed="${S.view !== "map"}">${icon("list")} 行程</button><button data-act="view" data-id="map" aria-pressed="${S.view === "map"}">${icon("map")} 是日路線</button></div>` : `<div class="grow"></div>`}
      <button class="manage" data-act="manage" aria-pressed="${S.manage}">${icon(S.manage ? "check" : "sliders")}${S.manage ? "完成" : "整理"}</button>
      <button class="manage add" data-act="add" aria-label="新增">${icon("plus")}新增</button></div>`
    : S.dayId === MONEY ? `<div class="toprow3"><div class="grow"></div><button class="manage add" data-act="add">${icon("plus")}新增支出</button></div>`
    : S.dayId === DIARY ? `<div class="toprow3"><div class="switch"><button data-act="diary-filter" data-id="done" aria-pressed="${S.diaryAll !== true}">${icon("check")} 已完成</button><button data-act="diary-filter" data-id="all" aria-pressed="${S.diaryAll === true}">${icon("list")} 全部行程</button></div></div>` : ""}`;
  const on = $("#tabs [aria-pressed=true]"); if (on) on.scrollIntoView({ block: "nearest", inline: "nearest" });
  document.title = `${m.title || "旅行手帳"}${S.dayId === MONEY ? " · 支出" : S.dayId === DIARY ? " · 日記" : day() ? " · " + day().label : ""}`;
}

function render() {
  if (!S.doc) return;
  if (S.dayId !== MONEY && S.dayId !== DIARY && !S.doc.days.some((d) => d.id === S.dayId)) S.dayId = (S.doc.days.find((d) => d.kind === "day") || S.doc.days[0]).id;
  ls.set(K("day"), S.dayId);
  renderChrome();
  let html = "";
  if (S.conflict) html += `<div class="banner"><b>行程已在其他裝置更新。</b><br>這部手機也有未上傳的修改，請選擇保留哪一個版本。
    <div class="row"><button class="btn" data-act="take-server">載入最新版本</button><button class="btn" data-act="force-save">用我的版本覆蓋</button></div></div>`;
  if (S.dayId === MONEY) { finishRender(html + moneyHTML()); return; }
  if (S.dayId === DIARY) {
    // 正在寫日記時重畫（例如同步），保留輸入位置
    const ae = document.activeElement, key = ae && ae.dataset ? (ae.dataset.journal ? `[data-journal="${ae.dataset.journal}"]` : ae.dataset.memo && ae.classList.contains("de-note") ? `textarea[data-memo="${ae.dataset.memo}"]` : "") : "";
    const sel = key ? [ae.selectionStart, ae.selectionEnd] : null;
    finishRender(html + diaryHTML()); autosizeAll();
    if (key) { const n = $(key); if (n) { n.focus({ preventScroll: true }); n.setSelectionRange(sel[0], sel[1]); } }
    return;
  }

  const d = day();
  const q = S.q.trim().toLowerCase();
  html += `<div class="dayhead"><div style="min-width:0"><h2>${esc(d.title || d.label)}</h2>${d.subtitle ? `<div class="sub">${esc(d.subtitle)}</div>` : ""}</div>
    <div class="headtools">${S.manage ? `<button class="manage" data-act="edit-day">${icon("pencil")}${d.kind === "day" ? "這天" : "分頁"}</button>` : ""}
</div></div>`;

  if (d.kind === "day") {
    if (S.view === "map") { html += routeViewHTML(d); finishRender(html); drawRouteMap(d); return; }
    const all = seq(d).flatMap(({ item: it }) => [it, ...(it.children || [])]).filter((x) => !isInfo(x));
    const done = all.filter((x) => x.done).length;
    html += `<div class="utilities"><label class="search">${icon("search")}<input type="search" placeholder="搜尋地點、交通…" value="${esc(S.q)}" data-act="search" aria-label="搜尋行程"></label>
      ${all.length ? `<div class="progress-label">${done} / ${all.length} 已完成<div class="track"><div class="fill" style="width:${(done / all.length) * 100}%"></div></div></div>` : ""}</div>`;
    html += timelineHTML(d, q);
  } else {
    html += `<div class="utilities"><label class="search">${icon("search")}<input type="search" placeholder="搜尋…" value="${esc(S.q)}" data-act="search" aria-label="搜尋"></label></div>`;
    html += listPageHTML(d, q);
  }
  finishRender(html);
}
function finishRender(html) {
  if (S.map) { try { S.map.remove(); } catch {} S.map = null; }
  const main = $("#main");
  const focused = document.activeElement && document.activeElement.dataset.act === "search";
  main.innerHTML = html;
  if (focused) { const s = $("[data-act=search]"); if (s) { s.focus(); s.setSelectionRange(s.value.length, s.value.length); } }
  syncUI();
}

// ---- 行程日：按時段分組 ----
const PERIODS = ["早上", "下午", "晚上"];
function periodOf(min) {
  if (min == null) return null;
  if (min >= 1440) return 2;
  return min < 12 * 60 ? 0 : min < 18 * 60 ? 1 : 2;
}
function nodeStart(n) {
  if (isBranch(n)) { const f = activeRoute(n).items.find((x) => x.start != null); return f ? f.start : null; }
  return n.start;
}
function timelineHTML(d, q) {
  const cf = conflicts(d);
  const hit = (it) => !q || [it, ...(it.children || [])].some((x) => x.variants.some((v) => (v.title + "\n" + (v.summary || "") + "\n" + v.details).toLowerCase().includes(q)));
  // 編號：地點（不含交通、資訊）按次序
  const nums = {}; let n = 0;
  for (const { item } of seq(d)) if (!isInfo(item) && V(item).type !== "transport") nums[item.id] = ++n;
  if (q) {
    const items = seq(d).filter(({ item }) => hit(item));
    if (!items.length) return `<div class="timeline"><div class="empty">找不到「${esc(S.q)}」</div></div>`;
    return `<div class="timeline">${items.map(({ item, idx, branch }) => itemHTML(item, d, cf[item.id], { at: idx, route: branch ? activeRoute(branch).id : "", shared: !branch, num: nums[item.id] })).join("")}</div>`;
  }
  if (!d.items.length) return `<div class="timeline"><div class="empty">還沒有行程<br><button class="btn primary" data-act="add-main" data-at="-1" style="margin-top:10px">${icon("plus")} 新增第一個行程</button></div></div>`;
  const groups = [[], [], []];
  let last = 0;
  d.items.forEach((node, i) => { const p = periodOf(nodeStart(node)); if (p != null) last = Math.max(last, p); groups[last].push([node, i]); });
  let html = `<div class="timeline">${S.manage ? insertRow(-1, "在最前面加入", "") : ""}`;
  groups.forEach((g, gi) => {
    if (!g.length) return;
    const key = d.id + ":" + gi;
    const timed = g.flatMap(([node]) => isBranch(node) ? activeRoute(node).items : [node]).filter((x) => x.start != null);
    const count = g.reduce((a, [node]) => a + (isBranch(node) ? activeRoute(node).items.length : 1), 0);
    const range = timed.length ? `${fmt(timed[0].start)}–${fmt(Math.max(...timed.map((x) => endOf(x))))}` : "";
    html += `<details class="period" data-key="${esc(key)}" ${S.closed.has(key) ? "" : "open"}><summary>${PERIODS[gi]}<span class="range">${range}</span><span class="count">${count}</span></summary>`;
    for (const [node, i] of g) {
      if (isBranch(node)) html += branchHTML(d, node, i, cf, nums);
      else html += itemHTML(node, d, cf[node.id], { at: i, route: "", shared: true, num: nums[node.id] });
    }
    html += `</details>`;
  });
  return html + `</div>`;
}

// ---- 備注頁（住宿、備選、自訂） ----
function listPageHTML(d, q) {
  const hit = (it) => !q || it.variants.some((v) => (v.title + "\n" + (v.summary || "") + "\n" + v.details).toLowerCase().includes(q));
  const counts = {};
  for (const n of d.items) { const ty = V(n).type || "place"; counts[ty] = (counts[ty] || 0) + 1; }
  const types = Object.keys(CATS).filter((k) => counts[k]);
  let f = S.ideaFilter;
  if (f !== "all" && !counts[f]) f = "all";
  let html = "";
  if (types.length > 1) {
    html += `<div class="type-tabs">${[["all", "全部", d.items.length], ...types.map((k) => [k, CATS[k][0], counts[k]])].map(([k, label, c]) =>
      `<button class="ttab" style="--c:${k === "all" ? "var(--purple)" : catVar(k)}" data-act="idea-filter" data-id="${k}" aria-pressed="${k === f}">${k === "all" ? "" : icon(catOf(k)[1])}${label}<small>${c}</small></button>`).join("")}</div>`;
  }
  const shown = d.items.map((it, idx) => ({ it, idx })).filter(({ it }) => hit(it) && (f === "all" || (V(it).type || "place") === f));
  html += `<div class="listpage">`;
  html += shown.map(({ it, idx }) => itemHTML(it, d, null, { at: idx, route: "", shared: false })).join("");
  if (!shown.length) html += `<div class="empty">${q ? `找不到「${esc(S.q)}」` : d.items.length ? "這個類型還沒有項目" : isIdeas(d) ? "還沒有項目。<br>在行程「整理」中按「備選」就會放到這裡。" : "還沒有內容。"}</div>`;
  if (S.manage || !d.items.length) {
    const defType = f !== "all" && f !== "info" ? f : "place";
    html += `<div class="insert" style="margin-top:10px"><button data-act="add-main" data-type="${defType}" data-at="${d.items.length - 1}">＋ 新增${f !== "all" && f !== "info" ? CATS[f][0] : "項目"}</button><button class="info" data-act="add-main" data-type="info" data-at="${d.items.length - 1}">ⓘ 資訊</button></div>`;
  }
  return html + `</div>`;
}

// ---- 卡片 ----
function timeLabelLocked(it) {
  const t = timeLabel(it);
  return t ? `${t}${it.locked ? " <small>· 固定</small>" : ""}` : "";
}
// 簡介：沒有填寫時用詳情第一行（去掉「地址：」等標籤）
function summaryOf(v) {
  if (v.summary) return v.summary;
  const line = (v.details || "").split("\n").map((x) => x.trim()).find(Boolean) || "";
  const t = line.replace(/^(地址|地點|交通|搭乘|安排)[：:]\s*/, "");
  return t.length > 42 ? t.slice(0, 40) + "…" : t;
}
// 地圖連結：一直顯示在卡片上（不摺疊）
function mapLinksHTML(v) {
  const maps = (v.links || []).filter((l) => isMapLink(l) && safeUrl(l.url));
  if (!maps.length) return "";
  return `<div class="quick maps">${maps.map((l) => `<a href="${esc(safeUrl(l.url))}" target="_blank" rel="noopener">${icon("nav")}<span>${esc(l.label || "地圖")}</span></a>`).join("")}</div>`;
}
function linksHTML(v) {
  const all = (v.links || []).filter((l) => !isMapLink(l));
  return all.map((l) => {
    const u = safeUrl(l.url); if (!u) return "";
    return `<a href="${esc(u)}" target="_blank" rel="noopener">${icon(isMapLink(l) ? "nav" : "ext")}<span>${esc(l.label || u)}</span></a>`;
  }).join("");
}
// ---------- 旅程日記 ----------
// 旅行相片和感受存在行程本身（it.memo），每天的日記存在 day.journal
const memoOf = (it) => it.memo || { photos: [], note: "" };
const memoPhotosHTML = (it) => (memoOf(it).photos || []).map((p) => `<img src="${esc(photoUrl(p))}" loading="lazy" alt="" data-act="memo-view" data-id="${esc(it.id)}" data-photo="${esc(p)}">`).join("");
// 完成後的摺疊行：相機按鈕
function memoBtn(it) {
  const n = (memoOf(it).photos || []).length;
  return `<button class="memo-btn" data-act="memo-photo" data-id="${esc(it.id)}" aria-label="加入旅行相片">${icon("camera")}${n ? `<b>${n}</b>` : ""}</button>`;
}
function memoStrip(it) {
  const m = memoOf(it);
  if (!(m.photos || []).length && !m.note) return "";
  return `<div class="memo-strip">${m.note ? `<p class="memo-note" data-act="diary-open" data-id="${esc(it.id)}">${esc(m.note)}</p>` : ""}${(m.photos || []).length ? `<div class="memo-photos">${memoPhotosHTML(it)}</div>` : ""}</div>`;
}
// 展開的卡：已完成或已有回憶時顯示「旅行回憶」
function memoSection(it) {
  const m = memoOf(it);
  if (!it.done && !(m.photos || []).length && !m.note) return "";
  return `<div class="memo-sec"><div class="memo-head">${icon("book")}<span>旅行回憶</span>
    <button class="btn small" data-act="memo-photo" data-id="${esc(it.id)}">${icon("camera")}加相片</button>
    <button class="btn small" data-act="diary-open" data-id="${esc(it.id)}">${icon("pencil")}寫日記</button></div>
    ${m.note ? `<p class="memo-note">${esc(m.note)}</p>` : ""}${(m.photos || []).length ? `<div class="memo-photos">${memoPhotosHTML(it)}</div>` : ""}</div>`;
}
function diaryHTML() {
  const m = S.doc.meta || {};
  const days = S.doc.days.filter((x) => x.kind === "day");
  let nDone = 0, nPhotos = 0, nWords = 0;
  const sections = days.map((d) => {
    const items = [];
    for (const { item } of seq(d)) for (const x of [item, ...(item.children || [])]) {
      if (isInfo(x)) continue;
      const mm = memoOf(x);
      if (x.done) nDone++;
      nPhotos += (mm.photos || []).length;
      nWords += (mm.note || "").length;
      if (S.diaryAll || x.done || (mm.photos || []).length || mm.note) items.push([x, x !== item]);
    }
    nWords += (d.journal || "").length;
    const list = items.map(([x, sub]) => {
      const v = V(x), mm = memoOf(x), cat = catOf(v.type || "place");
      return `<li class="dentry ${sub ? "sub" : ""} ${x.done ? "done" : "todo"}" id="de-${esc(x.id)}" style="--c:${catVar(v.type || "place")}">
        <div class="de-dot">${icon(cat[1])}</div>
        <div class="de-body">
          <div class="de-top">${x.start != null ? `<b class="time">${fmt(x.start)}</b>` : ""}<span class="de-cat">${cat[0]}</span>${x.done ? `<span class="de-ok">✓ 已完成</span>` : ""}</div>
          <div class="de-title">${esc(v.title || "（未命名）")}</div>
          ${(mm.photos || []).length ? `<div class="de-photos">${memoPhotosHTML(x)}</div>` : ""}
          <textarea class="de-note" data-memo="${esc(x.id)}" rows="1" placeholder="這一站的感受、吃了甚麼、發生了甚麼…">${esc(mm.note || "")}</textarea>
          <button class="btn small" data-act="memo-photo" data-id="${esc(x.id)}">${icon("camera")}加相片</button>
        </div></li>`;
    }).join("");
    return `<section class="dday" id="dd-${esc(d.id)}">
      <div class="dday-head"><div><div class="kicker">${esc(d.label)}${d.sub ? " · " + esc(d.sub) : ""}</div><h3>${esc(d.title || d.label)}</h3></div></div>
      <textarea class="journal" data-journal="${esc(d.id)}" rows="3" placeholder="寫下今天的旅程經歷…">${esc(d.journal || "")}</textarea>
      ${list ? `<ol class="dlist">${list}</ol>` : `<p class="hint dempty">${S.diaryAll ? "這天未有行程。" : "完成打卡後，這天的行程和旅行相片會出現在這裡。"}</p>`}
    </section>`;
  }).join("");
  return `<div class="diary">
    <div class="dcover"><div class="kicker">${esc(m.dates || "")}</div><h2>${esc(m.title || "旅程日記")}</h2>
      <div class="dstats"><span><b>${nDone}</b> 站已完成</span><span><b>${nPhotos}</b> 張相片</span><span><b>${nWords}</b> 字</span></div>
      <div class="djump">${days.map((d) => `<button class="chip" data-act="diary-jump" data-id="${esc(d.id)}">${esc(d.label)}</button>`).join("")}</div>
      <p class="hint">日記會自動儲存。行程打卡完成後，可以在行程頁按 ${icon("camera")} 加入旅行相片。</p></div>
    ${sections}</div>`;
}
function autosize(t) { t.style.height = "auto"; t.style.height = Math.max(t.scrollHeight + 2, 0) + "px"; }
function autosizeAll() { $$("#main textarea.journal, #main textarea.de-note").forEach(autosize); }
// 日記文字：不重畫頁面，停止輸入後自動儲存
let diaryTimer = null, diaryUndo = false;
function diaryWrite(fn) {
  if (!diaryUndo) { S.undo.push(JSON.stringify(S.doc)); if (S.undo.length > 40) S.undo.shift(); diaryUndo = true; }
  fn(S.doc);
  persistLocal(true);
  clearTimeout(diaryTimer);
  diaryTimer = setTimeout(() => { diaryUndo = false; scheduleSave(); syncUI(); }, 700);
}
function photosHTML(it, v) {
  let photos = "", run = "";
  const flush = () => { if (run) { photos += `<div class="photos">${run}</div>`; run = ""; } };
  for (const p of v.photos || []) {
    const img = `<img src="${esc(photoUrl(p))}" loading="lazy" alt="" data-act="photo" data-id="${esc(it.id)}" data-photo="${esc(p)}">`;
    if (photoModeOf(it, v, p) === "full") { flush(); photos += `<div class="photos full">${img}</div>`; }
    else run += img;
  }
  flush();
  return photos;
}
function costHTML(v, it) {
  const c = v.cost; if (!c || (c.plan == null && c.actual == null)) return "";
  const cur = c.cur || localCur();
  const part = (label, n) => {
    if (n == null) return "";
    const hk = cur !== "HKD" ? toHKD(n, cur) : null;
    return `<span class="tag">${label} <b>${money(n, cur)}</b>${hk != null ? `<span class="hk">≈${money(hk, "HKD")}</span>` : ""}</span>`;
  };
  const over = c.plan != null && c.actual != null && c.actual > c.plan;
  return `<button class="cost" data-act="cost-edit" data-id="${esc(it.id)}" aria-label="修改消費">${icon("wallet")}${part("預計", c.plan)}${part("實際", c.actual)}${over ? `<span class="over">超出預計</span>` : ""}</button>`;
}
// 詳情一直放在頁面上，用 CSS 動畫展開／摺疊（不用重畫整頁）
function detailHTML(it, v, forceOpen) {
  const links = linksHTML(v);
  const inner = `${v.details ? `<div class="detailtext">${esc(v.details)}</div>` : !links && !forceOpen ? `<div class="detailtext hint">尚未填寫詳情</div>` : ""}
    <div class="quick">${links}${!v.cost || (v.cost.plan == null && v.cost.actual == null) ? `<button data-act="cost-edit" data-id="${esc(it.id)}">${icon("wallet")}記錄消費</button>` : ""}</div>`;
  if (forceOpen) return mapLinksHTML(v) + inner;
  return `<div class="dwrap ${S.open.has(it.id) ? "open" : ""}" data-dw="${esc(it.id)}"><div class="dinner">${inner}</div></div>`;
}
function toggleOpen(id) {
  const open = !S.open.has(id);
  open ? S.open.add(id) : S.open.delete(id);
  const dw = $(`[data-dw="${CSS.escape(id)}"]`);
  if (!dw) { render(); return; }
  dw.classList.toggle("open", open);
  $$(`[data-tid="${CSS.escape(id)}"]`).forEach((x) => x.classList.toggle("is-open", open));
  $$(`[data-act=toggle][data-id="${CSS.escape(id)}"]`).forEach((x) => x.setAttribute("aria-expanded", open));
}
function altsHTML(it) {
  if (it.variants.length < 2) return "";
  const k0 = it.active || 0;
  return `<details class="alternatives" ${S.altOpen.has(it.id) ? "open" : ""} data-alt="${esc(it.id)}"><summary>${icon("swap")} ${it.variants.length} 個備選方案 · 目前 ${planLetter(k0)} · 點選切換</summary>
    ${it.variants.map((x, k) => `<div class="altrow"><button class="alt" data-act="variant" data-id="${esc(it.id)}" data-k="${k}" aria-pressed="${k === k0}"><b>${planLetter(k)}</b>${esc(x.title || "未命名")}</button>${k === k0 ? "" : `<button class="altadd" data-act="variant-out" data-id="${esc(it.id)}" data-k="${k}" aria-label="把 ${esc(x.title)} 加入行程">${icon("plus")}加入行程</button>`}</div>`).join("")}
    <div class="hint" style="margin-top:6px">按方案＝切換（取代目前方案）；按「加入行程」＝拆出成獨立一站，放在這項之後。</div></details>`;
}
const checkBtn = (it) => S.manage ? "" : `<span class="checkwrap"><button class="check ${it.done ? "on" : ""}" data-act="done" data-id="${esc(it.id)}" aria-label="${it.done ? "取消完成" : "標記完成"}：${esc(V(it).title)}">${it.done ? "✓" : ""}</button></span>`;
const editTop = (it) => `<button class="edit-top" data-act="edit" data-id="${esc(it.id)}">${icon("pencil")}編輯</button>`;
function collapsed(it) { return it.done && !isInfo(it) && !S.expanded.has(it.id); }
function foldBtn(it) {
  if (!it.done || isInfo(it)) return "";
  return `<button class="fold" data-act="fold" data-id="${esc(it.id)}">${collapsed(it) ? "展開" : "收起"}</button>`;
}
function insertRow(at, label, route) {
  const r = route ? ` data-route="${esc(route)}"` : "";
  return `<div class="insert"><button data-act="add-main" data-at="${at}"${r}>＋ ${label}行程</button><button class="info" data-act="add-main" data-type="info" data-at="${at}"${r}>ⓘ 資訊</button></div>`;
}
function toolsHTML(it, d, pos) {
  const id = esc(it.id);
  const listPage = d.kind !== "day";
  return `<div class="edtools">
    <button data-act="add-child" data-id="${id}">${icon("plus")}子行程</button>
    <button data-act="quick-photo" data-id="${id}">${icon("camera")}圖片</button>
    ${!listPage && pos.shared ? `<button data-act="branch-new" data-id="${id}">${icon("branch")}分叉</button>` : ""}
    ${listPage ? `<button class="strong" data-act="move-in" data-id="${id}">${icon("back")}加回行程</button>` : `<button data-act="move-out" data-id="${id}">${icon("archive")}備選</button>`}
  </div>`;
}
function childHTML(c, d) {
  const v = V(c);
  if (collapsed(c)) return `<div class="child done"><div class="folded">${c.start != null ? `<span class="time">${fmt(c.start)}</span>` : ""}<span class="mini-title">${esc(v.title)}</span>${d.kind === "day" ? memoBtn(c) : ""}${foldBtn(c)}${checkBtn(c)}</div>${d.kind === "day" ? memoStrip(c) : ""}</div>`;
  const info = isInfo(c);
  return `<div class="child ${c.done ? "done" : ""} ${S.open.has(c.id) ? "is-open" : ""}" data-tid="${esc(c.id)}" style="--c:${catVar(v.type)}"><div class="crow"><div class="cbody">
      <div class="taphead" ${info ? "" : `data-act="toggle" data-id="${esc(c.id)}" role="button" aria-expanded="${S.open.has(c.id)}"`}>
      ${c.start != null ? `<div class="time">${timeLabel(c)}</div>` : ""}
      <div class="ctitle">↳ ${esc(v.title || "（未命名）")}${info ? "" : `<span class="chev">${icon("down")}</span>`}</div>
      ${summaryOf(v) ? `<div class="summarytext">${esc(summaryOf(v))}</div>` : ""}</div>
      ${info ? "" : mapLinksHTML(v)}${costHTML(v, c)}${detailHTML(c, v, info)}${photosHTML(c, v)}${d.kind === "day" ? memoSection(c) : ""}${altsHTML(c)}
    </div>${S.manage || info ? editTop(c) : ""}${foldBtn(c)}${info || d.kind !== "day" ? "" : checkBtn(c)}</div></div>`;
}
function itemHTML(it, d, warn, pos = { at: 0, route: "", shared: false }) {
  const v = V(it), type = v.type || "place", cat = catOf(type);
  const listPage = d.kind !== "day";
  const kids = (it.children || []).map((c) => childHTML(c, d)).join("");
  const after = !listPage && S.manage ? insertRow(pos.at, "在這之後加入", pos.route) : "";
  const warnHTML = warn ? `<div class="warn">⚠ ${esc(warn)}</div>` : "";
  const origin = listPage && it.from ? `<span class="origin">· 原本 ${esc(it.from)}</span>` : "";
  const style = `style="--c:${catVar(type)}"`;
  const chev = `<span class="chev">${icon("down")}</span>`;
  const openCls = S.open.has(it.id) ? "is-open" : "";

  if (collapsed(it)) {
    return `<article class="${type === "transport" ? "transport" : "place"} done" ${style}><div class="folded">
      ${it.start != null && !listPage ? `<span class="time">${fmt(it.start)}</span>` : ""}<span class="mini-title">${esc(v.title)}</span>${listPage ? "" : memoBtn(it)}${foldBtn(it)}${checkBtn(it)}</div>${listPage ? "" : memoStrip(it)}</article>${after}`;
  }
  if (type === "info") {
    return `<article class="place info" ${style}>
      <div class="itemtop"><span class="number">${icon("info")}</span><div class="itemmeta"><div class="category">${icon("info")}資訊${origin}</div></div>${editTop(it)}</div>
      <div class="itemtitle"><button>${esc(v.title || "（未命名）")}</button></div>
      ${summaryOf(v) ? `<div class="summarytext">${esc(summaryOf(v))}</div>` : ""}
      ${detailHTML(it, v, true)}${costHTML(v, it)}${photosHTML(it, v)}
      ${kids ? `<div class="children">${kids}</div>` : ""}${altsHTML(it)}
      ${S.manage ? toolsHTML(it, d, pos) : ""}
    </article>${after}`;
  }
  if (type === "transport" && !listPage) {
    return `<article class="transport ${it.done ? "done" : ""} ${openCls}" data-tid="${esc(it.id)}" ${style}>
      <div class="transportline"><button data-act="toggle" data-id="${esc(it.id)}" aria-expanded="${S.open.has(it.id)}">${icon("train")}<span class="tbody">
        ${it.start != null ? `<div class="time">${timeLabel(it)}${it.locked ? " · 固定" : ""}</div>` : ""}${esc(v.title || "（未命名）")}${summaryOf(v) ? `<span class="tsum">${esc(summaryOf(v))}</span>` : ""}</span>${chev}</button>
        ${S.manage ? editTop(it) : ""}${foldBtn(it)}${checkBtn(it)}</div>
      ${warnHTML}${mapLinksHTML(v)}${costHTML(v, it)}${detailHTML(it, v)}${photosHTML(it, v)}${memoSection(it)}
      ${kids ? `<div class="children">${kids}</div>` : ""}${altsHTML(it)}
      ${S.manage ? toolsHTML(it, d, pos) : ""}
    </article>${after}`;
  }
  const num = listPage ? icon(cat[1]) : pos.num != null ? pos.num : icon(cat[1]);
  return `<article class="place ${it.done ? "done" : ""} ${openCls}" data-tid="${esc(it.id)}" ${style}>
    <div class="taphead" data-act="toggle" data-id="${esc(it.id)}" role="button" aria-expanded="${S.open.has(it.id)}">
    <div class="itemtop"><span class="number">${num}</span>
      <div class="itemmeta metaline">${!listPage && it.start != null ? `<span class="time">${timeLabelLocked(it)}</span>` : ""}<span class="category">${icon(cat[1])}${cat[0]}${origin}</span></div>
      ${S.manage ? editTop(it) : ""}${foldBtn(it)}${listPage ? "" : checkBtn(it)}</div>
    ${warnHTML}
    <div class="itemtitle"><span class="ttl">${esc(v.title || "（未命名）")}</span>${chev}</div>
    ${summaryOf(v) ? `<div class="summarytext">${esc(summaryOf(v))}</div>` : ""}</div>
    ${mapLinksHTML(v)}${costHTML(v, it)}${detailHTML(it, v)}${photosHTML(it, v)}${listPage ? "" : memoSection(it)}
    ${kids ? `<div class="children">${kids}</div>` : ""}${altsHTML(it)}
    ${S.manage ? toolsHTML(it, d, pos) : ""}
  </article>${after}`;
}

// 分叉路線：在分叉點顯示路線選擇，只有分叉內的行程會切換
function branchHTML(d, b, bi, cf, nums) {
  const r = activeRoute(b);
  let html = `<div class="branch"><div class="branchhead">${icon("branch")} 分叉路線 · 選擇其中一條<button data-act="branch-edit" data-id="${esc(b.id)}">管理</button></div>
    <div class="branchchoices">${b.routes.map((x, i) => `<button data-act="route" data-branch="${esc(b.id)}" data-id="${esc(x.id)}" aria-pressed="${x.id === r.id}">${planLetter(i)} · ${esc(x.name || "路線 " + planLetter(i))}</button>`).join("")}
    <button class="add" data-act="route-add" data-branch="${esc(b.id)}" aria-label="新增路線">＋</button></div>
    <div class="branch-body">${S.manage ? insertRow(-1, "在路線開頭加入", r.id) : ""}`;
  r.items.forEach((it, k) => { html += itemHTML(it, d, cf[it.id], { at: k, route: r.id, shared: false, num: nums[it.id] }); });
  if (!r.items.length) html += `<div class="empty small">這條路線還沒有行程</div>`;
  html += `</div><div class="branch-end">${icon("branch")} 路線匯合 · 以下行程共用</div></div>`;
  if (S.manage) html += insertRow(bi, "在匯合後加入", "");
  return html;
}

// ---------- 是日路線（地圖） ----------
function placeQuery(link) {
  try {
    const u = new URL(link.url);
    const q = u.searchParams.get("query") || u.searchParams.get("q") || u.searchParams.get("destination");
    if (q) return q;
    const m = u.pathname.match(/\/place\/([^/]+)/);
    if (m) return decodeURIComponent(m[1].replace(/\+/g, " "));
  } catch {}
  return link.label || "";
}
function coordsFromUrl(url) {
  const m = /@(-?\d+\.\d+),(-?\d+\.\d+)/.exec(url || "") || /[?&](?:query|q|ll|destination)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/.exec(url || "");
  return m ? [+m[1], +m[2]] : null;
}
const geoOf = (s) => coordsFromUrl(s.link.url) || (s.link.geo && s.link.geo.q === s.key && s.link.geo.lat != null ? [s.link.geo.lat, s.link.geo.lng] : null) || s.est || null;
// 定位是否為「附近位置」：approx = 用較概括的地址找到；est = 完全找不到，暫放在前後兩站之間
const geoKind = (s) => coordsFromUrl(s.link.url) ? "" : s.link.geo && s.link.geo.q === s.key && s.link.geo.lat != null ? (s.link.geo.approx ? "approx" : "") : s.est ? "est" : "";
// 找不到的地點：用前後已定位的站估計位置（只用來顯示，不會儲存）
function estimateMissing(stops) {
  const real = stops.map((s) => { s.est = null; return geoOf(s); });
  stops.forEach((s, i) => {
    if (real[i] || !(s.link.geo && s.link.geo.q === s.key && s.link.geo.fail)) return;
    let a = null, b = null;
    for (let k = i - 1; k >= 0 && !a; k--) a = real[k];
    for (let k = i + 1; k < stops.length && !b; k++) b = real[k];
    if (a && b) s.est = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    else if (a || b) { const p = a || b; s.est = [p[0] + 0.0012, p[1] + 0.0012]; }
  });
}
const gmapsPlace = (s) => s.link.url;
function gmapsLeg(a, b) {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(a.q)}&destination=${encodeURIComponent(b.q)}&travelmode=transit`;
}
function gmapsRoute(list) {
  return "https://www.google.com/maps/dir/" + list.map((s) => encodeURIComponent(s.q)).join("/");
}
let leafletP = null;
function loadLeaflet() {
  if (window.L) return Promise.resolve();
  return leafletP || (leafletP = new Promise((res, rej) => {
    const c = document.createElement("link");
    c.rel = "stylesheet"; c.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(c);
    const sc = document.createElement("script");
    sc.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    sc.onload = () => res(); sc.onerror = () => { leafletP = null; rej(new Error("地圖需要網絡才能載入")); };
    document.head.appendChild(sc);
  }));
}
// 用 OpenStreetMap 把地點名稱轉成座標（結果存進行程，下次不用再查）
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let geoBusy = false;
async function geocode(q) {
  const r = await fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=zh-TW,ja&q=" + encodeURIComponent(q));
  if (!r.ok) throw new Error("定位服務暫時無法使用");
  const j = await r.json();
  return j[0] ? [+j[0].lat, +j[0].lon] : null;
}
// 第二個定位服務（Photon），景點名稱的模糊搜尋比較好
async function geocodePhoton(q, near) {
  const bias = near ? `&lat=${near[0]}&lon=${near[1]}` : "";
  const r = await fetch("https://photon.komoot.io/api/?limit=1&q=" + encodeURIComponent(q) + bias);
  if (!r.ok) return null;
  const j = await r.json();
  const f = j.features && j.features[0];
  return f ? [+f.geometry.coordinates[1], +f.geometry.coordinates[0]] : null;
}
// 定位步驟（由精確到概括）：
// 1. 地點名稱（OpenStreetMap）→ 2. 地址 → 3. 第二個定位服務（Photon）試名稱和地址
// → 4. 放寬地址：去掉樓層、大廈名，逐步去掉門牌號碼（梅田3-2-2 → 梅田3-2 → 梅田3 → 梅田）→ 5. 行程標題
function geoCandidates(s) {
  const split = (b) => [b, ...b.split(/[・／/|｜（）()、,，]/).map((x) => x.trim()).filter((x) => x && x !== b)];
  const clean = (l) => [...new Set(l.map((x) => (x || "").trim()).filter((x) => x.length > 1))];
  const names = clean([s.q, s.link.label].filter(Boolean).flatMap(split));
  const addrs = clean(s.link.addr ? split(s.link.addr) : []);
  const titles = clean(s.v.title ? split(s.v.title) : []);
  const widen = (b) => {
    const out = [];
    let x = b.replace(/\s*(\d+|[一二三四五六七八九十]+)\s*(F|樓|楼|階)(?![a-z]).*$/i, "");
    out.push(x);
    // 只有像地址的才去掉大廈名和門牌（例如 3-2-2、丁目、市／区）
    if (/\d+[-‐ー－−]\d+|丁目|番地|[市区區町村縣県路街道]/.test(x)) { x = x.split(/[\s　]/)[0]; out.push(x); }
    else return out;
    for (let k = 0; k < 6; k++) {
      const y = x.replace(/[-‐ー－−の]?\d+(番地|番|号|號|丁目)?$/, "");
      if (y === x) break;
      x = y; out.push(x);
    }
    out.push(x.replace(/[\d\-‐ー－−]+$/, ""));
    return out;
  };
  const steps = [
    ...names.map((q) => ({ q })),
    ...addrs.map((q) => ({ q })),
    ...names.slice(0, 2).map((q) => ({ q, photon: true })),
    ...addrs.slice(0, 1).map((q) => ({ q, photon: true })),
    ...clean([...addrs, ...names].flatMap(widen)).map((q) => ({ q, approx: true })),
    ...titles.map((q) => ({ q })),
    ...clean(titles.flatMap(widen)).map((q) => ({ q, approx: true })),
  ];
  const seen = new Set();
  return steps.filter((c) => { const k = (c.photon ? "P" : "N") + c.q; if (c.q.length < 2 || seen.has(k)) return false; seen.add(k); return true; });
}
const kmBetween = (a, b) => Math.hypot((a[0] - b[0]) * 111, (a[1] - b[1]) * 111 * Math.cos(a[0] * Math.PI / 180));
async function geocodeMissing(d) {
  if (geoBusy) return;
  geoBusy = true;
  let changed = false;
  try {
    const all = routeStops(d);
    for (const s of all) {
      const g0 = s.link.geo;
      if (coordsFromUrl(s.link.url) || (g0 && g0.q === s.key && (g0.lat != null || (g0.fail && g0.v >= 2)))) continue;
      const st = $("#geoStatus"); if (st) st.textContent = `正在定位「${s.q}」…`;
      // 其他已定位地點的中心，用來排除去了別的城市的結果
      const known = all.map((x) => x !== s && x.link.geo && x.link.geo.lat != null ? [x.link.geo.lat, x.link.geo.lng] : coordsFromUrl(x.link.url)).filter(Boolean);
      const mid = known.length ? [known.map((p) => p[0]).sort((a, b) => a - b)[known.length >> 1], known.map((p) => p[1]).sort((a, b) => a - b)[known.length >> 1]] : null;
      const ok = (p, approx) => p && (!mid || known.length < 2 || kmBetween(p, mid) < (approx ? 60 : 400));
      let hit = null, by = null, approx = false;
      for (const c of geoCandidates(s)) {
        const p = c.photon ? await geocodePhoton(c.q, mid).catch(() => null) : await geocode(c.q).catch(() => null);
        await sleep(c.photon ? 300 : 1100);
        if (ok(p, !!c.approx)) { hit = p; by = c.q; approx = !!c.approx; break; }
      }
      s.link.geo = hit ? { q: s.key, lat: hit[0], lng: hit[1], ...(approx ? { approx: true, by } : {}) } : { q: s.key, fail: true, v: 2 };
      changed = true;
      if (S.view === "map" && day() === d) drawRouteMap(d, true);
    }
  } finally {
    geoBusy = false;
    if (changed) { persistLocal(true); scheduleSave(); }
    const st = $("#geoStatus"); if (st) st.textContent = "";
  }
}
// 每張圖片的顯示方式：圖片自己的設定 → 行程的設定 → 底部按鈕的整體設定
function photoModeOf(it, v, p) {
  const own = v.photoModes && v.photoModes[p];
  if (own === "full" || own === "thumb") return own;
  if (it.photoMode === "full" || it.photoMode === "thumb") return it.photoMode;
  return S.photoMode;
}
const MODE_LABEL = { auto: "跟隨", full: "大圖", thumb: "縮圖" };
function timeLabel(it) {
  if (it.start == null) return "";
  const v = V(it);
  return v.dur ? `${fmt(it.start)}–${fmt(it.start + v.dur)}` : fmt(it.start);
}

// ---------- 是日路線（新版畫面） ----------
function routeStops(d) {
  const stops = [];
  const add = (it, sub) => {
    const v = V(it);
    const link = (v.links || []).find(isMapLink);
    if (link) { const q = placeQuery(link); stops.push({ it, v, link, sub, q, key: link.addr ? q + "｜" + link.addr : q, type: v.type || "place" }); }
  };
  for (const { item } of seq(d)) { add(item, false); for (const c of item.children || []) add(c, true); }
  estimateMissing(stops);
  return stops;
}
const stopDim = (s) => S.mapFilter !== "all" && s.type !== S.mapFilter;
function routeViewHTML(d) {
  const stops = routeStops(d);
  const hasBranch = d.items.some(isBranch);
  if (!stops.length) return `<div class="route-wrap"><div class="empty">這天的行程還沒有加入地圖地點。<br>在行程「編輯 → 📍 地圖」填上地點名稱，就會顯示在這裡。</div></div>`;
  if (S.mapSel == null || S.mapSel >= stops.length || S.mapDay !== d.id) { S.mapSel = 0; S.mapDay = d.id; }
  const types = Object.keys(CATS).filter((t) => stops.some((s) => s.type === t));
  const chunks = [];
  for (let i = 0; i < stops.length; i += 9) chunks.push(stops.slice(i === 0 ? 0 : i - 1, i + 9));
  // 分類篩選：圓角圖示按鈕
  let html = `<div class="mfilters">${[["all", "全部", "layers"], ...types.map((t) => [t, catOf(t)[0], catOf(t)[1]])].map(([k, t, ic]) =>
    `<button data-act="map-filter" data-id="${k}" aria-pressed="${S.mapFilter === k}" style="--c:${k === "all" ? "var(--purple)" : catVar(k)}"><span class="mf-ic">${icon(ic)}</span>${t}</button>`).join("")}</div>`;
  html += `<div class="route-wrap"><div class="route-box"><div id="routeMap" class="route-map"><div class="map-msg">地圖載入中…</div></div>
    <div class="map-label">${esc(d.label)} / 行程路線</div></div>
    <div id="stopCard">${stopCardHTML(d, stops)}</div>
    <p class="hint" id="geoStatus"></p>
    <div class="route-actions">${chunks.map((c, i) => `<a class="btn" href="${esc(gmapsRoute(c))}" target="_blank" rel="noopener">${icon("map")} Google 地圖${chunks.length > 1 ? `第 ${i + 1} 段` : "整條路線"}</a>`).join("")}</div>
    ${hasBranch ? `<p class="hint">有分叉路線的話，這裡顯示的是目前選擇的路線。</p>` : ""}
    <p class="hint">按圓圈數字在地圖上查看；按行程可以直接修改地點。</p>
    <ol class="stops">`;
  // 列出這天所有行程（資訊卡除外），沒有地點的也列出
  const all = [];
  for (const { item } of seq(d)) { all.push([item, false]); for (const c of item.children || []) all.push([c, true]); }
  let si = 0;
  for (const [it, sub] of all) {
    const v = V(it);
    if ((v.type || "place") === "info") continue;
    const s = stops[si] && stops[si].it === it ? stops[si] : null;
    if (s) {
      const i = si++;
      if (i > 0) html += `<li class="leg"><a href="${esc(gmapsLeg(stops[i - 1], s))}" target="_blank" rel="noopener">${icon("train")} ${i} → ${i + 1} 交通路線</a></li>`;
      html += `<li class="${sub ? "sub" : ""} ${stopDim(s) ? "dim" : ""} ${i === S.mapSel ? "sel" : ""}" style="--c:${catVar(s.type)}" data-act="place-edit" data-id="${esc(it.id)}" data-i="${i}"><span class="num" data-act="map-sel" data-i="${i}">${i + 1}</span><div class="st-body">
        <div>${it.start != null ? `<b class="time">${fmt(it.start)}</b> ` : ""}${esc(v.title)}${sub ? ` <small class="hint">子行程</small>` : ""}</div>
        <span class="st-place">${icon(catOf(s.type)[1])} ${esc(s.link.label || s.q)}</span>${s.link.addr ? `<span class="st-addr">${esc(s.link.addr)}</span>` : ""}
        <span class="st-geo" data-i="${i}"></span></div><span class="st-edit">${icon("pencil")}</span></li>`;
    } else {
      const ty = v.type || "place";
      html += `<li class="${sub ? "sub" : ""} noplace ${S.mapFilter !== "all" && ty !== S.mapFilter ? "dim" : ""}" style="--c:${catVar(ty)}" data-act="place-edit" data-id="${esc(it.id)}"><span class="num">·</span><div class="st-body">
        <div>${it.start != null ? `<b class="time">${fmt(it.start)}</b> ` : ""}${esc(v.title)}${sub ? ` <small class="hint">子行程</small>` : ""}</div>
        <span class="st-place add">＋ 加入地點</span></div></li>`;
    }
  }
  return html + `</ol></div>`;
}
// 選中的地點：資料卡
function stopCardHTML(d, stops) {
  const s = stops[S.mapSel]; if (!s) return "";
  if (S.cardOff) return `<button class="btn small card-show" data-act="card-show">${icon("map")} 顯示地點資料卡</button>`;
  const cat = catOf(s.type);
  const sum = summaryOf(s.v);
  return `<div class="stopcard" style="--c:${catVar(s.type)}">
    <div class="sc-top"><span class="sc-kicker">STOP ${String(S.mapSel + 1).padStart(2, "0")} / ${esc(d.label)}</span><span class="sc-r"><span class="sc-chip">${icon(cat[1])}${cat[0]}</span><button class="sc-x" data-act="card-close" aria-label="關閉">✕</button></span></div>
    <h3>${esc(s.v.title)}</h3>
    <div class="sub">${s.it.start != null ? `${timeLabel(s.it)} · ` : ""}${esc(sum || s.link.label || s.q)}</div>
    ${geoKind(s) ? `<div class="sc-approx">≈ 地圖上是大約位置，「開啟導航」會用你填寫的 Google 地圖連結</div>` : ""}
    <div class="sc-actions"><a class="btn primary" href="${esc(gmapsPlace(s))}" target="_blank" rel="noopener">${icon("nav")} 開啟導航</a>
      ${S.mapSel > 0 ? `<a class="btn" href="${esc(gmapsLeg(stops[S.mapSel - 1], s))}" target="_blank" rel="noopener">${icon("train")} 由上一站前往</a>` : ""}
      <button class="btn" data-act="map-goto" data-id="${esc(s.it.id)}">查看行程</button></div>
    <div class="sc-nav"><button class="btn small" data-act="map-step" data-dir="-1" ${S.mapSel === 0 ? "disabled" : ""}>‹ 上一站</button><span class="hint">${S.mapSel + 1} / ${stops.length}</span><button class="btn small" data-act="map-step" data-dir="1" ${S.mapSel >= stops.length - 1 ? "disabled" : ""}>下一站 ›</button></div>
  </div>`;
}
function pinIcon(s, i) {
  return L.divIcon({ className: "", iconSize: [34, 34], iconAnchor: [17, 17],
    html: `<div class="mpin ${geoKind(s)} ${stopDim(s) ? "dim" : ""} ${i === S.mapSel ? "sel" : ""} ${s.sub ? "sub" : ""}" style="--c:${catVar(s.type)}"><b>${i + 1}</b><span class="mbadge">${icon(catOf(s.type)[1])}</span></div>` });
}
// 只更新選取狀態（不重畫整張地圖）
function selectStop(d, i, pan) {
  const stops = routeStops(d);
  if (!stops[i]) return;
  S.mapSel = i;
  const card = $("#stopCard"); if (card) card.innerHTML = stopCardHTML(d, stops);
  $$(".stops li[data-i]").forEach((li) => li.classList.toggle("sel", +li.dataset.i === i));
  if (S.map && S.markers) {
    S.markers.forEach((m, k) => {
      if (!m) return;
      m.setIcon(pinIcon(stops[k], k));
      m.setZIndexOffset(k === i ? 1000 : 0);
      m.unbindTooltip();
      if (k === i) m.bindTooltip(`<b>${esc(stops[k].v.title)}</b><span style="color:${catVar(stops[k].type)}">${catOf(stops[k].type)[0]}</span>`, { permanent: true, direction: "right", offset: [18, 0], className: "mtip" }).openTooltip();
    });
    const g = geoOf(stops[i]);
    if (pan && g) S.map.panTo(g, { animate: true });
  }
}
async function drawRouteMap(d, noGeocode) {
  const el = $("#routeMap"); if (!el) return;
  try { await loadLeaflet(); } catch (e) { el.innerHTML = `<div class="map-msg">${esc(e.message)}，下面的 Google 地圖連結仍可使用。</div>`; return; }
  if (!$("#routeMap") || S.view !== "map") return;
  const stops = routeStops(d);
  const first = !S.map;
  if (!S.map) {
    el.innerHTML = "";
    S.map = L.map(el, { zoomControl: false, attributionControl: true });
    L.control.zoom && L.control.zoom({ position: "bottomright" }).addTo(S.map);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(S.map);
    S.layer = L.layerGroup().addTo(S.map);
    // 按地圖空白位置：收起地點名稱的彈出標籤
    S.map.on("click", () => { (S.markers || []).forEach((m) => m && m.unbindTooltip()); });
  }
  S.layer.clearLayers();
  S.markers = [];
  const pts = [];
  estimateMissing(stops);
  stops.forEach((s, i) => {
    const g = geoOf(s);
    const tag = $(`.st-geo[data-i="${i}"]`);
    const k = geoKind(s);
    if (tag) { tag.className = "st-geo " + k; tag.textContent = k === "approx" ? `≈ 地圖上顯示附近位置（${s.link.geo.by}）` : k === "est" ? "≈ 地圖上找不到，暫放在前後兩站之間；按這裡可改名稱" : g ? "" : (s.link.geo && s.link.geo.fail ? "⚠ 地圖上未能定位，按這裡可改用更準確的名稱" : "定位中…"); }
    if (!g) { S.markers.push(null); return; }
    pts.push(g);
    const mk = L.marker(g, { icon: pinIcon(s, i) }).addTo(S.layer);
    mk.on("click", () => { if (S.cardOff) { S.cardOff = false; ls.set("trip.cardOff", ""); } selectStop(d, i, false); });
    S.markers.push(mk);
  });
  const css = getComputedStyle(document.documentElement);
  if (pts.length > 1) L.polyline(pts, { color: css.getPropertyValue("--purple").trim() || "#72598e", weight: 3, opacity: 0.6, dashArray: "6 9" }).addTo(S.layer);
  // 第一次、或新定位到更多地點時，調整地圖範圍
  if (first || !noGeocode || pts.length !== S.fitN) {
    S.fitN = pts.length;
    if (pts.length) {
      const km = (a, b) => Math.hypot((a[0] - b[0]) * 111, (a[1] - b[1]) * 111 * Math.cos(a[0] * Math.PI / 180));
      const sorted = (k) => pts.map((x) => x[k]).sort((a, b) => a - b);
      const mid = [sorted(0)[pts.length >> 1], sorted(1)[pts.length >> 1]];
      const near = pts.filter((x) => km(x, mid) < 150);
      S.map.fitBounds(L.latLngBounds(near.length ? near : pts).pad(0.18), { maxZoom: 15 });
    } else S.map.setView([34.6937, 135.5023], 11);
  }
  selectStop(d, S.mapSel || 0, false);
  if (!noGeocode) geocodeMissing(d);
}

// ---------- 支出表 ----------
// 收集所有消費：行程（目前選擇的路線、方案）＋其他支出
function costRows() {
  const rows = [];
  const add = (it, d, sub) => {
    const v = V(it); const c = v.cost;
    if (!c || (c.plan == null && c.actual == null)) return;
    rows.push({ id: it.id, title: v.title, type: v.type || "place", day: d, sub, plan: c.plan, actual: c.actual, cur: c.cur || localCur(), time: it.start });
  };
  for (const d of S.doc.days) {
    if (isIdeas(d)) continue;
    const list = d.kind === "day" ? seq(d).map((x) => x.item) : d.items;
    for (const it of list) { add(it, d, false); for (const ch of it.children || []) add(ch, d, true); }
  }
  for (const e of S.doc.expenses || []) {
    rows.push({ id: e.id, extra: true, title: e.title, type: e.type || "shop", day: S.doc.days.find((x) => x.id === e.dayId) || null, plan: e.plan, actual: e.actual, cur: e.cur || localCur(), note: e.note });
  }
  return rows;
}
function sumHK(rows, key) {
  let s = 0, missing = 0;
  for (const r of rows) { if (r[key] == null) continue; const h = toHKD(r[key], r.cur); if (h == null) missing++; else s += h; }
  return { s, missing };
}
function sumLocal(rows, key) {
  const cur = localCur();
  let s = 0;
  for (const r of rows) { if (r[key] == null) continue; if (r.cur === cur) s += r[key]; else if (r.cur === "HKD" && S.doc.meta.rate) s += r[key] / S.doc.meta.rate; }
  return s;
}
function moneyCell(n, cur, cmp) {
  if (n == null) return `<span class="none">—</span>`;
  const hk = cur !== "HKD" ? toHKD(n, cur) : null;
  return `<span class="${cmp != null && n > cmp ? "over" : ""}">${money(n, cur)}</span>${hk != null ? `<span class="hk">≈${money(hk, "HKD")}</span>` : ""}`;
}
function moneyHTML() {
  const m = S.doc.meta || {};
  const cur = localCur();
  const rows = costRows();
  const plan = sumHK(rows, "plan"), act = sumHK(rows, "actual");
  const diff = act.s - plan.s;
  let html = `<div class="dayhead"><div><h2>旅行支出表</h2><div class="sub">預計與實際消費 · 以港幣合計</div></div>
    <div class="headtools"><button class="manage" data-act="trip-settings">${icon("gear")}設定</button></div></div><div class="money">`;
  // 整個行程預算（手動設定）
  const b = m.budget;
  const bHK = b && b.amount ? toHKD(b.amount, b.cur || "HKD") : null;
  if (bHK != null) {
    const pctA = Math.min(100, (act.s / bHK) * 100), pctP = Math.min(100, (plan.s / bHK) * 100);
    const left = bHK - act.s;
    html += `<div class="mcard budget"><h3>${icon("wallet")} 行程預算<span class="right"><button class="btn small" data-act="budget-edit">${icon("pencil")}修改</button></span></h3>
      <div class="bnum"><b>${money(b.amount, b.cur || "HKD")}</b>${(b.cur || "HKD") !== "HKD" ? `<span class="hint">≈ ${money(bHK, "HKD")}</span>` : ""}</div>
      <div class="bbar"><i class="p" style="width:${pctP}%"></i><i class="a ${act.s > bHK ? "over" : ""}" style="width:${pctA}%"></i></div>
      <div class="blegend"><span><i class="a"></i>實際 ${money(act.s, "HKD")}（${Math.round((act.s / bHK) * 100)}%）</span><span><i class="p"></i>預計 ${money(plan.s, "HKD")}（${Math.round((plan.s / bHK) * 100)}%）</span></div>
      <div class="bleft ${left < 0 ? "over" : ""}">${left < 0 ? `已超出預算 ${money(-left, "HKD")}` : `尚餘 ${money(left, "HKD")}`}${plan.s > bHK ? `<small>預計消費已超出預算 ${money(plan.s - bHK, "HKD")}</small>` : ""}</div></div>`;
  } else {
    html += `<div class="mcard budget empty-b"><h3>${icon("wallet")} 行程預算</h3><p class="hint" style="margin:0 0 10px">設定整個行程的總預算，就可以看到已用多少、還剩多少。</p><button class="btn primary" data-act="budget-edit">${icon("plus")}設定預算</button></div>`;
  }
  // 匯率
  html += `<div class="mcard"><div class="rate">${icon("swap")}
    ${cur === "HKD" ? `<span>旅程貨幣為港幣，不需要換算。</span>` : m.rate ? `<span>1 ${cur} = <b>${m.rate.toFixed(4)}</b> HKD</span><span class="muted">（${m.rateManual ? "手動輸入" : "自動"} · ${m.rateDate ? new Date(m.rateDate).toLocaleDateString("zh-HK") : ""}）</span>` : `<span>未取得 ${CUR_NAME[cur] || cur} 匯率</span>`}
    ${cur !== "HKD" ? `<button class="btn small" data-act="rate-refresh">${icon("refresh")}更新</button>` : ""}</div>
    ${cur !== "HKD" && m.rate ? `<div class="hint" style="margin-top:6px">例如 ${money(1000, cur)} ≈ ${money(1000 * m.rate, "HKD")}</div>` : ""}</div>`;
  // 總計
  html += `<div class="mcard"><h3>${icon("wallet")} 總計</h3><div class="stats">
    <div class="stat"><div class="k">預計</div><div class="v">${money(plan.s, "HKD")}</div><div class="s">${cur !== "HKD" ? money(sumLocal(rows, "plan"), cur) : ""}</div></div>
    <div class="stat"><div class="k">實際</div><div class="v">${money(act.s, "HKD")}</div><div class="s">${cur !== "HKD" ? money(sumLocal(rows, "actual"), cur) : ""}</div></div>
    <div class="stat ${diff > 0 ? "over" : ""}"><div class="k">${diff > 0 ? "實際多於預計" : "實際少於預計"}</div><div class="v">${money(Math.abs(diff), "HKD")}</div><div class="s">${rows.length} 項</div></div>
    </div>${plan.missing + act.missing ? `<p class="hint" style="margin:8px 0 0">⚠ 有 ${plan.missing + act.missing} 筆使用其他貨幣、未能換算，未計入合計。</p>` : ""}</div>`;
  if (!rows.length) {
    html += `<div class="empty">還沒有消費紀錄。<br>在行程的「編輯 → 消費」輸入預計和實際金額，<br>或按下方「＋ 新增支出」加入其他支出（例如交通卡、手信）。</div></div>`;
    return html;
  }
  // 類別
  const byType = {};
  for (const r of rows) {
    const t = byType[r.type] = byType[r.type] || { plan: 0, act: 0 };
    const p = toHKD(r.plan, r.cur), a = toHKD(r.actual, r.cur);
    if (p != null) t.plan += p; if (a != null) t.act += a;
  }
  const maxT = Math.max(1, ...Object.values(byType).map((x) => Math.max(x.plan, x.act)));
  html += `<div class="mcard"><h3>${icon("sliders")} 分類<span class="right">實際（預計）</span></h3><div class="bars">${Object.entries(byType).sort((a, b) => Math.max(b[1].act, b[1].plan) - Math.max(a[1].act, a[1].plan)).map(([t, x]) =>
    `<div class="bar" style="--c:${catVar(t)}"><span class="lbl">${icon(catOf(t)[1])}${catOf(t)[0]}</span><span class="tr"><i style="width:${(Math.max(x.act, x.plan) / maxT) * 100}%;opacity:${x.act ? 1 : .45}"></i></span><span class="amt">${money(x.act, "HKD")} <span class="hint">(${money(x.plan, "HKD")})</span></span></div>`).join("")}</div></div>`;
  // 每天
  const groups = [];
  for (const d of S.doc.days.filter((x) => !isIdeas(x))) { const g = rows.filter((r) => r.day === d); if (g.length) groups.push([d.label + (d.kind === "day" && d.sub ? " · " + d.sub : ""), g]); }
  const noDay = rows.filter((r) => !r.day); if (noDay.length) groups.push(["全程／其他", noDay]);
  for (const [label, g] of groups) {
    const gp = sumHK(g, "plan").s, ga = sumHK(g, "actual").s;
    html += `<div class="mcard"><h3>${icon("calendar")} ${esc(label)}<span class="right">${money(ga, "HKD")} / ${money(gp, "HKD")}</span></h3>
      <table class="mtable"><thead><tr><th>項目</th><th>預計</th><th>實際</th></tr></thead><tbody>
      ${g.map((r) => `<tr><td><button class="t" data-act="${r.extra ? "expense-edit" : "cost-edit"}" data-id="${esc(r.id)}">${r.sub ? "↳ " : ""}${esc(r.title || "（未命名）")}<small>${r.time != null ? fmt(r.time) + " · " : ""}${catOf(r.type)[0]}${r.extra ? " · 其他支出" : ""}</small></button></td>
        <td>${moneyCell(r.plan, r.cur)}</td><td>${moneyCell(r.actual, r.cur, r.plan)}</td></tr>`).join("")}
      </tbody></table></div>`;
  }
  return html + `<button class="btn" style="width:100%" data-act="expense-new">${icon("plus")} 新增其他支出（交通卡、手信等）</button></div>`;
}

// ---------- 快速記錄消費（不用進入整理模式） ----------
function openCostEditor(id) {
  const f = findItem(id); if (!f) return;
  const v = V(f.item);
  const curs = [...new Set([localCur(), "HKD", v.cost && v.cost.cur].filter(Boolean))];
  const sheet = $("#sheet");
  sheet.className = "sheet";
  sheet.innerHTML = `<div class="sheet-body"><div class="sheet-head"><h2>記錄消費</h2><button class="btn ghost" data-act="close">✕</button></div>
    <p class="hint" style="margin:-6px 0 12px">${esc(f.day.label)}${f.item.start != null ? " · " + fmt(f.item.start) : ""} · <b style="color:var(--ink)">${esc(v.title)}</b>${f.item.variants.length > 1 ? `（方案 ${planLetter(f.item.active || 0)}）` : ""}</p>
    <form id="costForm" onsubmit="return false">${costFields(v.cost, curs)}</form>
    <div class="sheet-foot">${v.cost ? `<button class="btn danger" data-act="cost-clear" data-id="${esc(id)}">清除</button>` : ""}
      <button class="btn" data-act="edit" data-id="${esc(id)}">完整編輯</button><span class="grow"></span>
      <button class="btn" data-act="close">取消</button><button class="btn primary" data-act="cost-save" data-id="${esc(id)}">儲存</button></div></div>`;
  sheet.hidden = false; document.body.style.overflow = "hidden";
  updateCostPreview();
  setTimeout(() => { const i = $("#costForm [name=" + (v.cost && v.cost.plan != null ? "costActual" : "costPlan") + "]"); if (i) i.focus(); }, 80);
}

// ---------- 整個行程預算 ----------
function openBudgetEditor() {
  const b = (S.doc.meta || {}).budget || {};
  const curs = [...new Set(["HKD", localCur()])];
  const sheet = $("#sheet");
  sheet.className = "sheet";
  sheet.innerHTML = `<div class="sheet-body"><div class="sheet-head"><h2>行程預算</h2><button class="btn ghost" data-act="close">✕</button></div>
    <form id="budgetForm" onsubmit="return false"><div class="grid2">
      <label class="field"><span>整個行程預算</span><input type="text" inputmode="decimal" name="amount" value="${b.amount ?? ""}" placeholder="例如：8000"></label>
      <label class="field"><span>貨幣</span><select name="cur">${curs.map((k) => `<option value="${k}" ${k === (b.cur || "HKD") ? "selected" : ""}>${k === "HKD" ? "港幣 HK$" : (CUR_NAME[k] || k) + " " + (CUR[k] || "")}</option>`).join("")}</select></label>
    </div><p class="hint">支出表會以港幣比較「預算」、「預計」和「實際」。</p></form>
    <div class="sheet-foot">${b.amount ? `<button class="btn danger" data-act="budget-clear">清除預算</button>` : ""}<span class="grow"></span><button class="btn" data-act="close">取消</button><button class="btn primary" data-act="budget-save">儲存</button></div></div>`;
  sheet.hidden = false; document.body.style.overflow = "hidden";
  setTimeout(() => $("#budgetForm [name=amount]").focus(), 80);
}

// ---------- 其他支出（不屬於任何行程） ----------
function openExpenseEditor(id) {
  const e = id ? (S.doc.expenses || []).find((x) => x.id === id) : { id: "", title: "", type: "shop", plan: null, actual: null, cur: localCur(), dayId: "", note: "" };
  if (!e) return;
  const curs = [...new Set([localCur(), "HKD", e.cur].filter(Boolean))];
  const sheet = $("#sheet");
  sheet.className = "sheet";
  sheet.innerHTML = `<div class="sheet-body"><div class="sheet-head"><h2>${id ? "編輯支出" : "新增支出"}</h2><button class="btn ghost" data-act="close">✕</button></div>
    <form id="expForm" onsubmit="return false">
      <label class="field"><span>項目</span><input type="text" name="title" value="${esc(e.title)}" placeholder="例如：ICOCA 交通卡、手信"></label>
      <div class="grid2"><label class="field"><span>分類</span><select name="type">${Object.entries(CATS).filter(([k]) => k !== "info").map(([k, c]) => `<option value="${k}" ${k === e.type ? "selected" : ""}>${c[0]}</option>`).join("")}</select></label>
      <label class="field"><span>日期</span><select name="dayId"><option value="">全程／其他</option>${S.doc.days.filter((d) => d.kind === "day").map((d) => `<option value="${esc(d.id)}" ${d.id === e.dayId ? "selected" : ""}>${esc(d.label)} ${esc(d.sub || "")}</option>`).join("")}</select></label></div>
      ${costFields({ plan: e.plan, actual: e.actual, cur: e.cur }, curs)}
      <label class="field"><span>備註</span><input type="text" name="note" value="${esc(e.note || "")}"></label>
    </form>
    <div class="sheet-foot">${id ? `<button class="btn danger" data-act="expense-delete" data-id="${esc(id)}">刪除</button>` : ""}<span class="grow"></span>
      <button class="btn" data-act="close">取消</button><button class="btn primary" data-act="expense-save" data-id="${esc(id)}">儲存</button></div></div>`;
  sheet.hidden = false; document.body.style.overflow = "hidden";
  updateCostPreview();
}
function costFields(c, curs) {
  c = c || {};
  return `<div class="box costbox"><div class="box-title"><span>${icon("wallet")} 消費</span><span class="preview" id="costPreview"></span></div>
    <div class="grid3">
      <label class="field"><span>預計</span><input type="text" inputmode="decimal" name="costPlan" value="${c.plan ?? ""}" placeholder="0"></label>
      <label class="field"><span>實際</span><input type="text" inputmode="decimal" name="costActual" value="${c.actual ?? ""}" placeholder="0"></label>
      <label class="field"><span>貨幣</span><select name="costCur">${curs.map((k) => `<option value="${k}" ${k === (c.cur || curs[0]) ? "selected" : ""}>${k === "HKD" ? "港幣 HK$" : (CUR_NAME[k] || k) + " " + (CUR[k] || "")}</option>`).join("")}</select></label>
    </div><small class="hint">直接輸入當地貨幣金額，會自動換算成港幣。</small></div>`;
}
function readCost(f) {
  const plan = numOrNull(f.costPlan.value), actual = numOrNull(f.costActual.value);
  if (plan == null && actual == null) return null;
  return { plan, actual, cur: f.costCur.value };
}
function updateCostPreview() {
  const el = $("#costPreview"); if (!el) return;
  const f = el.closest("form") || $("#edForm") || $("#expForm");
  if (!f || !f.costCur) return;
  const cur = f.costCur.value;
  const p = numOrNull(f.costPlan.value), a = numOrNull(f.costActual.value);
  if (cur === "HKD") { el.textContent = ""; return; }
  const part = (lbl, n) => { if (n == null) return ""; const h = toHKD(n, cur); return `${lbl} ≈ ${h == null ? "未有匯率" : money(h, "HKD")}`; };
  el.textContent = [part("預計", p), part("實際", a)].filter(Boolean).join(" · ");
}

// ---------- 菜單（旅程、外觀、工具） ----------
function openMenu() {
  const sheet = $("#sheet");
  sheet.className = "sheet drawer";
  const trips = S.trips.length ? S.trips : [{ id: S.tripId, title: (S.doc.meta || {}).title || "目前旅程", dates: (S.doc.meta || {}).dates }];
  const m = S.doc.meta || {};
  sheet.innerHTML = `<div class="sheet-body menu-body"><div class="sheet-head"><h2>旅行手帳</h2><button class="btn ghost" data-act="close" aria-label="關閉">${icon("x")}</button></div>
    <div class="menu-sec">我的旅程</div>
    <div class="menu-list">${trips.map((t) => `<button class="${t.id === S.tripId ? "on" : ""}" data-act="trip-open" data-id="${esc(t.id)}">${icon("suitcase")}<span>${esc(t.id === S.tripId ? m.title || t.title : t.title)}<span class="tsub">${esc(t.id === S.tripId ? m.dates || "" : t.dates || "")}${t.days ? ` · ${t.days} 天` : ""}</span></span></button>`).join("")}
      <button data-act="trip-new">${icon("plus")}新增旅程</button></div>
    <details class="mgmt" id="mgmt" ${S.mgmtOpen ? "open" : ""}>
      <summary>${icon("sliders")}<span>行程管理<span class="tsub">${esc(m.title || "")}</span></span>${icon("down")}</summary>
      <div class="menu-list">
        <button data-act="trip-settings">${icon("gear")}旅程設定（名稱、日期、貨幣）</button>
        <button data-act="pdf-open">${icon("note")}匯出 PDF 手冊</button>
        <button data-act="revisions">${icon("history")}版本紀錄（可還原）</button>
        <button data-act="export">${icon("download")}匯出行程 JSON</button>
        <button data-act="import">${icon("upload")}匯入行程 JSON</button>
        <button data-act="reload">${icon("refresh")}重新載入最新版本</button>
        ${trips.length > 1 ? `<button data-act="trip-delete">${icon("trash")}刪除這個旅程</button>` : ""}
      </div>
    </details>
    <div class="menu-grow"></div>
    <div class="menu-sec">外觀</div>
    <div class="seg">${[["light", "sun", "淺色"], ["dark", "moon", "深色"], ["auto", "auto", "跟隨系統"]].map(([k, i, t]) => `<button data-act="theme" data-id="${k}" aria-pressed="${S.theme === k}">${icon(i)}${t}</button>`).join("")}</div>
    <div class="seg" style="margin-top:8px">${[["thumb", "image", "圖片縮圖"], ["full", "image", "圖片大圖"]].map(([k, i, t]) => `<button data-act="photo-mode" data-id="${k}" aria-pressed="${S.photoMode === k}">${icon(i)}${t}</button>`).join("")}</div>
    <p class="hint" style="margin-top:14px">這個網站是公開的，任何人有網址都可以查看和編輯。所有修改都會留下版本紀錄。</p>
    <input type="file" id="importFile" accept="application/json,.json" hidden></div>`;
  sheet.hidden = false; document.body.style.overflow = "hidden";
  loadTrips().then(() => { if (!sheet.hidden && sheet.classList.contains("drawer") && S.trips.length !== trips.length) openMenu(); });
}

// ---------- PDF 手冊（排版好的列印頁，用系統「列印 → 儲存為 PDF」） ----------
function openPdfOptions() {
  const sheet = $("#sheet");
  sheet.className = "sheet";
  const days = S.doc.days.filter((d) => d.kind === "day");
  sheet.innerHTML = `<div class="sheet-body"><div class="sheet-head"><h2>匯出 PDF 手冊</h2><button class="btn ghost" data-act="close">✕</button></div>
    <form id="pdfForm" onsubmit="return false">
      <div class="field"><span>包括哪幾天</span>${days.map((d) => `<label class="checkline"><input type="checkbox" name="day" value="${esc(d.id)}" checked><span>${esc(d.label)} · ${esc(d.title || "")}</span></label>`).join("")}</div>
      <div class="field"><span>內容</span>
        <label class="checkline"><input type="checkbox" name="details" checked><span>詳情（地址、交通、營業時間）</span></label>
        <label class="checkline"><input type="checkbox" name="notes" checked><span>備注頁（住宿等，不包括備選地點）</span></label>
        <label class="checkline"><input type="checkbox" name="alts"><span>備選方案及其他分叉路線</span></label>
        <label class="checkline"><input type="checkbox" name="money" checked><span>消費及支出表</span></label>
        <label class="checkline"><input type="checkbox" name="photos"><span>圖片<small>檔案會比較大</small></span></label>
        <label class="checkline"><input type="checkbox" name="links" checked><span>連結（列出網址）</span></label>
      </div>
    </form>
    <p class="hint">按「產生手冊」後會開啟排版好的頁面，再按「列印／儲存為 PDF」。iPhone：在列印畫面按「分享」→「儲存到檔案」即可得到 PDF。</p>
    <div class="sheet-foot"><span class="grow"></span><button class="btn" data-act="close">取消</button><button class="btn primary" data-act="pdf-make">產生手冊</button></div></div>`;
  sheet.hidden = false; document.body.style.overflow = "hidden";
}
function handbookHTML(o) {
  const m = S.doc.meta || {};
  const cur = localCur();
  const fmtCost = (c) => {
    if (!c || (c.plan == null && c.actual == null)) return "";
    const one = (lbl, n) => { if (n == null) return ""; const h = (c.cur || cur) !== "HKD" ? toHKD(n, c.cur || cur) : null; return `${lbl} ${money(n, c.cur || cur)}${h != null ? `（≈${money(h, "HKD")}）` : ""}`; };
    return `<div class="cost">💴 ${[one("預計", c.plan), one("實際", c.actual)].filter(Boolean).join("　")}</div>`;
  };
  const block = (it, sub) => {
    const v = V(it), type = v.type || "place", cat = catOf(type);
    const links = (v.links || []).filter((l) => safeUrl(l.url));
    let h = `<div class="it ${sub ? "sub" : ""} t-${cat[2]}"><div class="tm">${it.start != null ? timeLabel(it) : ""}${it.locked ? "<br><small>固定</small>" : ""}</div><div class="bd">
      <div class="ti"><span class="cat">${cat[0]}</span>${esc(v.title || "（未命名）")}</div>
      ${summaryOf(v) && !o.details ? `<div class="su">${esc(summaryOf(v))}</div>` : ""}
      ${o.details && v.details ? `<div class="de">${esc(v.details)}</div>` : ""}
      ${o.money ? fmtCost(v.cost) : ""}
      ${o.links && links.length ? `<div class="ln">${links.map((l) => `${isMapLink(l) ? "📍" : "🔗"} ${esc(l.label || "")}<span class="url">${esc(l.url)}</span>`).join("<br>")}</div>` : ""}
      ${o.photos && (v.photos || []).length ? `<div class="ph">${v.photos.map((p) => `<img src="${location.origin}${photoUrl(p)}">`).join("")}</div>` : ""}
      ${o.alts && it.variants.length > 1 ? `<div class="al">備選方案：${it.variants.map((x, k) => `${planLetter(k)}. ${esc(x.title)}${k === (it.active || 0) ? "（目前）" : ""}`).join("　")}</div>` : ""}
    </div></div>`;
    for (const c of it.children || []) h += block(c, true);
    return h;
  };
  let html = `<section class="cover"><div class="k">${esc(m.dates || "")}</div><h1>${esc(m.name || m.title || "")}</h1><div class="s">${esc(m.subtitle || m.title || "")}</div>
    <ol class="toc">${S.doc.days.filter((d) => d.kind === "day" && o.days.includes(d.id)).map((d) => `<li><b>${esc(d.label)}</b> ${esc(d.title || "")}<span>${esc(d.subtitle || "")}</span></li>`).join("")}</ol></section>`;
  if (o.notes) for (const d of S.doc.days.filter((x) => x.kind !== "day" && !isIdeas(x) && x.items.length)) {
    html += `<section class="day"><h2><span>${esc(d.label)}</span>${esc(d.title || "")}</h2>${d.items.map((it) => block(it)).join("")}</section>`;
  }
  for (const d of S.doc.days.filter((x) => x.kind === "day" && o.days.includes(x.id))) {
    html += `<section class="day"><h2><span>${esc(d.label)}${d.sub ? " · " + esc(d.sub) : ""}</span>${esc(d.title || "")}</h2>${d.subtitle ? `<p class="ds">${esc(d.subtitle)}</p>` : ""}`;
    for (const n of d.items) {
      if (isBranch(n)) {
        const r = activeRoute(n);
        html += `<div class="br">⑂ 分叉路線：${esc(r.name || "目前路線")}${o.alts && n.routes.length > 1 ? `<small>（其他：${n.routes.filter((x) => x !== r).map((x) => esc(x.name || "未命名")).join("、")}）</small>` : ""}</div>`;
        html += r.items.map((it) => block(it)).join("");
        if (o.alts) for (const other of n.routes.filter((x) => x !== r)) {
          html += `<div class="br alt">⑂ 另一路線：${esc(other.name || "未命名")}</div>${other.items.map((it) => block(it)).join("")}`;
        }
        html += `<div class="br end">⑂ 路線匯合</div>`;
      } else html += block(n);
    }
    html += `</section>`;
  }
  if (o.money) {
    const rows = costRows().filter((r) => !r.day || r.day.kind !== "day" || o.days.includes(r.day.id));
    if (rows.length) {
      const p = sumHK(rows, "plan").s, a = sumHK(rows, "actual").s;
      html += `<section class="day money"><h2><span>支出</span>旅行支出表</h2>
        <p class="ds">預計合計 ${money(p, "HKD")}　實際合計 ${money(a, "HKD")}${m.rate && cur !== "HKD" ? `　（1 ${cur} = ${m.rate.toFixed(4)} HKD）` : ""}</p>
        <table><thead><tr><th>日期</th><th>項目</th><th>預計</th><th>實際</th></tr></thead><tbody>
        ${rows.map((r) => `<tr><td>${esc(r.day ? r.day.label : "全程")}</td><td>${esc(r.title)}</td><td>${r.plan != null ? money(r.plan, r.cur) : ""}</td><td>${r.actual != null ? money(r.actual, r.cur) : ""}</td></tr>`).join("")}
        </tbody></table></section>`;
    }
  }
  const css = `@page{size:A4;margin:14mm 13mm}*{box-sizing:border-box}body{margin:0;font:10.5pt/1.6 -apple-system,"PingFang TC","Noto Sans TC",sans-serif;color:#2f2838;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .bar{position:sticky;top:0;display:flex;gap:10px;align-items:center;justify-content:space-between;padding:12px 16px;background:#f6f4f0;border-bottom:1px solid #e9e2eb;font-size:14px;z-index:2}
  .bar button{border:0;background:#72598e;color:#fff;border-radius:10px;padding:10px 14px;font-size:15px;white-space:nowrap}.bar .back{background:#fff;color:#72598e;border:1px solid #e9e2eb}.bar .bt{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center}
  .wrap{max-width:780px;margin:0 auto;padding:16px}
  .cover{padding:40px 0 24px;border-bottom:2px solid #72598e;margin-bottom:10px;page-break-after:always}
  .cover .k{letter-spacing:3px;font-size:9pt;color:#877d8d}.cover h1{font:400 46pt/1.1 Georgia,serif;margin:10px 0 6px}.cover .s{color:#72598e;letter-spacing:3px}
  .toc{margin:36px 0 0;padding:0;list-style:none}.toc li{padding:10px 0;border-bottom:1px solid #e9e2eb}.toc b{color:#72598e;margin-right:10px}.toc span{display:block;color:#877d8d;font-size:9.5pt}
  .day{page-break-before:always;break-before:page;margin-top:64px;padding-top:30px;border-top:3px solid #ece5f1}.day:first-of-type{page-break-before:auto}
  .day h2{margin-bottom:8px}.day .ds{margin-bottom:18px}
  h2{font-size:17pt;margin:0 0 4px;display:flex;gap:12px;align-items:baseline}h2 span{font-size:10pt;color:#fff;background:#72598e;border-radius:6px;padding:2px 9px;letter-spacing:1px;white-space:nowrap}
  .ds{color:#877d8d;margin:0 0 12px}
  .it{display:flex;gap:12px;padding:9px 0;border-bottom:1px solid #eee8f0;page-break-inside:avoid}.it.sub{padding-left:22px}.it.sub .ti{font-size:10.5pt}
  .tm{flex:0 0 88px;font-weight:700;font-variant-numeric:tabular-nums;color:#a0603a;font-size:10pt}.tm small{font-weight:400;color:#877d8d}
  .bd{flex:1;min-width:0}.ti{font-weight:700;font-size:11.5pt}.cat{display:inline-block;font-size:8pt;font-weight:500;border-radius:5px;padding:0 6px;margin-right:6px;vertical-align:1px;background:#ece5f1;color:#72598e}
  .t-food .cat{background:#f6e9e0;color:#a86c49}.t-transport .cat{background:#eeedf2;color:#6f6a80}.t-shop .cat{background:#e6efe9;color:#4f7a61}.t-stay .cat{background:#e4edf4;color:#456c8c}.t-flight .cat{background:#f2ebe3;color:#8d7358}.t-info .cat{background:#eeedf2;color:#6c6880}
  .t-transport .ti{font-weight:500;color:#5b5266}
  .su{color:#877d8d;font-size:9.5pt}.de{white-space:pre-wrap;font-size:9.5pt;color:#3f374a;margin-top:3px}.cost{font-size:9.5pt;margin-top:3px}
  .ln{font-size:8.5pt;color:#5b5266;margin-top:4px;word-break:break-all}.ln .url{display:block;color:#9a91a3;margin-bottom:2px}
  .al{font-size:9pt;color:#72598e;margin-top:3px}.ph{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.ph img{max-width:48%;max-height:240px;border-radius:6px}
  .br{margin:12px 0 4px;padding:6px 10px;background:#ece5f1;color:#72598e;border-radius:6px;font-size:9.5pt;font-weight:600}.br small{font-weight:400}.br.alt{background:#f6f4f0}.br.end{background:none;padding:2px 0;font-weight:400}
  table{width:100%;border-collapse:collapse;font-size:9.5pt}th,td{border-bottom:1px solid #eee8f0;padding:6px 4px;text-align:left}th{color:#877d8d;font-weight:500}td:nth-child(3),td:nth-child(4),th:nth-child(3),th:nth-child(4){text-align:right;white-space:nowrap}
  @media print{.bar{display:none}.wrap{padding:0;max-width:none}.day{margin-top:0;padding-top:6mm;border-top:0}}`;
  return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(m.title || "旅行手冊")}</title><style>${css}</style></head>
    <body><div class="bar"><button class="back" onclick="if(window.opener){window.close()}setTimeout(function(){location.href='${location.origin}/'},150)">← 返回行程</button><span class="bt">${esc(m.title || "旅行手冊")}</span><button onclick="window.print()">列印／儲存為 PDF</button></div><div class="wrap">${html}</div>
    <script>window.addEventListener("load",function(){setTimeout(function(){window.print()},400)})<\/script></body></html>`;
}
function makeHandbook() {
  const f = $("#pdfForm");
  const o = { days: $$("#pdfForm [name=day]:checked").map((x) => x.value), details: f.details.checked, notes: f.notes.checked, alts: f.alts.checked, money: f.money.checked, photos: f.photos.checked, links: f.links.checked };
  if (!o.days.length) { toast("請至少選擇一天"); return; }
  const html = handbookHTML(o);
  const w = window.open("", "_blank");
  if (!w) {
    // 被瀏覽器擋住彈出視窗：改為下載 HTML 檔
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    a.download = ((S.doc.meta && S.doc.meta.title) || "旅行手冊") + ".html"; a.click();
    toast("已下載手冊網頁，打開後按「列印／儲存為 PDF」");
    return;
  }
  w.document.open(); w.document.write(html); w.document.close();
  closeSheet();
}
function openTripSettings() {
  const m = S.doc.meta || {};
  const sheet = $("#sheet");
  sheet.className = "sheet";
  sheet.innerHTML = `<div class="sheet-body"><div class="sheet-head"><h2>旅程設定</h2><button class="btn ghost" data-act="close">✕</button></div>
    <form id="tripForm" onsubmit="return false">
      <label class="field"><span>旅程名稱（菜單顯示）</span><input type="text" name="title" value="${esc(m.title || "")}" placeholder="例如：大阪之旅"></label>
      <div class="grid2"><label class="field"><span>大標題</span><input type="text" name="name" value="${esc(m.name || "")}" placeholder="Osaka."></label>
      <label class="field"><span>副標題</span><input type="text" name="subtitle" value="${esc(m.subtitle || "")}" placeholder="大阪旅行手帳"></label></div>
      <label class="field"><span>日期文字</span><input type="text" name="dates" value="${esc(m.dates || "")}" placeholder="23—25 OCTOBER 2026"></label>
      <div class="grid2"><label class="field"><span>當地貨幣</span><select name="currency">${Object.keys(CUR).map((k) => `<option value="${k}" ${k === (m.currency || "JPY") ? "selected" : ""}>${CUR_NAME[k]} ${k}</option>`).join("")}</select></label>
      <label class="field"><span>匯率（1 當地貨幣 = ? 港幣）</span><input type="text" inputmode="decimal" name="rate" value="${m.rate ?? ""}" placeholder="自動取得"></label></div>
      <label class="checkline"><input type="checkbox" name="rateAuto" ${m.rateManual ? "" : "checked"}><span>自動更新匯率<small>每 12 小時從網上更新一次；取消勾選就會一直使用你輸入的匯率。</small></span></label>
    </form>
    <div class="sheet-foot"><span class="grow"></span><button class="btn" data-act="close">取消</button><button class="btn primary" data-act="trip-save">儲存</button></div></div>`;
  sheet.hidden = false; document.body.style.overflow = "hidden";
}
const WEEK = ["日", "一", "二", "三", "四", "五", "六"];
const MONTHS = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
function openTripNew() {
  const today = new Date(); const iso = today.toISOString().slice(0, 10);
  const sheet = $("#sheet");
  sheet.className = "sheet";
  sheet.innerHTML = `<div class="sheet-body"><div class="sheet-head"><h2>新增旅程</h2><button class="btn ghost" data-act="close">✕</button></div>
    <form id="newTripForm" onsubmit="return false">
      <label class="field"><span>旅程名稱</span><input type="text" name="title" placeholder="例如：東京之旅"></label>
      <div class="grid2"><label class="field"><span>大標題</span><input type="text" name="name" placeholder="Tokyo."></label>
      <label class="field"><span>副標題</span><input type="text" name="subtitle" placeholder="東京旅行手帳"></label></div>
      <div class="grid2"><label class="field"><span>出發日期</span><input type="date" name="start" value="${iso}"></label>
      <label class="field"><span>天數</span><input type="number" name="days" value="3" min="1" max="30"></label></div>
      <label class="field"><span>當地貨幣</span><select name="currency">${Object.keys(CUR).map((k) => `<option value="${k}" ${k === "JPY" ? "selected" : ""}>${CUR_NAME[k]} ${k}</option>`).join("")}</select></label>
      <p class="hint">會自動建立每一天的分頁，以及「住宿」和「備選地點」兩個備注頁。之後可以隨時增減。</p>
    </form>
    <div class="sheet-foot"><span class="grow"></span><button class="btn" data-act="close">取消</button><button class="btn primary" data-act="trip-create">建立旅程</button></div></div>`;
  sheet.hidden = false; document.body.style.overflow = "hidden";
  setTimeout(() => $("#newTripForm [name=title]").focus(), 60);
}
function buildTripDoc(f) {
  const title = f.title.value.trim() || "新旅程";
  const n = Math.max(1, Math.min(30, parseInt(f.days.value, 10) || 1));
  const start = f.start.value ? new Date(f.start.value + "T00:00:00") : new Date();
  const dates = [];
  for (let i = 0; i < n; i++) { const x = new Date(start); x.setDate(start.getDate() + i); dates.push(x); }
  const a = dates[0], b = dates[dates.length - 1];
  const dateText = a.getMonth() === b.getMonth()
    ? `${a.getDate()}${n > 1 ? "—" + b.getDate() : ""} ${MONTHS[a.getMonth()]} ${a.getFullYear()}`
    : `${a.getDate()} ${MONTHS[a.getMonth()].slice(0, 3)} — ${b.getDate()} ${MONTHS[b.getMonth()].slice(0, 3)} ${b.getFullYear()}`;
  return {
    title,
    meta: { title, name: f.name.value.trim() || title, subtitle: f.subtitle.value.trim(), dates: dateText, currency: f.currency.value, rate: null, rateDate: null },
    migrations: ["d1-plan-b", "plans-to-branch", "trip-meta"],
    expenses: [],
    days: [
      { id: "stay", kind: "info", label: "住宿", sub: "STAY", title: "住宿資料", subtitle: "", items: [] },
      ...dates.map((x, i) => ({ id: "d" + (i + 1) + "-" + uid().slice(0, 4), kind: "day", label: "DAY " + (i + 1),
        sub: String(x.getMonth() + 1).padStart(2, "0") + "." + String(x.getDate()).padStart(2, "0"),
        title: `${x.getMonth() + 1}月${x.getDate()}日・星期${WEEK[x.getDay()]}`, subtitle: "", items: [] })),
      { id: "ideas", kind: "info", label: "備選地點", sub: "IDEAS", title: "備選地點", subtitle: "未排進行程的地點，可以先放這裡", items: [] },
    ],
  };
}

async function openRevisions() {
  const sheet = $("#sheet");
  sheet.className = "sheet";
  sheet.innerHTML = `<div class="sheet-body"><div class="sheet-head"><h2>版本紀錄</h2><button class="btn ghost" data-act="close">✕</button></div><div id="revList" class="hint">載入中…</div></div>`;
  sheet.hidden = false; document.body.style.overflow = "hidden";
  try {
    const r = await fetch(API("/revisions"), { cache: "no-store" });
    const { revisions } = await r.json();
    $("#revList").innerHTML = revisions.length ? revisions.map((x) =>
      `<div class="rev"><span>第 ${x.version} 版<br><small class="hint">${new Date(x.created_at).toLocaleString("zh-HK", { hour12: false })}</small></span><button class="btn small" data-act="restore" data-id="${x.id}">還原此版本</button></div>`).join("")
      : "還沒有舊版本。";
  } catch (e) { $("#revList").textContent = "載入失敗：" + e.message; }
}
function setTheme(t) {
  S.theme = t;
  if (t === "auto") { delete document.documentElement.dataset.theme; ls.del("trip.theme"); }
  else { document.documentElement.dataset.theme = t; ls.set("trip.theme", t); }
  requestAnimationFrame(() => { const c = getComputedStyle(document.documentElement).getPropertyValue("--p").trim(); if (c) $("#themeColor").setAttribute("content", c); });
}

// ---------- 編輯行程 ----------
let ED = null; // { mode: 'new-main'|'new-child'|'edit', dayId, at, parentId, draft, k, isChild }

function openEditor(opts) {
  let d = day();
  if (opts.mode === "edit") { const f0 = findItem(opts.id); if (f0) d = f0.day; }
  let draft, isChild = false, info = d.kind !== "day";
  if (opts.mode === "edit") {
    const f = findItem(opts.id);
    draft = clone(f.item); isChild = !!f.parent;
  } else if (opts.mode === "new-main") {
    // 找出插入位置前面最近一個有時間的行程（跨越分叉也可以）
    const list = seq(d);
    const pos = insertPos(d, opts.route, opts.at);
    const prevTimed = list.slice(0, pos + 1).reverse().map((x) => x.item).find((x) => x.start != null);
    const firstTimed = list.map((x) => x.item).find((x) => x.start != null);
    let start = info ? null : prevTimed ? endOf(prevTimed) : (firstTimed ? firstTimed.start : 9 * 60);
    if (!info && start == null) start = 9 * 60;
    if (opts.type === "info") start = null;
    draft = newItem(start, opts.type || "place");
    if (opts.type === "info") draft.variants[0].dur = 0;
  } else {
    const f = findItem(opts.id);
    draft = newItem(null); draft.variants[0].dur = 0; isChild = true;
    delete draft.children;
    opts.parentId = f.item.id;
  }
  ED = { ...opts, dayId: d.id, draft, k: draft.active || 0, isChild, info, orig: opts.mode === "edit" ? clone(draft) : null };
  renderEditor();
}

function readForm() {
  const f = $("#edForm"); if (!f) return;
  const v = ED.draft.variants[ED.k];
  v.title = f.tfrom ? joinRoute(f.tfrom.value, f.tto.value) : f.title.value.trim();
  v.summary = f.summary.value.trim();
  const cost = readCost(f); if (cost) v.cost = cost; else delete v.cost;
  v.type = f.type.value;
  v.details = f.details.value.replace(/\s+$/, "");
  v.links = readLinkRows();
  if (f.level) ED.level = f.level.value;
  if (!ED.info && f.start) {
    const s = parseHHMM(f.start.value), e = f.end ? parseHHMM(f.end.value) : null;
    if (f.tdur) { const m = parseInt(f.tdur.value, 10); v.dur = m >= 0 ? m : 0; }
    if (s == null) ED.draft.start = null;
    else {
      const base = ED.orig && ED.orig.start != null && ED.orig.start >= 1440 ? 1440 : 0;
      ED.draft.start = s + base;
    }
    if (f.tdur) { /* 交通：用「交通時間」 */ }
    else if (s != null && e != null) { let dur = e - s; if (dur < 0) dur += 1440; v.dur = dur; }
    else if (e == null) v.dur = 0;
    if (f.locked) ED.draft.locked = f.locked.checked;
  }
  if (v.type === "info") { ED.draft.start = null; v.dur = 0; ED.draft.locked = false; ED.draft.done = false; }
  else if (!ED.info && ED.draft.start == null && !ED.isChild && !f.start) {
    // 由「資訊」改回一般行程：給一個預設時間
    const d = S.doc.days.find((x) => x.id === ED.dayId); const list = seq(d).map((x) => x.item); const i = list.findIndex((x) => x.id === ED.draft.id);
    const prev = list.slice(0, i < 0 ? list.length : i).reverse().find((x) => x.start != null);
    ED.draft.start = prev ? endOf(prev) : 9 * 60; if (!v.dur) v.dur = 60;
  }
  if (f.photoMode.value === "auto") delete ED.draft.photoMode; else ED.draft.photoMode = f.photoMode.value;
}

// 交通：標題拆成「起點 → 終點」
function splitRoute(t) {
  const parts = (t || "").split(/\s*(?:→|->|⇒|➡|➔|＞)\s*/);
  return [parts[0] || "", parts.slice(1).join(" → ")];
}
const joinRoute = (a, b) => (a = a.trim(), b = b.trim(), a && b ? `${a} → ${b}` : a || b);
function arrText(start, dur) {
  if (start == null || !(dur > 0)) return "填出發時間和交通時間，會自動計算到達時間；之後改出發時間，到達時間也會跟著變。";
  return `到達時間：<b>${fmt(start + dur)}</b>（${durText(dur)}）`;
}
function renderEditor() {
  const it = ED.draft, v = it.variants[ED.k];
  const typeInfo = v.type === "info";
  const isTr = v.type === "transport";
  const title = typeInfo ? (ED.mode === "edit" ? "編輯資訊" : "新增資訊") : ED.mode === "edit" ? (ED.isChild ? "編輯子行程" : "編輯行程") : ED.mode === "new-child" ? "新增子行程" : "新增主行程";
  const isMainInDay = !ED.info && !ED.isChild && !typeInfo;
  const showRipple = isMainInDay;
  const rippleLabel = ED.mode === "edit" ? "時間或長度改變時，之後的行程跟著移動" : "自動把之後的行程延後";
  const sheet = $("#sheet");
  sheet.className = "sheet";
  sheet.innerHTML = `<div class="sheet-body" role="dialog" aria-label="${title}">
    <div class="sheet-head"><h2>${title}</h2><button class="btn ghost" data-act="close">✕</button></div>
    ${ED.isChild ? `<p class="hint">子行程顯示在主行程下面，新增或修改都<b>不會</b>改動其他行程的時間。</p>` : ""}
    <form id="edForm" autocomplete="off" onsubmit="return false">
      ${it.variants.length > 1 || ED.mode === "edit" ? `<div class="box"><div class="box-title"><span>備選方案</span><button type="button" class="btn small" data-act="ed-add-variant">＋ 新增方案</button></div>
        <div class="vtabs">${it.variants.map((x, k) => `<button type="button" class="chip ${k === ED.k ? "on" : ""}" data-act="ed-variant" data-k="${k}">${String.fromCharCode(65 + k)}・${esc(x.title || "未命名")}</button>`).join("")}</div>
        <p class="hint">儲存時，目前正在編輯的方案會設為「使用中」。${it.variants.length > 1 ? `<button type="button" class="btn small danger" data-act="ed-del-variant" style="margin-left:6px">刪除此方案</button>` : ""}</p></div>` : ""}
      ${isTr ? (() => { const [a, b] = splitRoute(v.title); return `<div class="field"><span>路線（起點 → 終點）</span><div class="trow">
        <input type="text" name="tfrom" value="${esc(a)}" placeholder="起點，例如：酒店"><span class="tarrow">→</span><input type="text" name="tto" value="${esc(b)}" placeholder="終點，例如：KITTE大阪"></div></div>`; })()
        : `<label class="field"><span>標題</span><input type="text" name="title" value="${esc(v.title)}" placeholder="例如：大阪城公園"></label>`}
      <label class="field"><span>簡介（顯示在標題下面，可留空）</span><input type="text" name="summary" value="${esc(v.summary || "")}" placeholder="例如：梅田・神社參拜與御守"></label>
      ${levelField()}
      <label class="field"><span>類型</span><select name="type">${Object.entries(TYPES).map(([k, t]) => `<option value="${k}" ${k === v.type ? "selected" : ""}>${t}</option>`).join("")}</select></label>
      <label class="field"><span>這個行程的圖片顯示方式（個別圖片可再按下方標籤設定）</span><select name="photoMode">${[["auto", "跟隨整體設定"], ["full", "永遠顯示大圖"], ["thumb", "永遠顯示縮圖"]].map(([k, t]) => `<option value="${k}" ${k === (it.photoMode || "auto") ? "selected" : ""}>${t}</option>`).join("")}</select></label>
      ${typeInfo ? `<p class="hint">資訊不佔時間，不會影響前後行程的時間。</p>` : ""}
      ${ED.info || typeInfo ? "" : isTr ? `<div class="grid2">
        <label class="field"><span>出發時間${ED.isChild ? "（可留空）" : ""}</span><input type="time" name="start" value="${hhmm(it.start)}"></label>
        <label class="field"><span>交通時間（分鐘）</span><input type="number" name="tdur" inputmode="numeric" min="0" step="1" value="${v.dur || ""}" placeholder="例如：25"></label>
      </div><p class="hint" id="arrHint">${arrText(it.start, v.dur)}</p>` : `<div class="grid2">
        <label class="field"><span>開始時間${ED.isChild ? "（可留空）" : ""}</span><input type="time" name="start" value="${hhmm(it.start)}"></label>
        <label class="field"><span>結束時間${ED.isChild ? "（可留空）" : ""}</span><input type="time" name="end" value="${it.start != null && v.dur ? hhmm(it.start + v.dur) : ""}"></label>
      </div>
      ${ED.isChild ? "" : `<label class="checkline"><input type="checkbox" name="locked" ${it.locked ? "checked" : ""}><span>固定時間 🔒<small>航班、訂位等不能移動的行程。前面行程延後時，會停在這裡，不會把它推後。</small></span></label>`}
      ${showRipple ? `<label class="checkline"><input type="checkbox" name="ripple" checked><span>${rippleLabel}</span></label>` : ""}`}
      ${costFields(v.cost, [...new Set([localCur(), "HKD", v.cost && v.cost.cur].filter(Boolean))])}
      <label class="field"><span>詳情（按標題展開時顯示）</span><textarea name="details" placeholder="地址、交通、營業時間、備註…">${esc(v.details)}</textarea></label>
      ${linkSection(v, "map")}
      ${linkSection(v, "web")}
      <div class="field"><span>圖片</span><div class="edit-photos" id="edPhotos">${editPhotos(v)}</div></div>
      <input type="file" id="edFile" accept="image/*" multiple hidden>
    </form>
    <div class="sheet-foot">
      ${ED.mode === "edit" ? `<button class="btn danger" data-act="ed-delete">刪除</button>` : ""}
      ${ED.mode === "edit" && !ED.isChild ? (ED.info ? `<button class="btn" data-act="move-in" data-id="${esc(ED.draft.id)}">↩ 加回</button>` : `<button class="btn" data-act="move-out" data-id="${esc(ED.draft.id)}" aria-label="移到備選">↘ 備選</button>`) : ""}
      ${prevMainOf() ? `<button class="btn" data-act="ed-to-child" aria-label="移到子行程：併入「${esc(V(prevMainOf()).title)}」">↳ 子行程</button>` : ""}
      <span class="grow"></span>
      <button class="btn" data-act="close">取消</button>
      <button class="btn primary" data-act="ed-save">儲存</button>
    </div>
  </div>`;
  sheet.className = "sheet";
  sheet.hidden = false;
  document.body.style.overflow = "hidden";
  updateCostPreview();
}
// 地圖、連結：每行分開填「名稱」和「網址」
// 上一個主行程（「移到子行程」用）
function prevMainOf() {
  if (!ED || ED.mode !== "edit" || ED.isChild || ED.info) return null;
  const d = S.doc.days.find((x) => x.id === ED.dayId); if (!d) return null;
  const list = seq(d).map((x) => x.item);
  const i = list.findIndex((x) => x.id === ED.draft.id);
  for (let k = i - 1; k >= 0; k--) if (!isInfo(list[k]) && V(list[k]).type !== "transport") return list[k];
  return null;
}
// 層級：主行程，或某個主行程下的子行程
function levelField() {
  if (ED.info || ED.mode !== "edit" || V(ED.draft).type === "info") return "";
  const d = S.doc.days.find((x) => x.id === ED.dayId);
  const cur = ED.isChild ? (locate(d, ED.draft.id) || {}).parent?.id : "main";
  const parents = seq(d).map((x) => x.item).filter((x) => x.id !== ED.draft.id && !isInfo(x));
  const hasKids = !ED.isChild && (ED.draft.children || []).length;
  return `<label class="field"><span>層級</span><select name="level">
    <option value="main" ${cur === "main" ? "selected" : ""}>主行程（會影響之後的時間）</option>
    ${parents.map((x) => `<option value="${esc(x.id)}" ${cur === x.id ? "selected" : ""}>子行程：放在「${x.start != null ? fmt(x.start) + " " : ""}${esc(V(x).title)}」下面</option>`).join("")}
  </select>${hasKids ? `<small class="hint">改成子行程時，它原本的子行程也會一起移過去。</small>` : ""}</label>`;
}

function linkSection(v, kind) {
  const rows = (v.links || []).filter((l) => (kind === "map") === isMapLink(l));
  if (!rows.length) rows.push({ label: "", url: "", _blank: true });
  const isMap = kind === "map";
  return `<div class="field linkbox"><span>${isMap ? "📍 地圖" : "↗ 連結"}</span>
    ${rows.map((l) => `<div class="lrow" data-kind="${kind}">
      <input type="text" class="l-label" value="${esc(l.label || "")}" placeholder="${isMap ? "地點名稱（例如：露天神社）" : "連結名稱（例如：官方網站）"}">
      <div class="l-url-row"><input type="url" class="l-url" inputmode="url" autocapitalize="off" value="${esc(l.url || "")}" placeholder="${isMap ? "Google 地圖網址（可留空）" : "https://…"}">
      <button type="button" class="l-del" data-act="link-del" aria-label="刪除">✕</button></div>
      ${isMap ? `<input type="text" class="l-addr" value="${esc(l.addr || "")}" placeholder="地址（地圖找不到名稱時用，可留空）">` : ""}</div>`).join("")}
    <button type="button" class="btn small" data-act="link-add" data-kind="${kind}">＋ 新增${isMap ? "地圖" : "連結"}</button>
    ${isMap ? `<small class="hint">只填地點名稱、網址留空時，會自動用 Google 地圖搜尋這個名稱。是日路線的地圖找不到名稱時，會改用地址定位。</small>` : ""}</div>`;
}
function readLinkRows() {
  const out = [];
  for (const row of $$("#edForm .lrow")) {
    const kind = row.dataset.kind;
    const label = row.querySelector(".l-label").value.trim();
    const raw = row.querySelector(".l-url").value.trim();
    const addr = row.querySelector(".l-addr") ? row.querySelector(".l-addr").value.trim() : "";
    if (!label && !raw && !addr) continue;
    let url = normUrl(raw);
    if (kind === "map" && !raw && (label || addr)) url = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(label || addr);
    const o = { kind, label: label || (url ? url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0] : ""), url: url || "", _raw: raw, _row: row };
    if (addr) o.addr = addr;
    // 保留之前的定位結果（名稱或地址改了的話會自動重新定位）
    const old = ED && ED.draft ? (ED.draft.variants[ED.k].links || []).find((l) => l.geo && l.kind === kind && (l.url === o.url || l.label === o.label)) : null;
    if (old) o.geo = old.geo;
    out.push(o);
  }
  return out;
}

function editPhotos(v) {
  return (v.photos || []).map((p, i) => { const m = (v.photoModes && v.photoModes[p]) || "auto";
    return `<div class="ep"><img src="${esc(photoUrl(p))}" alt=""><button type="button" class="x" data-act="ed-del-photo" data-i="${i}">✕</button><button type="button" class="pm ${m}" data-act="ed-photo-mode" data-i="${i}">${MODE_LABEL[m]}</button></div>`; }).join("")
    + (ED.uploading ? `<div class="ep"><div class="ph">上傳中 ${ED.uploading}</div></div>` : "")
    + `<button type="button" class="addphoto" data-act="ed-add-photo">＋ 圖片</button>`;
}
function closeSheet() {
  $("#sheet").hidden = true; $("#sheet").innerHTML = ""; $("#sheet").className = "sheet"; ED = null;
  document.body.style.overflow = "";
}

function fieldError(name, msg) {
  const f = $("#edForm"); const el = typeof name === "string" ? f && f[name] : name;
  $$(".field-err").forEach((x) => x.remove());
  $$(".invalid").forEach((x) => x.classList.remove("invalid"));
  if (el) {
    el.classList.add("invalid");
    const lab = el.closest(".field") || el.parentElement;
    lab.insertAdjacentHTML("beforeend", `<small class="field-err">⚠ ${esc(msg)}</small>`);
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    setTimeout(() => el.focus(), 250);
  }
  toast("未能儲存：" + msg);
}
function validate() {
  const it = ED.draft, v = V(it);
  const f = $("#edForm");
  if (!v.title) return f.tfrom ? ["tfrom", "請輸入起點和終點"] : ["title", "請輸入標題"];
  if (f.start && !ED.isChild && (!ED.level || ED.level === "main") && v.type !== "info" && !ED.info && !f.start.value) return ["start", "請輸入開始時間（主行程需要時間）"];
  if (f.start && f.end && f.end.value && !f.start.value) return ["start", "已填結束時間，請同時填開始時間"];
  for (const l of v.links || []) {
    if (!l.url) return [l._row.querySelector(".l-url"), l.kind === "map" ? "地圖網址格式不正確" : (l._raw ? "網址格式不正確（需要 https:// 開頭）" : "請填寫連結網址")];
  }
  return null;
}

function saveEditor() {
  try {
    readForm();
    const it = ED.draft;
    it.active = ED.k;
    const ripOn = $("#edForm [name=ripple]") ? $("#edForm [name=ripple]").checked : false;
    const bad = validate();
    if (bad) { fieldError(bad[0], bad[1]); return; }
    // 其他備選方案沒有標題
    for (const x of it.variants) x.links = (x.links || []).map(({ kind, label, url, addr, geo }) => ({ kind: kind || (MAP_RE.test(url) ? "map" : "web"), label, url, ...(addr ? { addr } : {}), ...(geo ? { geo } : {}) }));
    const emptyAlt = it.variants.findIndex((x) => !x.title);
    if (emptyAlt >= 0) { ED.k = emptyAlt; renderEditor(); fieldError("title", `備選方案 ${planLetter(emptyAlt)} 未填標題`); return; }
    const E = ED;
    closeSheet();
    commit((doc) => {
      const d = doc.days.find((x) => x.id === E.dayId);
      if (E.mode === "new-main") {
        const arr = E.route ? findRoute(d, E.route).route.items : d.items;
        const at = E.at + 1;
        arr.splice(at, 0, it);
        if (!E.info && ripOn && it.start != null) {
          const list = seq(d), p = list.findIndex((x) => x.item === it);
          const next = list.slice(p + 1).map((x) => x.item).find((x) => x.start != null);
          const delta = next ? endOf(it) - next.start : 0;
          if (delta > 0) { const n = rippleFrom(d, p, delta); if (n) return { msg: `已加入，之後 ${n} 項延後 ${durText(delta)}` }; }
        }
        return { msg: isInfo(it) ? "已加入資訊（時間不變）" : "已加入行程" };
      }
      if (E.mode === "new-child") {
        const p = locate(d, E.parentId).item;
        (p.children = p.children || []).push(it);
        return { msg: "已加入子行程（其他時間不變）" };
      }
      // edit
      const f = locate(d, it.id);
      if (!f) throw new Error("找不到這個行程，可能已被其他裝置刪除");
      const curLevel = f.parent ? f.parent.id : "main";
      if (E.level && E.level !== curLevel) {
        if (E.level === "main") {
          // 子行程 → 主行程：放在原本主行程之後
          f.arr.splice(f.index, 1);
          const pa = locate(d, f.parent.id);
          it.children = [];
          if (it.start == null) it.start = endOf(f.parent) ?? f.parent.start;
          if (!V(it).dur) V(it).dur = 30;
          pa.arr.splice(pa.index + 1, 0, it);
          return { msg: `已改為主行程，放在「${V(f.parent).title}」之後` };
        }
        const target = locate(d, E.level);
        if (!target) throw new Error("找不到要放入的主行程");
        f.arr.splice(f.index, 1);
        const kids = it.children || [];
        delete it.children;
        target.item.children = target.item.children || [];
        target.item.children.push(it, ...kids);
        return { msg: `已改為「${V(target.item).title}」的子行程（其他時間不變）` };
      }
      if (f.parent) { f.arr[f.index] = it; return { msg: "已儲存" }; }
      const oldEnd = endOf(E.orig);
      const oldStart = E.orig.start;
      f.arr[f.index] = it;
      // 主行程的開始時間改變時，子行程跟著移動
      if (oldStart != null && it.start != null && it.start !== oldStart) {
        const dd = it.start - oldStart;
        for (const c of it.children || []) if (c.start != null && (E.orig.children || []).some((o) => o.id === c.id && o.start === c.start)) c.start += dd;
      }
      if (!E.info && ripOn && oldEnd != null && endOf(it) != null) {
        const delta = endOf(it) - oldEnd;
        const n = ripple(d, it, delta);
        if (n) return { msg: `已儲存，之後 ${n} 項${delta > 0 ? "延後" : "提前"} ${durText(Math.abs(delta))}` };
      }
      return { msg: "已儲存" };
    });
  } catch (err) {
    console.error(err);
    toast("儲存失敗：" + (err.message || err));
  }
}

function deleteFromEditor() {
  const E = ED;
  const isMain = !E.isChild && !E.info;
  const sheet = $("#sheet .sheet-foot");
  sheet.innerHTML = `<span class="grow" style="font-size:14px">確定刪除「${esc(V(E.orig).title)}」？</span>
    ${isMain ? `<button class="btn danger" data-act="ed-delete-go" data-pull="1">刪除並提前之後時間</button>` : ""}
    <button class="btn danger" data-act="ed-delete-go">${isMain ? "只刪除" : "刪除"}</button>
    <button class="btn" data-act="close">取消</button>`;
}
function doDelete(pull) {
  const E = ED; closeSheet();
  commit((doc) => {
    const d = doc.days.find((x) => x.id === E.dayId);
    const f = locate(d, E.orig.id);
    if (!f) return { msg: "這個行程已不存在" };
    if (f.parent) { f.parent.children.splice(f.index, 1); return { msg: "已刪除子行程" }; }
    const dur = endOf(f.item) != null ? V(f.item).dur : 0;
    const p = posOf(d, f.item);
    f.arr.splice(f.index, 1);
    if (pull && dur && p >= 0) { const n = rippleFrom(d, p - 1, -dur); if (n) return { msg: `已刪除，之後 ${n} 項提前 ${durText(dur)}` }; }
    return { msg: "已刪除" };
  });
}

// ---------- 日子 ----------
function openDayEditor(isNew, kind) {
  const n = S.doc.days.filter((x) => x.kind === "day").length + 1;
  const d = isNew ? (kind === "info" ? { id: uid(), kind: "info", label: "備注", sub: "NOTES", title: "備注", subtitle: "", items: [] }
    : { id: uid(), kind: "day", label: "DAY " + n, sub: "", title: "", subtitle: "", items: [] }) : day();
  const sheet = $("#sheet");
  sheet.className = "sheet";
  sheet.innerHTML = `<div class="sheet-body"><div class="sheet-head"><h2>${isNew ? (d.kind === "info" ? "新增備注頁" : "新增一天") : "編輯分頁"}</h2><button class="btn ghost" data-act="close">✕</button></div>
    ${isNew ? `<p class="hint">${d.kind === "info" ? "備注頁放在第一行（例如住宿、購物清單、注意事項）。" : "新的一天會加在第二行。"}</p>` : ""}
    <form id="dayForm" onsubmit="return false">
      <div class="grid2"><label class="field"><span>分頁名稱</span><input type="text" name="label" value="${esc(d.label)}"></label>
      <label class="field"><span>分頁小字（如 10.26）</span><input type="text" name="sub" value="${esc(d.sub)}"></label></div>
      <label class="field"><span>標題</span><input type="text" name="title" value="${esc(d.title)}" placeholder="10月26日（一）"></label>
      <label class="field"><span>副標題</span><input type="text" name="subtitle" value="${esc(d.subtitle)}"></label>
      <label class="field"><span>類型</span><select name="kind"><option value="day" ${d.kind === "day" ? "selected" : ""}>行程日（有時間軸）</option><option value="info" ${d.kind === "info" ? "selected" : ""}>備注頁（住宿、備選等，放第一行）</option></select></label>
      ${isNew ? "" : `<div class="grid2"><button type="button" class="btn" data-act="day-move" data-dir="-1">← 往左移</button><button type="button" class="btn" data-act="day-move" data-dir="1">往右移 →</button></div>`}
    </form>
    <div class="sheet-foot">${isNew ? "" : `<button class="btn danger" data-act="day-delete">刪除分頁</button>`}<span class="grow"></span>
    <button class="btn" data-act="close">取消</button><button class="btn primary" data-act="day-save" data-new="${isNew ? 1 : ""}" data-id="${esc(d.id)}">儲存</button></div></div>`;
  sheet.hidden = false;
  document.body.style.overflow = "hidden";
}

// ---------- 選單 ----------
// ---------- 移到備選／加回行程 ----------
function ideasDayOf(doc, create) {
  let d = doc.days.find((x) => x.id === "ideas") || doc.days.find((x) => x.kind === "info" && /備選/.test(x.label + x.title));
  if (!d && create) { d = { id: "ideas", kind: "info", label: "備選地點", sub: "IDEAS", title: "備選地點", subtitle: "未排進行程的地點，可以先放這裡", items: [] }; doc.days.push(d); }
  return d;
}
function openMoveOut(id) {
  const f = findItem(id); if (!f) return;
  const timed = !f.parent && f.item.start != null && V(f.item).dur;
  const sheet = $("#sheet");
  sheet.className = "sheet";
  sheet.innerHTML = `<div class="sheet-body"><div class="sheet-head"><h2>↘ 移到備選地點</h2><button class="btn ghost" data-act="close">✕</button></div>
    <p>「${esc(V(f.item).title)}」會移到「備選地點」，${f.item.children && f.item.children.length ? "子行程、" : ""}圖片和備選方案都會保留。之後可以在那裡按「↩ 加回行程」放回任何一天。</p>
    <div class="sheet-foot"><span class="grow"></span><button class="btn" data-act="close">取消</button>
    ${timed ? `<button class="btn" data-act="move-out-go" data-id="${esc(id)}">只移走</button><button class="btn primary" data-act="move-out-go" data-pull="1" data-id="${esc(id)}">移走並提前之後時間</button>`
      : `<button class="btn primary" data-act="move-out-go" data-id="${esc(id)}">移到備選</button>`}</div></div>`;
  sheet.hidden = false; document.body.style.overflow = "hidden";
}
function doMoveOut(id, pull) {
  closeSheet();
  commit((doc) => {
    let f = null;
    for (const d of doc.days) { f = locate(d, id); if (f) break; }
    if (!f) return { msg: "找不到這個行程" };
    const d = f.day, it = f.item;
    const dur = !f.parent && it.start != null ? V(it).dur || 0 : 0;
    const p = f.parent ? -1 : posOf(d, it);
    f.arr.splice(f.index, 1);
    let n = 0;
    if (pull && dur && p >= 0) n = rippleFrom(d, p - 1, -dur);
    it.from = `${d.label}${it.start != null ? " " + fmt(it.start) : ""}`;
    it.fromDay = d.id; it.fromStart = it.start;
    it.done = false;
    if (!it.children) it.children = [];
    ideasDayOf(doc, true).items.push(it);
    return { msg: `已移到「備選地點」${n ? `，之後 ${n} 項提前 ${durText(dur)}` : ""}` };
  });
}
function openMoveIn(id, dayId) {
  const days = S.doc.days.filter((x) => x.kind === "day");
  if (!days.length) { toast("還沒有行程日"); return; }
  const f = findItem(id); if (!f) return;
  const d = days.find((x) => x.id === (dayId || f.item.fromDay)) || days[0];
  const list = seq(d);
  const info = isInfo(f.item);
  // 預設放回原本的位置：原本開始時間之前最後一項
  let def = list.length - 1;
  if (d.id === f.item.fromDay && f.item.fromStart != null) {
    def = -1;
    list.forEach((x, k) => { if (x.item.start != null && x.item.start < f.item.fromStart) def = k; });
  }
  const opts = [`<label class="checkline"><input type="radio" name="pos" value="-1" ${def === -1 ? "checked" : ""}><span>放在最前面</span></label>`]
    .concat(list.map((x, k) => `<label class="checkline"><input type="radio" name="pos" value="${k}" ${k === def ? "checked" : ""}><span>${x.item.start != null ? `<b class="time">${fmt(x.item.start)}</b> ` : ""}${esc(V(x.item).title)} <small>之後${x.branch ? `（分叉：${esc(activeRoute(x.branch).name || "目前路線")}）` : ""}</small></span></label>`));
  const sheet = $("#sheet");
  sheet.className = "sheet";
  sheet.innerHTML = `<div class="sheet-body"><div class="sheet-head"><h2>↩ 加回行程</h2><button class="btn ghost" data-act="close">✕</button></div>
    <p class="hint">「${esc(V(f.item).title)}」${f.item.from ? `（原本：${esc(f.item.from)}）` : ""}</p>
    <form id="moveForm" onsubmit="return false">
      <label class="field"><span>加到哪一天</span><select name="day" data-id="${esc(id)}">${days.map((x) => `<option value="${esc(x.id)}" ${x.id === d.id ? "selected" : ""}>${esc(x.label)}　${esc(x.title)}</option>`).join("")}</select></label>
      <div class="field"><span>放在哪裡</span><div class="pos-list">${opts.join("")}</div></div>
      ${info ? "" : `<label class="checkline"><input type="checkbox" name="ripple" checked><span>自動把之後的行程延後</span></label>`}
    </form>
    <div class="sheet-foot"><span class="grow"></span><button class="btn" data-act="close">取消</button><button class="btn primary" data-act="move-in-go" data-id="${esc(id)}">加回行程</button></div></div>`;
  sheet.hidden = false; document.body.style.overflow = "hidden";
}
function scrollChecked() { const c = $("#moveForm [name=pos]:checked"); if (c) c.closest("label").scrollIntoView({ block: "center" }); }
function doMoveIn(id) {
  const form = $("#moveForm");
  const dayId = form.day.value, pos = +(form.querySelector("[name=pos]:checked") || { value: -1 }).value;
  const ripOn = form.ripple ? form.ripple.checked : false;
  closeSheet();
  commit((doc) => {
    let f = null;
    for (const dd of doc.days) { f = locate(dd, id); if (f) break; }
    if (!f) return { msg: "找不到這個項目" };
    const it = f.item;
    f.arr.splice(f.index, 1);
    const d = doc.days.find((x) => x.id === dayId);
    const list = seq(d);
    let arr = d.items, at = 0;
    if (pos >= 0 && list[pos]) { arr = list[pos].arr; at = list[pos].idx + 1; }
    const prevTimed = list.slice(0, pos + 1).reverse().map((x) => x.item).find((x) => x.start != null);
    const firstTimed = list.map((x) => x.item).find((x) => x.start != null);
    const oldStart = it.start;
    if (isInfo(it)) it.start = null;
    else {
      it.start = prevTimed ? endOf(prevTimed) : firstTimed ? firstTimed.start : 9 * 60;
      if (!V(it).dur) V(it).dur = 60;
      const dd = oldStart != null ? it.start - oldStart : 0;
      for (const c of it.children || []) if (c.start != null) c.start += dd;
    }
    delete it.from; delete it.fromDay; delete it.fromStart; it.done = false;
    arr.splice(at, 0, it);
    if (ripOn && it.start != null) {
      const l2 = seq(d), p = l2.findIndex((x) => x.item === it);
      const next = l2.slice(p + 1).map((x) => x.item).find((x) => x.start != null);
      const delta = next ? endOf(it) - next.start : 0;
      if (delta > 0) { const n = rippleFrom(d, p, delta); if (n) return { msg: `已加回 ${d.label} ${fmt(it.start)}，之後 ${n} 項延後 ${durText(delta)}` }; }
    }
    return { msg: `已加回 ${d.label}${it.start != null ? " " + fmt(it.start) : ""}` };
  });
}

function openBranchEditor(bid) {
  const d = day(); const b = findBranch(d, bid); if (!b) return;
  const r = activeRoute(b), i = b.routes.indexOf(r);
  const sheet = $("#sheet");
  sheet.className = "sheet";
  sheet.innerHTML = `<div class="sheet-body"><div class="sheet-head"><h2>分叉路線 ${planLetter(i)}</h2><button class="btn ghost" data-act="close">✕</button></div>
    <form id="routeForm" onsubmit="return false"><label class="field"><span>路線名稱</span><input type="text" name="name" value="${esc(r.name || "")}" placeholder="例如：先參拜，再喫茶"></label></form>
    <p class="hint">分叉前後的行程所有路線共用，只有分叉內的行程會隨路線切換。<br>「解除分叉」會保留目前這條路線的行程，其他路線會刪除。</p>
    <div class="menu-list" style="margin-top:12px">
      <button data-act="route-add" data-branch="${esc(b.id)}">＋ 複製目前路線成新路線</button>
      ${b.routes.length > 1 ? `<button data-act="route-delete" data-branch="${esc(b.id)}">🗑 刪除這條路線</button>` : ""}
      <button data-act="branch-dissolve" data-branch="${esc(b.id)}">⑂ 解除分叉（保留目前路線）</button>
    </div>
    <div class="sheet-foot"><span class="grow"></span><button class="btn" data-act="close">取消</button><button class="btn primary" data-act="route-save" data-branch="${esc(b.id)}">儲存</button></div></div>`;
  sheet.hidden = false; document.body.style.overflow = "hidden";
}
// 是日路線：直接修改行程的地圖地點
function openPlaceEditor(id) {
  const f = findItem(id); if (!f) return;
  const v = V(f.item);
  const l = (v.links || []).find(isMapLink);
  const raw = l && !/google\.com\/maps\/search\/\?api=1&query=/.test(l.url || "") ? l.url : "";
  const sheet = $("#sheet");
  sheet.className = "sheet";
  sheet.innerHTML = `<div class="sheet-body"><div class="sheet-head"><h2>${icon("nav")} 地點</h2><button class="btn ghost" data-act="close">✕</button></div>
    <p class="hint">${f.item.start != null ? `<b class="time">${fmt(f.item.start)}</b> ` : ""}${esc(v.title)}</p>
    <form id="placeForm" onsubmit="return false">
      <label class="field"><span>地點名稱</span><input type="text" name="name" value="${esc(l ? l.label || "" : "")}" placeholder="例如：露天神社"></label>
      <label class="field"><span>Google 地圖網址（可留空）</span><input type="url" name="url" inputmode="url" autocapitalize="off" value="${esc(raw)}" placeholder="https://maps.app.goo.gl/…"></label>
      <label class="field"><span>地址（可留空）</span><input type="text" name="addr" value="${esc(l ? l.addr || "" : "")}" placeholder="例如：大阪市北区梅田3-2-2"></label>
      <small class="hint">「開啟導航」會用 Google 地圖網址；沒有網址就用地點名稱搜尋。<br>這裡的地圖先用名稱定位，找不到才用地址；都找不到就顯示附近位置。</small>
    </form>
    <div class="sheet-foot">${l ? `<button class="btn" data-act="place-remove" data-id="${esc(id)}">移除地點</button>` : ""}<span class="grow"></span><button class="btn" data-act="close">取消</button><button class="btn primary" data-act="place-save" data-id="${esc(id)}">儲存</button></div></div>`;
  sheet.hidden = false; document.body.style.overflow = "hidden";
}
function openBranchCreator(id) {
  const d = day();
  const i = d.items.findIndex((x) => x.id === id);
  const rest = d.items.slice(i).filter((x) => !isBranch(x));
  let opts = "";
  for (let k = i; k < d.items.length; k++) {
    const n = d.items[k]; if (isBranch(n)) break;
    opts += `<label class="checkline"><input type="radio" name="end" value="${k}" ${k === i ? "checked" : ""}><span>${n.start != null ? `<b class="time">${fmt(n.start)}</b> ` : ""}${esc(V(n).title)}</span></label>`;
  }
  const sheet = $("#sheet");
  sheet.className = "sheet";
  sheet.innerHTML = `<div class="sheet-body"><div class="sheet-head"><h2>⑂ 從這裡分叉</h2><button class="btn ghost" data-act="close">✕</button></div>
    <p class="hint">由「${esc(V(d.items[i]).title)}」開始分叉。請選擇分叉到哪一項為止，之後的行程會共用。<br>建立後會多一條「路線 B」（內容先複製路線 A），直接修改就可以。</p>
    <form id="branchForm" onsubmit="return false"><label class="field"><span>路線 B 名稱</span><input type="text" name="nameB" placeholder="例如：先參拜，再喫茶"></label>
    <label class="field"><span>路線 A（目前）名稱</span><input type="text" name="nameA" placeholder="例如：先喫茶，後參拜"></label>
    <div class="field"><span>分叉包括到：</span>${opts}</div></form>
    <div class="sheet-foot"><span class="grow"></span><button class="btn" data-act="close">取消</button><button class="btn primary" data-act="branch-create" data-id="${esc(id)}">建立分叉</button></div></div>`;
  sheet.hidden = false; document.body.style.overflow = "hidden";
}

// ---------- 事件 ----------
// ---------- 事件 ----------
document.addEventListener("click", async (e) => {
  const t = e.target.closest("[data-act]");
  if (!t) {
    if (e.target.id === "sheet" || e.target.classList.contains("sheet")) closeSheet();
    if (e.target.closest("#lightbox")) $("#lightbox").hidden = true;
    return;
  }
  const a = t.dataset.act, id = t.dataset.id;
  switch (a) {
    // ---- 新版：菜單、旅程、支出、外觀 ----
    case "menu": openMenu(); break;
    case "manage": S.manage = !S.manage; render(); toast(S.manage ? "整理模式：可以編輯、新增、分叉、移到備選" : "已完成整理"); break;
    case "trip-open": if (id === S.tripId) closeSheet(); else switchTrip(id); break;
    case "trip-new": openTripNew(); break;
    case "trip-create": {
      const f = $("#newTripForm");
      if (!f.title.value.trim()) { fieldErrorIn(f, "title", "請輸入旅程名稱"); break; }
      const doc = buildTripDoc(f);
      t.disabled = true; t.textContent = "建立中…";
      try {
        const r = await fetch("/api/trips", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ doc }) });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || r.status);
        S.trips.push({ id: j.id, title: doc.meta.title, dates: doc.meta.dates, days: doc.days.filter((x) => x.kind === "day").length });
        await switchTrip(j.id);
        toast(`已建立「${doc.meta.title}」`);
      } catch (err) { t.disabled = false; t.textContent = "建立旅程"; toast("建立失敗：" + err.message); }
      break;
    }
    case "trip-settings": closeSheet(); openTripSettings(); break;
    case "trip-save": {
      const f = $("#tripForm");
      const rate = numOrNull(f.rate.value);
      const auto = f.rateAuto.checked;
      const oldCur = (S.doc.meta || {}).currency;
      closeSheet();
      commit((doc) => {
        const m = doc.meta = doc.meta || {};
        m.title = f.title.value.trim() || m.title || "旅程";
        m.name = f.name.value.trim(); m.subtitle = f.subtitle.value.trim(); m.dates = f.dates.value.trim();
        m.currency = f.currency.value;
        if (!auto && rate) { m.rate = rate; m.rateManual = true; m.rateDate = Date.now(); }
        else { m.rateManual = false; if (m.currency !== oldCur) { m.rate = null; m.rateDate = null; } }
      }, "已儲存旅程設定");
      if (auto) updateRate(false);
      const tr = S.trips.find((x) => x.id === S.tripId); if (tr) { tr.title = S.doc.meta.title; tr.dates = S.doc.meta.dates; }
      break;
    }
    case "trip-delete": {
      if (!t.dataset.sure) { t.innerHTML = `${icon("trash")}再按一次確定刪除「${esc((S.doc.meta || {}).title || "")}」`; t.dataset.sure = "1"; break; }
      try {
        const r = await fetch(API(), { method: "DELETE" });
        const j = await r.json(); if (!r.ok) throw new Error(j.error);
        ls.del(K("doc")); ls.del(K("pending")); ls.del(K("version"));
        S.trips = S.trips.filter((x) => x.id !== S.tripId);
        const next = S.trips[0] ? S.trips[0].id : "osaka";
        S.pending = false; S.tripId = null;
        await switchTrip(next);
        toast("已刪除旅程");
      } catch (err) { toast("刪除失敗：" + err.message); }
      break;
    }
    case "theme": setTheme(id); openMenu(); break;
    case "rate-refresh": updateRate(true); break;
    case "map-filter": S.mapFilter = id; render(); break;
    case "pdf-open": openPdfOptions(); break;
    case "budget-edit": openBudgetEditor(); break;
    case "budget-save": {
      const f = $("#budgetForm"); const amount = numOrNull(f.amount.value);
      if (amount == null || amount <= 0) { fieldErrorIn(f, "amount", "請輸入預算金額"); break; }
      const cur = f.cur.value; closeSheet();
      commit((doc) => { doc.meta = doc.meta || {}; doc.meta.budget = { amount, cur }; }, "已設定行程預算");
      break;
    }
    case "budget-clear": closeSheet(); commit((doc) => { if (doc.meta) delete doc.meta.budget; }, "已清除預算"); break;
    case "pdf-make": makeHandbook(); break;
    case "add": addFromBottom(); break;
    case "refresh": forceRefresh(); break;
    case "undo-btn": undo(); break;
    case "sync": if (S.pending) { S.saveError = null; save(); } else forceRefresh(); break;
    case "photo-mode": setPhotoMode(id); render(); openMenu(); break;
    case "cost-edit": closeSheet(); openCostEditor(id); break;
    case "cost-save": {
      const c = readCost($("#costForm"));
      closeSheet();
      commit(() => { const f = findItem(id); if (!f) return; const v = V(f.item); if (c) v.cost = c; else delete v.cost; }, c ? "已儲存消費" : "已清除消費");
      break;
    }
    case "cost-clear": closeSheet(); commit(() => { const f = findItem(id); if (f) delete V(f.item).cost; }, "已清除消費"); break;
    case "variant-out": {
      const k = +t.dataset.k;
      commit(() => {
        const f = findItem(id); if (!f) return { msg: "找不到這個行程" };
        const it = f.item;
        if (it.variants.length < 2 || k === (it.active || 0)) return;
        const v = it.variants.splice(k, 1)[0];
        if ((it.active || 0) > k) it.active -= 1;
        const d = f.day;
        const timed = d.kind === "day" && v.type !== "info" && !f.parent;
        const start = timed ? (endOf(it) ?? it.start) : f.parent ? endOf(it) : null;
        const ni = { id: uid(), start, locked: false, done: false, active: 0, variants: [v] };
        if (!f.parent) ni.children = [];
        if (timed && !v.dur) v.dur = 60;
        f.arr.splice(f.index + 1, 0, ni);
        if (timed && start != null) {
          const list = seq(d), p = list.findIndex((x) => x.item === ni);
          const next = list.slice(p + 1).map((x) => x.item).find((x) => x.start != null);
          const delta = next ? endOf(ni) - next.start : 0;
          if (delta > 0) { const n = rippleFrom(d, p, delta); if (n) return { msg: `已把「${v.title}」加入行程（${fmt(start)}），之後 ${n} 項延後 ${durText(delta)}` }; }
        }
        return { msg: `已把「${v.title}」加入行程${start != null ? `（${fmt(start)}）` : ""}` };
      });
      break;
    }
    case "map-sel": selectStop(day(), +t.dataset.i, true); $("#routeMap") && $("#routeMap").scrollIntoView({ block: "center", behavior: "smooth" }); break;
    case "map-step": { const n = routeStops(day()).length; selectStop(day(), Math.max(0, Math.min(n - 1, (S.mapSel || 0) + +t.dataset.dir)), true); break; }
    case "card-close": S.cardOff = true; ls.set("trip.cardOff", "1"); selectStop(day(), S.mapSel || 0, false); break;
    case "card-show": S.cardOff = false; ls.set("trip.cardOff", ""); selectStop(day(), S.mapSel || 0, false); break;
    case "place-edit": openPlaceEditor(id); break;
    case "place-save": case "place-remove": {
      const f = $("#placeForm");
      const name = f.name.value.trim(), raw = f.url.value.trim(), addr = f.addr.value.trim();
      if (a === "place-save" && !name && !raw && !addr) { fieldErrorIn(f, "name", "請輸入地點名稱、地圖網址或地址"); break; }
      let url = normUrl(raw);
      if (a === "place-save" && raw && !url) { fieldErrorIn(f, "url", "網址格式不正確"); break; }
      if (a === "place-save" && !raw) url = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(name || addr);
      const pid = t.dataset.id;
      closeSheet();
      commit((doc) => {
        const f2 = findItem(pid); if (!f2) return;
        const v = V(f2.item); v.links = v.links || [];
        const k = v.links.findIndex(isMapLink);
        if (a === "place-remove") { if (k >= 0) v.links.splice(k, 1); return; }
        const link = { kind: "map", label: name || addr || url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0], url };
        if (addr) link.addr = addr;
        if (k >= 0) { const old = v.links[k]; if (old.label === link.label && old.url === link.url && (old.addr || "") === addr) return; if (old.geo) link.geo = old.geo; v.links[k] = link; }
        else v.links.unshift(link);
      });
      break;
    }
    case "map-goto": {
      S.view = "list"; ls.set("trip.view", "list"); S.open.add(id); S.q = "";
      const f = findItem(id); if (f && f.item.done) S.expanded.add(id);
      render();
      requestAnimationFrame(() => { const el = $(`[data-act=toggle][data-id="${CSS.escape(id)}"]`); if (el) el.scrollIntoView({ block: "center", behavior: "smooth" }); });
      break;
    }
    case "expense-new": openExpenseEditor(""); break;
    case "expense-edit": openExpenseEditor(id); break;
    case "expense-save": {
      const f = $("#expForm");
      if (!f.title.value.trim()) { fieldErrorIn(f, "title", "請輸入項目名稱"); break; }
      const c = readCost(f);
      if (!c) { fieldErrorIn(f, "costPlan", "請輸入預計或實際金額"); break; }
      const vals = { title: f.title.value.trim(), type: f.type.value, dayId: f.dayId.value, note: f.note.value.trim(), ...c };
      closeSheet();
      commit((doc) => {
        doc.expenses = doc.expenses || [];
        if (id) Object.assign(doc.expenses.find((x) => x.id === id), vals);
        else doc.expenses.push({ id: "e-" + uid(), ...vals });
      }, id ? "已儲存支出" : "已新增支出");
      break;
    }
    case "expense-delete": {
      if (!t.dataset.sure) { t.textContent = "再按一次確定刪除"; t.dataset.sure = "1"; break; }
      closeSheet();
      commit((doc) => { doc.expenses = (doc.expenses || []).filter((x) => x.id !== id); }, "已刪除支出");
      break;
    }

    case "tab": S.dayId = id; S.q = ""; render(); window.scrollTo(0, 0); break;
    case "add-day": openDayEditor(true, t.dataset.kind); break;
    case "edit-day": openDayEditor(false); break;
    case "done": S.expanded.delete(id); commit(() => { const f = findItem(id); f.item.done = !f.item.done; }); break;
    case "toggle": toggleOpen(id); break;
    case "route": {
      const d = day(); const b = findBranch(d, t.dataset.branch); const k = b.routes.findIndex((r) => r.id === id);
      commit((doc) => {
        const dd = doc.days.find((x) => x.id === d.id); const bb = findBranch(dd, b.id);
        const res = switchRoute(dd, bb, id);
        const name = `路線 ${planLetter(k)}`;
        return { msg: res && res.n ? `已切換到${name}，匯合後 ${res.n} 項${res.delta > 0 ? "延後" : "提前"} ${durText(Math.abs(res.delta))}` : `已切換到${name}` };
      });
      break;
    }
    case "route-add": {
      const did = day().id, bid = t.dataset.branch; closeSheet();
      commit((doc) => {
        const d = doc.days.find((x) => x.id === did); const b = findBranch(d, bid);
        const r = activeRoute(b); const letter = planLetter(b.routes.length);
        const nr = { id: "r-" + uid(), name: "", items: copyItems(r.items) };
        b.routes.push(nr); b.active = nr.id;
        return { msg: `已複製成路線 ${letter}，修改它不會影響其他路線` };
      });
      break;
    }
    case "branch-edit": openBranchEditor(id); break;
    case "branch-new": openBranchCreator(id); break;
    case "move-out": closeSheet(); openMoveOut(id); break;
    case "move-out-go": doMoveOut(id, !!t.dataset.pull); break;
    case "move-in": closeSheet(); openMoveIn(id); scrollChecked(); break;
    case "move-in-go": doMoveIn(id); break;
    case "idea-filter": S.ideaFilter = id; render(); break;
    case "view": S.view = id; ls.set("trip.view", id); render(); window.scrollTo(0, 0); break;
    case "branch-create": {
      const f = $("#branchForm"); const endIdx = +f.querySelector("[name=end]:checked").value;
      const nameA = f.nameA.value.trim(), nameB = f.nameB.value.trim();
      const did = day().id; closeSheet();
      commit((doc) => {
        const d = doc.days.find((x) => x.id === did);
        const i = d.items.findIndex((x) => x.id === id);
        const seg = d.items.slice(i, endIdx + 1);
        const b = { id: "br-" + uid(), branch: true, routes: [
          { id: "r-" + uid(), name: nameA, items: seg },
          { id: "r-" + uid(), name: nameB, items: copyItems(seg) },
        ] };
        b.active = b.routes[1].id;
        d.items.splice(i, seg.length, b);
        return { msg: "已建立分叉，現在顯示路線 B，可以直接修改" };
      });
      break;
    }
    case "route-save": {
      const name = $("#routeForm").name.value.trim(); const did = day().id, bid = t.dataset.branch;
      closeSheet();
      commit((doc) => { const b = findBranch(doc.days.find((x) => x.id === did), bid); activeRoute(b).name = name; }, "已儲存");
      break;
    }
    case "route-delete": {
      if (!t.dataset.sure) { t.textContent = "再按一次確定刪除這條路線"; t.dataset.sure = "1"; break; }
      const did = day().id, bid = t.dataset.branch; closeSheet();
      commit((doc) => {
        const d = doc.days.find((x) => x.id === did); const b = findBranch(d, bid);
        const cur = activeRoute(b); const other = b.routes.find((r) => r !== cur);
        switchRoute(d, b, other.id);
        b.routes = b.routes.filter((r) => r !== cur);
        if (b.routes.length === 1) { d.items.splice(d.items.indexOf(b), 1, ...b.routes[0].items); return { msg: "已刪除路線，只剩一條路線，已解除分叉" }; }
        return { msg: "已刪除路線" };
      });
      break;
    }
    case "branch-dissolve": {
      if (!t.dataset.sure) { t.textContent = "再按一次確定解除（其他路線會刪除）"; t.dataset.sure = "1"; break; }
      const did = day().id, bid = t.dataset.branch; closeSheet();
      commit((doc) => { const d = doc.days.find((x) => x.id === did); const b = findBranch(d, bid); d.items.splice(d.items.indexOf(b), 1, ...activeRoute(b).items); }, "已解除分叉");
      break;
    }
    case "variant": {
      const k = +t.dataset.k;
      const f = findItem(id);
      if ((f.item.active || 0) === k) break;
      commit(() => {
        const g = findItem(id);
        const oldEnd = endOf(g.item);
        g.item.active = k;
        const label = `已切換到方案 ${String.fromCharCode(65 + k)}`;
        if (!g.parent && g.day.kind === "day" && oldEnd != null) {
          const delta = endOf(g.item) - oldEnd;
          const n = ripple(g.day, g.item, delta);
          if (n && delta) return { msg: `${label}，之後 ${n} 項${delta > 0 ? "延後" : "提前"} ${durText(Math.abs(delta))}` };
        }
        return { msg: label };
      });
      break;
    }
    case "add-main": openEditor({ mode: "new-main", at: +t.dataset.at, type: t.dataset.type, route: t.dataset.route || "" }); break;
    case "fold": S.expanded.has(id) ? S.expanded.delete(id) : S.expanded.add(id); render(); break;
    case "add-child": openEditor({ mode: "new-child", id }); break;
    case "edit": closeSheet(); openEditor({ mode: "edit", id }); break;
    case "quick-photo": {
      const inp = $("#quickPhoto"); inp.dataset.id = id; inp.dataset.memo = ""; inp.value = ""; inp.click(); break;
    }
    case "memo-photo": {
      const inp = $("#quickPhoto"); inp.dataset.id = id; inp.dataset.memo = "1"; inp.value = ""; inp.click(); break;
    }
    case "memo-view": {
      const lb = $("#lightbox");
      lb.innerHTML = `<img src="${esc(photoUrl(t.dataset.photo))}" alt=""><button data-act="lb-close">✕</button>
        <div class="lb-tools"><button data-act="memo-del" data-id="${esc(id)}" data-photo="${esc(t.dataset.photo)}">移除這張旅行相片</button></div>`;
      lb.hidden = false; break;
    }
    case "memo-del":
      $("#lightbox").hidden = true;
      commit(() => { const f = findItem(id); if (!f || !f.item.memo) return; f.item.memo.photos = f.item.memo.photos.filter((p) => p !== t.dataset.photo); });
      break;
    case "diary-open": {
      S.dayId = DIARY; S.manage = false;
      const f = findItem(id); if (f && !f.item.done) S.diaryAll = true;
      render(); window.scrollTo(0, 0);
      const el = document.getElementById("de-" + id);
      if (el) { el.scrollIntoView({ block: "center" }); el.classList.add("flash"); const ta = el.querySelector("textarea"); setTimeout(() => ta && ta.focus({ preventScroll: true }), 350); }
      break;
    }
    case "diary-jump": { const el = document.getElementById("dd-" + id); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - ($("#tabs").offsetHeight || 0) - 8, behavior: "smooth" }); break; }
    case "diary-filter": S.diaryAll = id === "all"; ls.set("trip.diaryAll", S.diaryAll ? "1" : ""); render(); break;
    case "photo": {
      const lb = $("#lightbox");
      const f = findItem(id), pv = V(f.item), cur = photoModeOf(f.item, pv, t.dataset.photo);
      const next = cur === "full" ? "thumb" : "full";
      lb.innerHTML = `<img src="${esc(photoUrl(t.dataset.photo))}" alt=""><button data-act="lb-close">✕</button>
        <div class="lb-tools"><button data-act="lb-mode" data-id="${esc(id)}" data-photo="${esc(t.dataset.photo)}" data-mode="${next}">${next === "full" ? "🖼 這張改為大圖顯示" : "▦ 這張改為縮圖顯示"}</button>
        <button data-act="lb-del" data-id="${esc(id)}" data-photo="${esc(t.dataset.photo)}">移除圖片</button></div>`;
      lb.hidden = false; break;
    }
    case "lb-close": $("#lightbox").hidden = true; break;
    case "lb-del":
      $("#lightbox").hidden = true;
      commit(() => { const f = findItem(id); const v = V(f.item); v.photos = v.photos.filter((p) => p !== t.dataset.photo); if (v.photoModes) delete v.photoModes[t.dataset.photo]; });
      break;
    case "lb-mode":
      $("#lightbox").hidden = true;
      commit(() => { const f = findItem(id); const v = V(f.item); v.photoModes = v.photoModes || {}; v.photoModes[t.dataset.photo] = t.dataset.mode; });
      break;
    case "close": closeSheet(); break;
    case "ed-save": saveEditor(); break;
    case "ed-to-child": {
      const prev = prevMainOf(); if (!prev) break;
      readForm(); ED.level = prev.id;
      const lv = $("#edForm [name=level]"); if (lv) lv.value = prev.id;
      saveEditor();
      break;
    }
    case "ed-delete": deleteFromEditor(); break;
    case "ed-delete-go": doDelete(!!t.dataset.pull); break;
    case "ed-variant": readForm(); ED.k = +t.dataset.k; renderEditor(); break;
    case "ed-add-variant": {
      readForm();
      const base = ED.draft.variants[ED.k];
      ED.draft.variants.push({ ...clone(base), id: uid(), title: "", details: "", links: [], photos: [] });
      ED.k = ED.draft.variants.length - 1; renderEditor();
      setTimeout(() => $("#edForm [name=title]").focus(), 50);
      break;
    }
    case "ed-del-variant":
      if (ED.draft.variants.length > 1) { ED.draft.variants.splice(ED.k, 1); ED.k = Math.max(0, ED.k - 1); renderEditor(); }
      break;
    case "link-add": {
      readForm();
      const v = ED.draft.variants[ED.k];
      v.links = (v.links || []).map(({ kind, label, url, addr, geo }) => ({ kind, label, url, ...(addr ? { addr } : {}), ...(geo ? { geo } : {}) }));
      v.links.push({ kind: t.dataset.kind, label: "", url: "", _new: true });
      const y = $(".sheet-body").scrollTop; renderEditor(); $(".sheet-body").scrollTop = y;
      const rows = $$(`#edForm .lrow[data-kind="${t.dataset.kind}"]`); rows[rows.length - 1].querySelector(".l-label").focus();
      break;
    }
    case "link-del": {
      const row = t.closest(".lrow"); const box = row.parentElement;
      if (box.querySelectorAll(".lrow").length > 1) row.remove();
      else row.querySelectorAll("input").forEach((x) => (x.value = ""));
      break;
    }
    case "ed-add-photo": $("#edFile").value = ""; $("#edFile").click(); break;
    case "ed-photo-mode": {
      const v = ED.draft.variants[ED.k], p = v.photos[+t.dataset.i];
      const order = ["auto", "full", "thumb"];
      const next = order[(order.indexOf((v.photoModes && v.photoModes[p]) || "auto") + 1) % 3];
      v.photoModes = v.photoModes || {};
      if (next === "auto") delete v.photoModes[p]; else v.photoModes[p] = next;
      readForm(); $("#edPhotos").innerHTML = editPhotos(v); break;
    }
    case "ed-del-photo": readForm(); { const v = ED.draft.variants[ED.k]; if (v.photoModes) delete v.photoModes[v.photos[+t.dataset.i]]; } ED.draft.variants[ED.k].photos.splice(+t.dataset.i, 1); $("#edPhotos").innerHTML = editPhotos(ED.draft.variants[ED.k]); break;
    case "day-save": {
      const f = $("#dayForm");
      const vals = { label: f.label.value.trim() || "未命名", sub: f.sub.value.trim(), title: f.title.value.trim(), subtitle: f.subtitle.value.trim(), kind: f.kind.value };
      const isNew = !!t.dataset.new, did = id;
      closeSheet();
      commit((doc) => {
        if (isNew) {
          const d = { id: did, items: [], ...vals };
          const lastSame = doc.days.map((x) => x.kind === "day" ? "day" : "info").lastIndexOf(vals.kind === "day" ? "day" : "info");
          doc.days.splice(lastSame + 1, 0, d);
          S.dayId = did;
        } else Object.assign(doc.days.find((x) => x.id === did), vals);
      }, isNew ? "已新增分頁" : "已儲存");
      break;
    }
    case "day-move": {
      const dir = +t.dataset.dir;
      commit((doc) => {
        const i = doc.days.findIndex((x) => x.id === S.dayId), j = i + dir;
        if (j < 0 || j >= doc.days.length) return;
        [doc.days[i], doc.days[j]] = [doc.days[j], doc.days[i]];
      });
      openDayEditor(false);
      break;
    }
    case "day-delete": {
      if (t.dataset.sure) {
        closeSheet();
        commit((doc) => { doc.days = doc.days.filter((x) => x.id !== S.dayId); S.dayId = (doc.days.find((x) => x.kind === "day") || doc.days[0])?.id; }, "已刪除分頁");
      } else { t.textContent = "再按一次確定刪除"; t.dataset.sure = "1"; }
      break;
    }
    case "undo": $("#toast").hidden = true; undo(); break;
    case "take-server": S.doc = S.conflict.doc; S.version = S.conflict.version; S.conflict = null; S.pending = false; ls.del(K("pending")); persistLocal(false); render(); toast("已載入最新版本"); break;
    case "force-save": S.conflict = null; S.pending = true; await save(true); render(); break;
    case "revisions": openRevisions(); break;
    case "restore": {
      try {
        const r = await fetch(API("/revisions/" + id)); const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        closeSheet();
        commit((doc) => { S.doc = data.doc; }, `已還原到第 ${data.version} 版`);
        S.doc = data.doc; persistLocal(true); render(); scheduleSave();
      } catch (err) { toast("還原失敗：" + err.message); }
      break;
    }
    case "export": {
      const blob = new Blob([JSON.stringify(S.doc, null, 2)], { type: "application/json" });
      const aEl = document.createElement("a"); aEl.href = URL.createObjectURL(blob);
      aEl.download = ((S.doc.meta && S.doc.meta.title) || "trip") + ".json"; aEl.click(); setTimeout(() => URL.revokeObjectURL(aEl.href), 2000);
      break;
    }
    case "import": $("#importFile").click(); break;
    case "rename-trip": {
      const name = prompt("旅程名稱", S.doc.title || ""); // 單純文字輸入，非阻塞流程
      if (name != null) { closeSheet(); commit((doc) => { doc.title = name.trim() || "旅行手帳"; }, "已改名"); }
      break;
    }
    case "reload": ls.del(K("doc")); location.reload(); break;
  }
});

// ---------- 其他介面事件 ----------
function fieldErrorIn(form, name, msg) {
  const el = form[name];
  $$(".field-err").forEach((x) => x.remove());
  $$(".invalid").forEach((x) => x.classList.remove("invalid"));
  if (el) {
    el.classList.add("invalid");
    (el.closest(".field") || el.parentElement).insertAdjacentHTML("beforeend", `<small class="field-err">⚠ ${esc(msg)}</small>`);
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    setTimeout(() => el.focus(), 250);
  }
  toast("未能儲存：" + msg);
}
// 「＋ 新增」：按目前分頁決定新增甚麼
function addFromBottom() {
  if (!S.doc) return;
  if (S.dayId === MONEY) { openExpenseEditor(""); return; }
  if (S.dayId === DIARY) return;
  const d = day();
  if (d.kind === "day") {
    const last = d.items.length - 1;
    const n = d.items[last];
    if (n && isBranch(n)) openEditor({ mode: "new-main", at: last, route: "" });
    else openEditor({ mode: "new-main", at: last, route: "" });
  } else openEditor({ mode: "new-main", at: d.items.length - 1, type: S.ideaFilter !== "all" && S.ideaFilter !== "info" ? S.ideaFilter : "place" });
}
// 分組、備選方案展開狀態（details 的 toggle 不會冒泡，所以用 capture）
document.addEventListener("toggle", (e) => {
  const el = e.target;
  if (el.classList && el.classList.contains("period")) { const k = el.dataset.key; el.open ? S.closed.delete(k) : S.closed.add(k); }
  if (el.id === "mgmt") S.mgmtOpen = el.open;
  if (el.dataset && el.dataset.alt) { el.open ? S.altOpen.add(el.dataset.alt) : S.altOpen.delete(el.dataset.alt); }
}, true);
window.addEventListener("scroll", () => { const t = $("#tabs"); if (t) t.classList.toggle("stuck", window.scrollY > ($("#brand").offsetHeight || 80) - 4); }, { passive: true });

function setPhotoMode(m) { S.photoMode = m; ls.set("trip.photoMode", m); }
// 刷新：先上傳自己的修改，再讀取其他人編輯的最新內容
async function forceRefresh() {
  const btn = $("#refreshBtn"); if (btn) btn.classList.add("spin");
  try {
    if (S.pending) await save();
    if (S.conflict) { render(); return; }
    const before = S.version;
    const r = await fetch(API(), { cache: "no-store" });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || r.status);
    if (!S.pending) {
      S.doc = data.doc; S.version = data.version; S.savedAt = data.updatedAt; S.offline = false;
      persistLocal(false); render();
      toast(data.version !== before ? "已更新到最新內容" : "已經是最新內容");
    }
    loadTrips();
  } catch (e) { S.offline = !navigator.onLine; syncUI(); toast("刷新失敗：" + (navigator.onLine ? e.message : "目前離線")); }
  finally { const b2 = $("#refreshBtn"); if (b2) b2.classList.remove("spin"); }
}
setPhotoMode(ls.get("trip.photoMode") === "full" ? "full" : "thumb");
S.view = ls.get("trip.view") === "map" ? "map" : "list";
S.cardOff = ls.get("trip.cardOff") === "1";
S.diaryAll = ls.get("trip.diaryAll") === "1";
S.theme = ls.get("trip.theme") === "dark" ? "dark" : ls.get("trip.theme") === "light" ? "light" : "auto";
setTheme(S.theme);

document.addEventListener("input", (e) => {
  if (e.target.classList && e.target.classList.contains("invalid")) { e.target.classList.remove("invalid"); const er = e.target.closest(".field")?.querySelector(".field-err"); if (er) er.remove(); }
  if (e.target.dataset.act === "search") { S.q = e.target.value; render(); }
  if (/^cost(Plan|Actual)$/.test(e.target.name || "")) updateCostPreview();
  if (e.target.dataset && e.target.dataset.journal) { const id = e.target.dataset.journal, val = e.target.value; autosize(e.target); diaryWrite((doc) => { const d = doc.days.find((x) => x.id === id); if (d) { if (val.trim()) d.journal = val; else delete d.journal; } }); }
  if (e.target.dataset && e.target.dataset.memo && e.target.classList.contains("de-note")) { const id = e.target.dataset.memo, val = e.target.value; autosize(e.target); diaryWrite(() => { const f = findItem(id); if (!f) return; f.item.memo = f.item.memo || { photos: [] }; f.item.memo.note = val; }); }
  if ((e.target.name === "start" || e.target.name === "tdur") && e.target.form && e.target.form.id === "edForm" && $("#arrHint")) {
    const f = e.target.form, st = parseHHMM(f.start.value), m = parseInt(f.tdur.value, 10);
    $("#arrHint").innerHTML = arrText(st, m);
  }
});

document.addEventListener("change", async (e) => {
  if (e.target.name === "costCur") { updateCostPreview(); return; }
  if (e.target.name === "type" && e.target.form && e.target.form.id === "edForm") { readForm(); renderEditor(); return; }
  if (e.target.name === "day" && e.target.form && e.target.form.id === "moveForm") { openMoveIn(e.target.dataset.id, e.target.value); scrollChecked(); return; }
  if (e.target.id === "edFile") {
    const files = [...e.target.files]; if (!files.length) return;
    readForm();
    try {
      const ids = await uploadFiles(files, (i, n) => { ED.uploading = `${i + 1}/${n}`; $("#edPhotos").innerHTML = editPhotos(ED.draft.variants[ED.k]); });
      if (!ED) return;
      ED.uploading = null; ED.draft.variants[ED.k].photos.push(...ids);
      $("#edPhotos").innerHTML = editPhotos(ED.draft.variants[ED.k]);
    } catch (err) { if (ED) { ED.uploading = null; $("#edPhotos").innerHTML = editPhotos(ED.draft.variants[ED.k]); } toast("圖片上傳失敗：" + err.message); }
  }
  if (e.target.id === "quickPhoto") {
    const files = [...e.target.files], id = e.target.dataset.id, memo = e.target.dataset.memo === "1"; if (!files.length) return;
    try {
      const ids = await uploadFiles(files);
      if (memo) { commit(() => { const f = findItem(id); if (!f) return; f.item.memo = f.item.memo || { photos: [], note: "" }; f.item.memo.photos = [...(f.item.memo.photos || []), ...ids]; }); return; }
      commit(() => { const f = findItem(id); V(f.item).photos.push(...ids); });
    } catch (err) { toast("圖片上傳失敗：" + err.message); }
  }
  if (e.target.id === "importFile") {
    const file = e.target.files[0]; if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data.days)) throw new Error("不是這個網站匯出的格式");
      closeSheet();
      commit(() => { S.doc = data; }, "已匯入");
      S.doc = data; persistLocal(true); render(); scheduleSave();
    } catch (err) { toast("匯入失敗：" + err.message); }
  }
});
window.addEventListener("online", () => { S.offline = false; save(); });
window.addEventListener("offline", () => { S.offline = true; syncUI(); });
document.addEventListener("visibilitychange", () => { if (!document.hidden) { S.pending ? save() : refresh(); } });
setInterval(() => { S.pending ? save() : refresh(); }, 30000);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeSheet(); $("#lightbox").hidden = true; } });

window.addEventListener("hashchange", () => { const h = (location.hash.match(/t=([\w-]+)/) || [])[1]; if (h && h !== S.tripId) switchTrip(h); });
if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
(async () => {
  S.tripId = await pickTrip();
  load();
  loadTrips();
})();
})();
