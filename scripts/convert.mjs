// 把舊版行程 JSON 轉成新格式，輸出 lib/seed.js
// 用法：node scripts/convert.mjs scripts/original.json
import fs from "node:fs";

const src = JSON.parse(fs.readFileSync(process.argv[2] || "scripts/original.json", "utf8"));

const LOCKED = new Set(["i2-1", "i2-6", "i2-7", "i4-15"]);
const FOOD = new Set(["i2-7", "i2-15", "i4-9"]);

function parseTime(str) {
  const re = /(翌日)?\s*(\d{1,2}):(\d{2})/g;
  const out = [];
  let m;
  while ((m = re.exec(str || ""))) out.push(+m[2] * 60 + +m[3] + (m[1] ? 1440 : 0));
  return out;
}

function variant(id, it, extra = {}) {
  return {
    id,
    title: it.title,
    type: it.type === "transport" ? "transport" : "place",
    dur: 0,
    details: it.details || "",
    links: it.links || [],
    photos: [],
    ...extra,
  };
}

const days = [];
const dayMeta = [
  { date: "10.23" },
  { date: "10.24" },
  { date: "10.25" },
];
let dayIdx = 0;

for (const g of src.groups) {
  if (g.id === "g0") {
    days.push({
      id: "stay", kind: "info", label: "住宿", sub: "STAY", title: "住宿資料", subtitle: "",
      items: g.items.map((it) => ({ id: it.id, start: null, locked: false, done: false, active: 0, children: [], variants: [variant(it.id + "-a", it)] })),
    });
    continue;
  }
  if (g.id === "g4") continue; // 稍後併入對應行程

  const m = g.title.match(/DAY\s*(\d+)\s*[｜|]\s*(.*)/);
  const items = g.items.map((it) => {
    const t = parseTime(it.time);
    const v = variant(it.id + "-a", it);
    if (/UO\d+/.test(it.title)) v.type = "flight";
    if (FOOD.has(it.id)) v.type = "food";
    const item = { id: it.id, start: t[0] ?? null, locked: LOCKED.has(it.id), done: false, active: 0, children: [], variants: [v] };
    item._end = t[1];
    return item;
  });
  items.forEach((it, i) => {
    const next = items[i + 1];
    let dur;
    if (it._end != null) dur = it._end - it.start;
    else if (next && next.start != null) dur = next.start - it.start;
    else dur = 30;
    it.variants[0].dur = Math.max(0, dur);
    delete it._end;
  });
  days.push({
    id: "d" + (dayIdx + 1), kind: "day", label: "DAY " + (dayIdx + 1), sub: dayMeta[dayIdx]?.date || "",
    title: m ? m[2] : g.title, subtitle: g.subtitle || "", items,
  });
  dayIdx++;
}

// ---- 備選方案 ----
const allItems = days.flatMap((d) => d.items);
const byId = (id) => allItems.find((x) => x.id === id);
const opt = src.groups.find((g) => g.id === "g4").items;

// 日本橋購物：拆成兩間 + ROUND1
const nb = byId("i2-13");
if (nb) {
  const dur = nb.variants[0].dur;
  const L = nb.variants[0].links;
  nb.variants = [
    { id: "i2-13-a", title: "駿河屋 オタロード アニメ・ホビー館", type: "place", dur, photos: [],
      details: "地址：大阪市浪速区日本橋3-8-18 平田ビル2–3樓\n營業時間：10:00–21:00", links: L.slice(0, 2) },
    { id: "i2-13-b", title: "Joshin Super Kids Land 本店", type: "place", dur, photos: [],
      details: "地址：大阪市浪速区日本橋4-12-4\n營業時間：10:00–20:00", links: L.slice(2, 4) },
  ];
  const r1 = opt.find((x) => x.id === "i5-0");
  nb.variants.push(variant("i2-13-c", { ...r1, title: "ROUND1 千日前店" }, { dur }));
}
const rk = byId("i2-15");
if (rk) {
  const mg = opt.find((x) => x.id === "i5-1");
  rk.variants.push(variant("i2-15-b", { ...mg, title: "麥×鶏 MUGITOTORI", details: mg.details.trim() }, { dur: rk.variants[0].dur, type: "food" }));
}

days.push({ id: "ideas", kind: "info", label: "備選地點", sub: "IDEAS", title: "備選地點", subtitle: "未排進行程的地點，可以先放這裡", items: [] });

const doc = { title: "大阪之旅", days };
fs.writeFileSync(new URL("../lib/seed.js", import.meta.url), "// 由 scripts/convert.mjs 產生\nexport default " + JSON.stringify(doc, null, 1) + ";\n");
console.log(days.map((d) => `${d.label}: ${d.items.length} 項`).join("\n"));
for (const d of days) for (const it of d.items) if (it.start != null)
  console.log(d.label, String(Math.floor(it.start / 60)).padStart(2, "0") + ":" + String(it.start % 60).padStart(2, "0"), "+" + it.variants[0].dur, it.locked ? "🔒" : "", it.variants.map((v) => v.title).join(" / "));
