// 一次性資料更新：伺服器啟動時檢查 doc.migrations，未做過的才會執行
const clone = (o) => JSON.parse(JSON.stringify(o));
let n = 0;
const nid = (p) => `${p}-${Date.now().toString(36)}${(n++).toString(36)}`;

function copyItem(it, extra = {}, vExtra = {}) {
  const c = clone(it);
  c.id = nid("b");
  c.done = false;
  c.children = (c.children || []).map((x) => ({ ...x, id: nid("bc") }));
  c.variants = c.variants.map((v) => ({ ...v, id: nid("bv") }));
  Object.assign(c, extra);
  Object.assign(c.variants[c.active || 0], vExtra);
  return c;
}
function makeItem(start, dur, v, extra = {}) {
  return { id: nid("b"), start, locked: false, done: false, active: 0, children: [],
    variants: [{ id: nid("bv"), type: "place", dur, details: "", links: [], photos: [], ...v }], ...extra };
}

export const MIGRATIONS = [
  {
    id: "d1-plan-b",
    run(doc) {
      const d = doc.days.find((x) => x.id === "d1");
      if (!d || d.plans) return;
      const by = (id) => d.items.find((x) => x.id === id);
      const meet = by("i2-0"), flight = by("i2-1"), arrive = by("i2-2"), nankai = by("i2-3"), shrine = by("i2-9"), cafe = by("i2-7"), toSai = by("i2-10");
      if (!flight || !shrine || !cafe || !toSai) return;
      const restStart = d.items.indexOf(toSai);
      const hotelLink = { label: "大阪市浪速区恵美須西3-13-17", url: "https://www.google.com/maps/search/?api=1&query=大阪市浪速区恵美須西3-13-17" };

      const B = [
        meet ? copyItem(meet) : null,
        copyItem(flight),
        arrive ? copyItem(arrive, { start: 765 }, { dur: 60 }) : null,
        makeItem(825, 45, {
          title: "南海電鐵直達新今宮，至 Rest Collection 酒店寄存行李",
          type: "transport",
          details: (nankai ? nankai.variants[0].details + "\n" : "") +
            "步行至酒店：約8–10分鐘。\n寄存行李：入住時間是15:00後，提早寄存須先向住宿確認。",
          links: [...(nankai ? nankai.variants[0].links : []), hotelLink],
        }),
        copyItem(shrine, { start: 885 }, { dur: 60, title: "露天神社（お初天神）：參拜、入手特色戀愛御守" }),
        makeItem(945, 15, {
          title: "露天神社 → KITTE大阪",
          type: "transport",
          details: "交通：步行。\n需時：約15–20分鐘。\n16:00 場次須提前10分鐘到店（KITTE大阪6樓）。",
        }),
        copyItem(cafe, { start: 960, locked: true }, { dur: 60 }),
      ].filter(Boolean);

      const delta = 1020 - toSai.start; // 喫茶 17:00 結束後接回原本行程
      for (const it of d.items.slice(restStart)) {
        const c = copyItem(it);
        if (c.start != null) c.start += delta;
        for (const ch of c.children) if (ch.start != null) ch.start += delta;
        if (it === toSai) {
          const v = c.variants[0];
          v.title = "KITTE大阪 → 心齋橋";
          v.details = v.details.replace(/^步行至御堂筋線梅田站：約10分鐘。/, "步行至御堂筋線梅田站：約8–10分鐘。");
        }
        B.push(c);
      }

      d.plans = [
        { id: "plan-a", name: "方案 A：先喫茶，後參拜" },
        { id: "plan-b", name: "方案 B：先參拜，再喫茶" },
      ];
      d.activePlan = "plan-a";
      d.planItems = { "plan-b": B };
    },
  },
];

export function migrate(doc) {
  doc.migrations = doc.migrations || [];
  let changed = false;
  for (const m of MIGRATIONS) {
    if (doc.migrations.includes(m.id)) continue;
    m.run(doc);
    doc.migrations.push(m.id);
    changed = true;
  }
  return changed;
}
