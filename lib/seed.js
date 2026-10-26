// 新網站第一次開啟時建立的示範旅程（可以直接修改或刪除）
export default {
  title: "我的第一個旅程",
  meta: { title: "我的第一個旅程", name: "Trip.", subtitle: "我的旅行手帳", dates: "", currency: "JPY", rate: null, rateDate: null },
  days: [
    { id: "stay", kind: "info", label: "住宿", sub: "STAY", title: "住宿資料", subtitle: "", items: [] },
    { id: "d1", kind: "day", label: "DAY 1", sub: "", title: "第一天", items: [
      { id: "s1", start: 540, locked: false, done: false, active: 0, children: [], variants: [{ id: "s1-a", title: "出發", type: "transport", dur: 60, details: "按「整理」可以修改、加入或刪除行程。", links: [], photos: [] }] },
      { id: "s2", start: 600, locked: false, done: false, active: 0, children: [], variants: [{ id: "s2-a", title: "第一個景點", type: "place", dur: 90, details: "", links: [], photos: [] }] },
      { id: "s3", start: 720, locked: false, done: false, active: 0, children: [], variants: [{ id: "s3-a", title: "午餐", type: "food", dur: 60, details: "", links: [], photos: [] }] },
    ] },
    { id: "ideas", kind: "info", label: "備選地點", sub: "IDEAS", title: "備選地點", subtitle: "", items: [] },
  ],
};
