/* 旅行手帳 — 前端（不需編譯） */
(() => {
"use strict";

const LS_DOC = "trip.doc", LS_VER = "trip.version", LS_PENDING = "trip.pending", LS_DAY = "trip.day";
const TYPES = { place: "地點・活動", transport: "交通", food: "餐飲", flight: "航班", info: "資訊" };
const TYPE_ICON = { place: "◇", transport: "→", food: "◎", flight: "✈", info: "ⓘ" };
const isInfo = (it) => V(it).type === "info";

const S = {
  doc: null, version: 0, dayId: null, q: "",
  saving: false, pending: false, timer: null, conflict: null, offline: false,
  undo: [], open: new Set(), expanded: new Set(),
  photoMode: null,
};

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
  ls.set(LS_DOC, JSON.stringify(S.doc));
  ls.set(LS_VER, String(S.version));
  if (pending) { S.pending = true; ls.set(LS_PENDING, "1"); }
}
function scheduleSave() {
  clearTimeout(S.timer);
  S.timer = setTimeout(save, 900);
  syncUI();
}
async function save(force = false) {
  if (S.saving || (!S.pending && !force)) return;
  S.saving = true; syncUI();
  try {
    const r = await fetch("/api/trip", {
      method: "PUT", headers: { "content-type": "application/json" },
      body: JSON.stringify({ version: S.version, doc: S.doc, force }),
    });
    const data = await r.json().catch(() => ({}));
    if (r.status === 409) { S.conflict = data; S.offline = false; }
    else if (!r.ok) throw new Error(data.error || r.status);
    else {
      S.version = data.version; S.pending = false; S.conflict = null; S.offline = false;
      S.savedAt = data.updatedAt;
      ls.del(LS_PENDING); persistLocal(false);
    }
    S.saveError = null;
  } catch (e) {
    S.offline = !navigator.onLine || e instanceof TypeError;
    S.lastError = e.message;
    if (!S.offline) { S.saveError = e.message; toast("雲端儲存失敗：" + e.message + "（會自動重試）"); }
  }
  S.saving = false;
  syncUI();
  if (S.conflict) render();
}
async function load() {
  const cached = ls.get(LS_DOC);
  if (cached) {
    try { S.doc = JSON.parse(cached); S.version = +ls.get(LS_VER) || 0; S.pending = ls.get(LS_PENDING) === "1"; } catch {}
  }
  S.dayId = ls.get(LS_DAY);
  if (S.doc) render();
  try {
    const r = await fetch("/api/trip", { cache: "no-store" });
    const data = await r.json();
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
  render(); syncUI();
}
async function refresh() {
  if (S.pending || S.saving || document.hidden) return;
  try {
    const r = await fetch("/api/trip", { cache: "no-store" });
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
  else if (S.pending && S.offline) { cls = "err"; text = "離線・修改未上傳"; }
  else if (S.pending && S.saveError) { cls = "err"; text = "儲存失敗・按此重試"; }
  else if (S.pending) { cls = "busy"; text = "等待儲存…"; }
  else if (S.offline) { cls = "err"; text = "離線・顯示已存版本"; }
  else if (S.savedAt) text = "已同步 · " + new Date(S.savedAt).toLocaleTimeString("zh-HK", { hour: "2-digit", minute: "2-digit", hour12: false });
  dot.className = cls; t.textContent = text;
  $("#undoBtn").disabled = !S.undo.length;
}

let toastTimer;
function toast(msg, withUndo = false) {
  const el = $("#toast");
  el.innerHTML = `<span>${esc(msg)}</span>` + (withUndo ? `<button data-act="undo">復原</button>` : "");
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), withUndo ? 6000 : 2500);
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
function render() {
  if (!S.doc) return;
  const d = day();
  S.dayId = d.id; ls.set(LS_DAY, d.id);
  document.title = (S.doc.title || "旅行手帳") + " · " + d.label;

  $("#tabs").innerHTML = S.doc.days.map((x) =>
    `<button class="tab ${x.id === d.id ? "on" : ""}" data-act="tab" data-id="${esc(x.id)}"><b>${esc(x.label)}</b><small>${esc(x.sub || "")}</small></button>`
  ).join("") + `<button class="tab add" data-act="add-day" aria-label="新增一天">＋</button>`;

  const dayNo = S.doc.days.filter((x) => x.kind === "day").indexOf(d) + 1;
  const all = seq(d).flatMap(({ item: it }) => [it, ...(it.children || [])]).filter((x) => !isInfo(x));
  const done = all.filter((x) => x.done).length;
  const cf = d.kind === "day" ? conflicts(d) : {};
  const q = S.q.trim().toLowerCase();
  const match = (it) => !q || it.variants.some((v) => (v.title + "\n" + v.details).toLowerCase().includes(q));

  let html = "";
  if (S.conflict) html += `<div class="banner"><b>行程已在其他裝置更新。</b><br>你這部手機也有未上傳的修改，請選擇保留哪一個版本。
    <div class="row"><button class="btn" data-act="take-server">載入最新版本</button><button class="btn" data-act="force-save">用我的版本覆蓋</button></div></div>`;

  html += `<p class="eyebrow">${d.kind === "day" ? `THE JOURNEY / ${String(dayNo).padStart(2, "0")}` : esc((d.sub || "").toUpperCase())}</p>
    <div class="day-head"><h1>${d.kind === "day" ? `${esc(d.label)}<span class="sep"></span>` : ""}${esc(d.title)}</h1>
    <button class="btn" data-act="edit-day">✎ 編輯</button></div>
    ${d.subtitle ? `<p class="subtitle">${esc(d.subtitle)}</p>` : ""}
    <div class="tools">
      ${all.length ? `<div class="progress">${done} / ${all.length} 已完成<div class="track"><i style="width:${all.length ? (done / all.length) * 100 : 0}%"></i></div></div>` : ""}
      <input class="search" type="search" placeholder="搜尋地點或交通…" value="${esc(S.q)}" data-act="search">
    </div>`;

  const hit = (it) => match(it) || (it.children || []).some(match);
  const items = seq(d).filter(({ item }) => hit(item));
  if (d.kind === "day") {
    html += `<div class="timeline">`;
    if (q) for (const { item, arr, idx, branch } of items) html += itemHTML(item, d, cf[item.id], q, { at: idx, route: branch ? activeRoute(branch).id : "", shared: !branch });
    else {
      html += insertRow(-1, "在最前面加入", "");
      d.items.forEach((n, i) => {
        if (isBranch(n)) html += branchHTML(d, n, i, cf);
        else html += itemHTML(n, d, cf[n.id], q, { at: i, route: "", shared: true });
      });
    }
    if (!d.items.length) html += `<div class="empty">還沒有行程<br><button class="btn primary" data-act="add-main" data-at="-1" style="margin-top:10px">＋ 新增第一個行程</button></div>`;
    html += `</div>`;
  } else {
    html += `<div class="info-list">${items.map(({ item, idx }) => itemHTML(item, d, null, q, { at: idx, route: "", shared: false })).join("")}</div>`;
    html += `<div class="insert" style="margin-top:12px"><button data-act="add-main" data-at="${d.items.length - 1}">＋ 新增</button><button data-act="add-main" data-type="info" data-at="${d.items.length - 1}">ⓘ 加入資訊</button></div>`;
  }
  if (q && !items.length) html += `<div class="empty">找不到「${esc(S.q)}」</div>`;

  const main = $("#main");
  const focused = document.activeElement && document.activeElement.dataset.act === "search";
  main.innerHTML = html;
  if (focused) { const s = $(".search"); s.focus(); s.setSelectionRange(s.value.length, s.value.length); }
  syncUI();
}

// 分叉路線：在分叉點顯示路線選擇，只有分叉內的行程會切換
function branchHTML(d, b, bi, cf) {
  const r = activeRoute(b);
  const chips = b.routes.map((x, i) => `<button class="plan ${x.id === r.id ? "on" : ""}" data-act="route" data-branch="${esc(b.id)}" data-id="${esc(x.id)}"><b>${planLetter(i)}</b><span>${esc(x.name || "路線 " + planLetter(i))}</span></button>`).join("");
  let html = `<div class="branch"><div class="branch-head"><span class="dot fork">⑂</span>
    <div class="plans"><div class="plans-label">分叉路線 · 選擇其中一條<button class="plan-edit" data-act="branch-edit" data-id="${esc(b.id)}">✎ 管理</button></div>
    <div class="plan-chips">${chips}<button class="plan add" data-act="route-add" data-branch="${esc(b.id)}" aria-label="新增路線">＋</button></div></div></div>
    <div class="branch-body">`;
  html += insertRow(-1, "在路線開頭加入", r.id);
  r.items.forEach((it, k) => { html += itemHTML(it, d, cf[it.id], "", { at: k, route: r.id, shared: false }); });
  if (!r.items.length) html += `<div class="empty small">這條路線還沒有行程</div>`;
  html += `</div><div class="branch-end"><span class="dot fork">⑂</span><span>路線匯合 · 以下行程共用</span></div></div>`;
  html += insertRow(bi, "在匯合後加入", "");
  return html;
}

// 每張圖片的顯示方式：圖片自己的設定 → 行程的設定 → 底部按鈕的整體設定
function photoModeOf(it, v, p) {
  const own = v.photoModes && v.photoModes[p];
  if (own === "full" || own === "thumb") return own;
  if (it.photoMode === "full" || it.photoMode === "thumb") return it.photoMode;
  return S.photoMode;
}
const MODE_LABEL = { auto: "跟隨", full: "大圖", thumb: "縮圖" };

function bodyHTML(it, isChild) {
  const v = V(it);
  const open = S.open.has(it.id);
  const long = v.type !== "info" && ((v.details || "").split("\n").length > 4 || (v.details || "").length > 160);
  const all = v.links || [];
  const links = [...all.filter(isMapLink), ...all.filter((l) => !isMapLink(l))].map((l) => {
    const u = safeUrl(l.url); if (!u) return "";
    return `<a href="${esc(u)}" target="_blank" rel="noopener">${isMapLink(l) ? "📍 " : "↗ "}${esc(l.label || u)}</a>`;
  }).join("");
  // 連續的縮圖排成一行橫向捲動；大圖獨立一行，保持原本次序
  let photos = "", run = "";
  const flush = () => { if (run) { photos += `<div class="photos">${run}</div>`; run = ""; } };
  for (const p of v.photos || []) {
    const img = `<img src="${esc(photoUrl(p))}" loading="lazy" alt="" data-act="photo" data-id="${esc(it.id)}" data-photo="${esc(p)}">`;
    if (photoModeOf(it, v, p) === "full") { flush(); photos += `<div class="photos full">${img}</div>`; }
    else run += img;
  }
  flush();
  const chips = it.variants.length > 1
    ? `<div class="alt-label">備選方案（點選切換）</div><div class="variants">${it.variants.map((x, k) =>
        `<button class="chip ${k === (it.active || 0) ? "on" : ""}" data-act="variant" data-id="${esc(it.id)}" data-k="${k}">${String.fromCharCode(65 + k)}・${esc(x.title || "未命名")}</button>`).join("")}</div>` : "";
  const H = isChild ? "h3" : "h2";
  return `${chips}<${H}>${esc(v.title || "（未命名）")}</${H}>
    ${v.details ? `<div class="details ${long && !open ? "clamp" : ""}">${esc(v.details)}</div>${long ? `<button class="more" data-act="toggle" data-id="${esc(it.id)}">${open ? "收起" : "展開全部"}</button>` : ""}` : ""}
    ${photos}
    ${links ? `<div class="links">${links}</div>` : ""}`;
}

function timeLabel(it) {
  if (it.start == null) return "";
  const v = V(it);
  return v.dur ? `${fmt(it.start)}–${fmt(it.start + v.dur)}` : fmt(it.start);
}

function insertRow(at, label, route) {
  const r = route ? ` data-route="${esc(route)}"` : "";
  return `<div class="insert"><button data-act="add-main" data-at="${at}"${r}>＋ ${label}主行程</button><button data-act="add-main" data-type="info" data-at="${at}"${r}>ⓘ 資訊</button></div>`;
}

// 資訊卡：編輯按鈕在右上角，不用打卡、沒有下排按鈕、內容不摺疊
function infoCard(it, isChild) {
  const id = esc(it.id);
  return `<div class="meta"><span class="kind info-kind">ⓘ 資訊</span><button class="edit-top" data-act="edit" data-id="${id}">✎ 編輯</button></div>${bodyHTML(it, isChild)}`;
}
// 已完成的行程：預設摺疊，只顯示時間和標題
function collapsed(it) {
  return it.done && !isInfo(it) && !S.expanded.has(it.id);
}
function foldBtn(it) {
  if (!it.done || isInfo(it)) return "";
  const c = collapsed(it);
  return `<button class="fold" data-act="fold" data-id="${esc(it.id)}">${c ? "展開 ▾" : "收起 ▴"}</button>`;
}

function itemHTML(it, d, warn, q, pos = { at: 0, route: "", shared: false }) {
  const v = V(it);
  const id = esc(it.id);
  const kids = (it.children || []).map((c) => {
    const cv = V(c);
    if (isInfo(c)) return `<div class="child info">${infoCard(c, true)}</div>`;
    if (collapsed(c)) return `<div class="child done folded"><div class="meta">${c.start != null ? `<span class="time">${timeLabel(c)}</span>` : ""}<span class="mini-title">${esc(cv.title)}</span>${foldBtn(c)}
      <button class="check" data-act="done" data-id="${esc(c.id)}" aria-label="取消完成">✓</button></div></div>`;
    return `<div class="child ${c.done ? "done" : ""}">
      <div class="meta">${c.start != null ? `<span class="time">${timeLabel(c)}</span>` : ""}<span class="kind">${TYPE_ICON[cv.type] || ""} 子行程</span>${foldBtn(c)}
      <button class="check" data-act="done" data-id="${esc(c.id)}" aria-label="完成">${c.done ? "✓" : ""}</button></div>
      ${bodyHTML(c, true)}
      <div class="actions"><button data-act="edit" data-id="${esc(c.id)}">✎ 編輯</button><button data-act="quick-photo" data-id="${esc(c.id)}">📷 加圖片</button></div>
    </div>`;
  }).join("");
  const after = d.kind === "day" && !q ? insertRow(pos.at, "在這之後加入", pos.route) : "";
  if (isInfo(it)) {
    return `<div class="item info ${q ? "hit" : ""}" data-item="${id}">${d.kind === "day" ? `<span class="dot"></span>` : ""}
      <div class="card">${infoCard(it, false)}${kids ? `<div class="children">${kids}</div>` : ""}</div>${after}</div>`;
  }
  if (collapsed(it)) {
    return `<div class="item done folded ${it.locked ? "locked" : ""}" data-item="${id}">${d.kind === "day" ? `<span class="dot"></span>` : ""}
      <div class="card"><div class="meta">${it.start != null ? `<span class="time">${timeLabel(it)}</span>` : ""}<span class="mini-title">${esc(v.title)}</span>${foldBtn(it)}
      <button class="check" data-act="done" data-id="${id}" aria-label="取消完成">✓</button></div></div>${after}</div>`;
  }
  return `<div class="item ${it.done ? "done" : ""} ${it.locked ? "locked" : ""} ${q ? "hit" : ""}" data-item="${id}">
    ${d.kind === "day" ? `<span class="dot"></span>` : ""}
    <div class="card">
      <div class="meta">
        ${it.start != null ? `<span class="time">${timeLabel(it)}</span>` : ""}
        ${it.locked ? `<span class="lock">🔒 固定</span>` : ""}
        <span class="kind">${TYPE_ICON[v.type] || ""} ${TYPES[v.type] || ""}</span>${foldBtn(it)}
        <button class="check" data-act="done" data-id="${id}" aria-label="完成">${it.done ? "✓" : ""}</button>
      </div>
      ${warn ? `<div class="warn">⚠ ${esc(warn)}</div>` : ""}
      ${bodyHTML(it, false)}
      ${kids ? `<div class="children">${kids}</div>` : ""}
      <div class="actions">
        <button data-act="edit" data-id="${id}">✎ 編輯</button>
        <button data-act="add-child" data-id="${id}">＋ 子行程</button>
        <button data-act="quick-photo" data-id="${id}">📷 加圖片</button>
        ${d.kind === "day" && pos.shared ? `<button data-act="branch-new" data-id="${id}">⑂ 分叉</button>` : ""}
      </div>
    </div>
    ${after}
  </div>`;
}

// ---------- 編輯行程 ----------
let ED = null; // { mode: 'new-main'|'new-child'|'edit', dayId, at, parentId, draft, k, isChild }

function openEditor(opts) {
  const d = day();
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
  v.title = f.title.value.trim();
  v.type = f.type.value;
  v.details = f.details.value.replace(/\s+$/, "");
  v.links = readLinkRows();
  if (!ED.info && f.start) {
    const s = parseHHMM(f.start.value), e = parseHHMM(f.end.value);
    if (s == null) ED.draft.start = null;
    else {
      const base = ED.orig && ED.orig.start != null && ED.orig.start >= 1440 ? 1440 : 0;
      ED.draft.start = s + base;
    }
    if (s != null && e != null) { let dur = e - s; if (dur < 0) dur += 1440; v.dur = dur; }
    else if (e == null) v.dur = 0;
    if (f.locked) ED.draft.locked = f.locked.checked;
  }
  if (v.type === "info") { ED.draft.start = null; v.dur = 0; ED.draft.locked = false; ED.draft.done = false; }
  else if (!ED.info && ED.draft.start == null && !ED.isChild && !f.start) {
    // 由「資訊」改回一般行程：給一個預設時間
    const d = day(); const list = seq(d).map((x) => x.item); const i = list.findIndex((x) => x.id === ED.draft.id);
    const prev = list.slice(0, i < 0 ? list.length : i).reverse().find((x) => x.start != null);
    ED.draft.start = prev ? endOf(prev) : 9 * 60; if (!v.dur) v.dur = 60;
  }
  if (f.photoMode.value === "auto") delete ED.draft.photoMode; else ED.draft.photoMode = f.photoMode.value;
}

function renderEditor() {
  const it = ED.draft, v = it.variants[ED.k];
  const typeInfo = v.type === "info";
  const title = typeInfo ? (ED.mode === "edit" ? "編輯資訊" : "新增資訊") : ED.mode === "edit" ? (ED.isChild ? "編輯子行程" : "編輯行程") : ED.mode === "new-child" ? "新增子行程" : "新增主行程";
  const isMainInDay = !ED.info && !ED.isChild && !typeInfo;
  const showRipple = isMainInDay;
  const rippleLabel = ED.mode === "edit" ? "時間或長度改變時，之後的行程跟著移動" : "自動把之後的行程延後";
  const sheet = $("#sheet");
  sheet.innerHTML = `<div class="sheet-body" role="dialog" aria-label="${title}">
    <div class="sheet-head"><h2>${title}</h2><button class="btn ghost" data-act="close">✕</button></div>
    ${ED.isChild ? `<p class="hint">子行程顯示在主行程下面，新增或修改都<b>不會</b>改動其他行程的時間。</p>` : ""}
    <form id="edForm" autocomplete="off" onsubmit="return false">
      ${it.variants.length > 1 || ED.mode === "edit" ? `<div class="box"><div class="box-title"><span>備選方案</span><button type="button" class="btn small" data-act="ed-add-variant">＋ 新增方案</button></div>
        <div class="vtabs">${it.variants.map((x, k) => `<button type="button" class="chip ${k === ED.k ? "on" : ""}" data-act="ed-variant" data-k="${k}">${String.fromCharCode(65 + k)}・${esc(x.title || "未命名")}</button>`).join("")}</div>
        <p class="hint">儲存時，目前正在編輯的方案會設為「使用中」。${it.variants.length > 1 ? `<button type="button" class="btn small danger" data-act="ed-del-variant" style="margin-left:6px">刪除此方案</button>` : ""}</p></div>` : ""}
      <label class="field"><span>標題</span><input type="text" name="title" value="${esc(v.title)}" placeholder="例如：大阪城公園"></label>
      <label class="field"><span>類型</span><select name="type">${Object.entries(TYPES).map(([k, t]) => `<option value="${k}" ${k === v.type ? "selected" : ""}>${t}</option>`).join("")}</select></label>
      <label class="field"><span>這個行程的圖片顯示方式（個別圖片可再按下方標籤設定）</span><select name="photoMode">${[["auto", "跟隨整體設定"], ["full", "永遠顯示大圖"], ["thumb", "永遠顯示縮圖"]].map(([k, t]) => `<option value="${k}" ${k === (it.photoMode || "auto") ? "selected" : ""}>${t}</option>`).join("")}</select></label>
      ${typeInfo ? `<p class="hint">資訊不佔時間，不會影響前後行程的時間。</p>` : ""}
      ${ED.info || typeInfo ? "" : `<div class="grid2">
        <label class="field"><span>開始時間${ED.isChild ? "（可留空）" : ""}</span><input type="time" name="start" value="${hhmm(it.start)}"></label>
        <label class="field"><span>結束時間${ED.isChild ? "（可留空）" : ""}</span><input type="time" name="end" value="${it.start != null && v.dur ? hhmm(it.start + v.dur) : ""}"></label>
      </div>
      ${ED.isChild ? "" : `<label class="checkline"><input type="checkbox" name="locked" ${it.locked ? "checked" : ""}><span>固定時間 🔒<small>航班、訂位等不能移動的行程。前面行程延後時，會停在這裡，不會把它推後。</small></span></label>`}
      ${showRipple ? `<label class="checkline"><input type="checkbox" name="ripple" checked><span>${rippleLabel}</span></label>` : ""}`}
      <label class="field"><span>詳情</span><textarea name="details" placeholder="地址、交通、營業時間、備註…">${esc(v.details)}</textarea></label>
      ${linkSection(v, "map")}
      ${linkSection(v, "web")}
      <div class="field"><span>圖片</span><div class="edit-photos" id="edPhotos">${editPhotos(v)}</div></div>
      <input type="file" id="edFile" accept="image/*" multiple hidden>
    </form>
    <div class="sheet-foot">
      ${ED.mode === "edit" ? `<button class="btn danger" data-act="ed-delete">刪除</button>` : ""}
      <span class="grow"></span>
      <button class="btn" data-act="close">取消</button>
      <button class="btn primary" data-act="ed-save">儲存</button>
    </div>
  </div>`;
  sheet.hidden = false;
  document.body.style.overflow = "hidden";
}
// 地圖、連結：每行分開填「名稱」和「網址」
function linkSection(v, kind) {
  const rows = (v.links || []).filter((l) => (kind === "map") === isMapLink(l));
  if (!rows.length) rows.push({ label: "", url: "", _blank: true });
  const isMap = kind === "map";
  return `<div class="field linkbox"><span>${isMap ? "📍 地圖" : "↗ 連結"}</span>
    ${rows.map((l) => `<div class="lrow" data-kind="${kind}">
      <input type="text" class="l-label" value="${esc(l.label || "")}" placeholder="${isMap ? "地點名稱（例如：露天神社）" : "連結名稱（例如：官方網站）"}">
      <div class="l-url-row"><input type="url" class="l-url" inputmode="url" autocapitalize="off" value="${esc(l.url || "")}" placeholder="${isMap ? "Google 地圖網址（可留空）" : "https://…"}">
      <button type="button" class="l-del" data-act="link-del" aria-label="刪除">✕</button></div></div>`).join("")}
    <button type="button" class="btn small" data-act="link-add" data-kind="${kind}">＋ 新增${isMap ? "地圖" : "連結"}</button>
    ${isMap ? `<small class="hint">只填地點名稱、網址留空時，會自動用 Google 地圖搜尋這個名稱。</small>` : ""}</div>`;
}
function readLinkRows() {
  const out = [];
  for (const row of $$("#edForm .lrow")) {
    const kind = row.dataset.kind;
    const label = row.querySelector(".l-label").value.trim();
    const raw = row.querySelector(".l-url").value.trim();
    if (!label && !raw) continue;
    let url = normUrl(raw);
    if (kind === "map" && !raw && label) url = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(label);
    out.push({ kind, label: label || (url ? url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0] : ""), url: url || "", _raw: raw, _row: row });
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
  $("#sheet").hidden = true; $("#sheet").innerHTML = ""; ED = null;
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
  if (!v.title) return ["title", "請輸入標題"];
  const f = $("#edForm");
  if (f.start && !ED.isChild && v.type !== "info" && !ED.info && !f.start.value) return ["start", "請輸入開始時間（主行程需要時間）"];
  if (f.start && f.end.value && !f.start.value) return ["start", "已填結束時間，請同時填開始時間"];
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
    for (const x of it.variants) x.links = (x.links || []).map(({ kind, label, url }) => ({ kind: kind || (MAP_RE.test(url) ? "map" : "web"), label, url }));
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
function openDayEditor(isNew) {
  const d = isNew ? { id: uid(), kind: "day", label: "DAY " + (S.doc.days.filter((x) => x.kind === "day").length + 1), sub: "", title: "", subtitle: "", items: [] } : day();
  const sheet = $("#sheet");
  sheet.innerHTML = `<div class="sheet-body"><div class="sheet-head"><h2>${isNew ? "新增分頁" : "編輯分頁"}</h2><button class="btn ghost" data-act="close">✕</button></div>
    <form id="dayForm" onsubmit="return false">
      <div class="grid2"><label class="field"><span>分頁名稱</span><input type="text" name="label" value="${esc(d.label)}"></label>
      <label class="field"><span>分頁小字（如 10.26）</span><input type="text" name="sub" value="${esc(d.sub)}"></label></div>
      <label class="field"><span>標題</span><input type="text" name="title" value="${esc(d.title)}" placeholder="10月26日（一）"></label>
      <label class="field"><span>副標題</span><input type="text" name="subtitle" value="${esc(d.subtitle)}"></label>
      <label class="field"><span>類型</span><select name="kind"><option value="day" ${d.kind === "day" ? "selected" : ""}>行程日（有時間軸）</option><option value="info" ${d.kind === "info" ? "selected" : ""}>資料清單（住宿、備選等）</option></select></label>
      ${isNew ? "" : `<div class="grid2"><button type="button" class="btn" data-act="day-move" data-dir="-1">← 往左移</button><button type="button" class="btn" data-act="day-move" data-dir="1">往右移 →</button></div>`}
    </form>
    <div class="sheet-foot">${isNew ? "" : `<button class="btn danger" data-act="day-delete">刪除分頁</button>`}<span class="grow"></span>
    <button class="btn" data-act="close">取消</button><button class="btn primary" data-act="day-save" data-new="${isNew ? 1 : ""}" data-id="${esc(d.id)}">儲存</button></div></div>`;
  sheet.hidden = false;
  document.body.style.overflow = "hidden";
}

// ---------- 選單 ----------
function openBranchEditor(bid) {
  const d = day(); const b = findBranch(d, bid); if (!b) return;
  const r = activeRoute(b), i = b.routes.indexOf(r);
  const sheet = $("#sheet");
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
  sheet.innerHTML = `<div class="sheet-body"><div class="sheet-head"><h2>⑂ 從這裡分叉</h2><button class="btn ghost" data-act="close">✕</button></div>
    <p class="hint">由「${esc(V(d.items[i]).title)}」開始分叉。請選擇分叉到哪一項為止，之後的行程會共用。<br>建立後會多一條「路線 B」（內容先複製路線 A），直接修改就可以。</p>
    <form id="branchForm" onsubmit="return false"><label class="field"><span>路線 B 名稱</span><input type="text" name="nameB" placeholder="例如：先參拜，再喫茶"></label>
    <label class="field"><span>路線 A（目前）名稱</span><input type="text" name="nameA" placeholder="例如：先喫茶，後參拜"></label>
    <div class="field"><span>分叉包括到：</span>${opts}</div></form>
    <div class="sheet-foot"><span class="grow"></span><button class="btn" data-act="close">取消</button><button class="btn primary" data-act="branch-create" data-id="${esc(id)}">建立分叉</button></div></div>`;
  sheet.hidden = false; document.body.style.overflow = "hidden";
}

function openMenu() {
  const sheet = $("#sheet");
  sheet.innerHTML = `<div class="sheet-body"><div class="sheet-head"><h2>更多</h2><button class="btn ghost" data-act="close">✕</button></div>
    <div class="menu-list">
      <button data-act="revisions">🕘 版本紀錄（可還原）</button>
      <button data-act="export">⬇ 匯出行程 JSON</button>
      <button data-act="import">⬆ 匯入行程 JSON</button>
      <button data-act="rename-trip">✎ 修改旅程名稱</button>
      <button data-act="reload">↻ 重新載入最新版本</button>
    </div>
    <p class="hint" style="margin-top:14px">這個網站是公開的，任何人有網址都可以查看和編輯。所有修改都會留下版本紀錄，改錯了可以在「版本紀錄」還原。</p>
    <input type="file" id="importFile" accept="application/json,.json" hidden></div>`;
  sheet.hidden = false;
  document.body.style.overflow = "hidden";
}
async function openRevisions() {
  const sheet = $("#sheet");
  sheet.innerHTML = `<div class="sheet-body"><div class="sheet-head"><h2>版本紀錄</h2><button class="btn ghost" data-act="close">✕</button></div><div id="revList" class="hint">載入中…</div></div>`;
  try {
    const r = await fetch("/api/revisions", { cache: "no-store" });
    const { revisions } = await r.json();
    $("#revList").innerHTML = revisions.length ? revisions.map((x) =>
      `<div class="rev"><span>第 ${x.version} 版<br><small class="hint">${new Date(x.created_at).toLocaleString("zh-HK", { hour12: false })}</small></span><button class="btn small" data-act="restore" data-id="${x.id}">還原此版本</button></div>`).join("")
      : "還沒有舊版本。";
  } catch (e) { $("#revList").textContent = "載入失敗：" + e.message; }
}

// ---------- 事件 ----------
document.addEventListener("click", async (e) => {
  const t = e.target.closest("[data-act]");
  if (!t) {
    if (e.target.id === "sheet") closeSheet();
    if (e.target.closest("#lightbox")) $("#lightbox").hidden = true;
    return;
  }
  const a = t.dataset.act, id = t.dataset.id;
  switch (a) {
    case "tab": S.dayId = id; S.q = ""; render(); window.scrollTo(0, 0); break;
    case "add-day": openDayEditor(true); break;
    case "edit-day": openDayEditor(false); break;
    case "done": S.expanded.delete(id); commit(() => { const f = findItem(id); f.item.done = !f.item.done; }); break;
    case "toggle": S.open.has(id) ? S.open.delete(id) : S.open.add(id); render(); break;
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
    case "edit": openEditor({ mode: "edit", id }); break;
    case "quick-photo": {
      const inp = $("#quickPhoto"); inp.dataset.id = id; inp.value = ""; inp.click(); break;
    }
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
      commit(() => { const f = findItem(id); const v = V(f.item); v.photos = v.photos.filter((p) => p !== t.dataset.photo); if (v.photoModes) delete v.photoModes[t.dataset.photo]; }, "已移除圖片");
      break;
    case "lb-mode":
      $("#lightbox").hidden = true;
      commit(() => { const f = findItem(id); const v = V(f.item); v.photoModes = v.photoModes || {}; v.photoModes[t.dataset.photo] = t.dataset.mode; },
        t.dataset.mode === "full" ? "這張圖片改為大圖顯示" : "這張圖片改為縮圖顯示");
      break;
    case "close": closeSheet(); break;
    case "ed-save": saveEditor(); break;
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
      v.links = (v.links || []).map(({ kind, label, url }) => ({ kind, label, url }));
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
          const lastDay = doc.days.map((x) => x.kind).lastIndexOf("day");
          doc.days.splice(lastDay + 1, 0, d);
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
        commit((doc) => { doc.days = doc.days.filter((x) => x.id !== S.dayId); S.dayId = doc.days[0]?.id; }, "已刪除分頁");
      } else { t.textContent = "再按一次確定刪除"; t.dataset.sure = "1"; }
      break;
    }
    case "undo": $("#toast").hidden = true; undo(); break;
    case "take-server": S.doc = S.conflict.doc; S.version = S.conflict.version; S.conflict = null; S.pending = false; ls.del(LS_PENDING); persistLocal(false); render(); toast("已載入最新版本"); break;
    case "force-save": S.conflict = null; S.pending = true; await save(true); render(); break;
    case "revisions": openRevisions(); break;
    case "restore": {
      try {
        const r = await fetch("/api/revisions/" + id); const data = await r.json();
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
      aEl.download = (S.doc.title || "trip") + ".json"; aEl.click(); setTimeout(() => URL.revokeObjectURL(aEl.href), 2000);
      break;
    }
    case "import": $("#importFile").click(); break;
    case "rename-trip": {
      const name = prompt("旅程名稱", S.doc.title || ""); // 單純文字輸入，非阻塞流程
      if (name != null) { closeSheet(); commit((doc) => { doc.title = name.trim() || "旅行手帳"; }, "已改名"); }
      break;
    }
    case "reload": ls.del(LS_DOC); location.reload(); break;
  }
});

$("#undoBtn").addEventListener("click", undo);
$("#syncText").addEventListener("click", () => { if (S.pending) { S.saveError = null; save(); } });
function setPhotoMode(m) {
  S.photoMode = m; ls.set("trip.photoMode", m);
  const b = $("#photoModeBtn");
  b.textContent = m === "full" ? "🖼 大圖" : "▦ 縮圖";
  b.setAttribute("aria-label", "圖片顯示：" + (m === "full" ? "大圖" : "縮圖") + "（按一下切換）");
}
setPhotoMode(ls.get("trip.photoMode") === "full" ? "full" : "thumb");
$("#photoModeBtn").addEventListener("click", () => {
  setPhotoMode(S.photoMode === "full" ? "thumb" : "full");
  render();
  toast(S.photoMode === "full" ? "圖片改為大圖顯示" : "圖片改為縮圖顯示");
});
$("#menuBtn").addEventListener("click", openMenu);
document.addEventListener("input", (e) => {
  if (e.target.classList && e.target.classList.contains("invalid")) { e.target.classList.remove("invalid"); const er = e.target.closest(".field")?.querySelector(".field-err"); if (er) er.remove(); }
  if (e.target.dataset.act === "search") { S.q = e.target.value; render(); }
});
document.addEventListener("change", async (e) => {
  if (e.target.name === "type" && e.target.form && e.target.form.id === "edForm") { readForm(); renderEditor(); return; }
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
    const files = [...e.target.files], id = e.target.dataset.id; if (!files.length) return;
    toast(`上傳中（${files.length} 張）…`);
    try {
      const ids = await uploadFiles(files);
      commit(() => { const f = findItem(id); V(f.item).photos.push(...ids); }, `已加入 ${ids.length} 張圖片`);
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

if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
load();
})();
