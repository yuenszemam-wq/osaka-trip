# 旅行手帳（大阪之旅）

可以隨時編輯的行程網站，部署在 Cloudflare Pages，資料存在 Cloudflare D1。

## 功能
- 在手機上直接編輯行程：標題、時間、詳情、連結
- 每個行程都可以上傳圖片，上傳前自動壓縮
- **備選方案**：同一個行程可以存多個方案（A／B／C），一按就切換
- **主行程**：新增後，之後的行程時間會自動延後
- **子行程**：放在主行程下面，新增時不會改動任何時間
- **固定時間 🔒**：航班、訂位等行程不會被推後；時間撞到會顯示提示
- 復原、版本紀錄（保留最近 80 個版本，可以還原）、匯出／匯入 JSON
- 離線查看：在日本沒有網絡時仍可看到最後載入的行程；恢復連線後自動上傳修改
- 可以「加入主畫面」，像 App 一樣使用

## 第一次部署（iPhone 也可以做，約 5 分鐘）

1. **建立資料庫**：Cloudflare 控制台 → Storage & Databases → **D1 SQL Database** → Create → 名稱填 `osaka-trip` → Create。
   不用建立任何表格，網站第一次開啟時會自動建立，並載入現有行程。
2. **建立 Pages 專案**：Workers & Pages → Create → **Pages** 分頁 → **Connect to Git** → 選 GitHub 帳號 `yuenszemam-wq` → repo `osaka-trip`。
3. 建置設定：
   - Framework preset：**None**
   - Build command：**留空**
   - Build output directory：**`public`**
   
   然後按 Save and Deploy。
4. **綁定資料庫**：進入這個 Pages 專案 → Settings → **Bindings** → Add → **D1 database**
   - Variable name：**`DB`**（必須是大寫的 DB）
   - D1 database：選 `osaka-trip`
   
   Production 和 Preview 都要加。
5. **重新部署**：Deployments → 最新一次部署右邊的 ⋯ → **Retry deployment**。綁定要在重新部署後才會生效。
6. 打開 `https://<專案名>.pages.dev`，就會看到行程。

之後每次推送到 GitHub 的 `main`，Cloudflare 都會自動重新部署。

## 注意
- 網站是**公開**的：任何人有網址都可以查看和編輯。改錯了可以在「⋯ → 版本紀錄」還原。
- 圖片也存在 D1，每張壓縮到大約 1MB 以內。D1 免費額度有 5GB，足夠放幾千張相片。

## 本機開發
```
npm run dev     # http://localhost:8788，用 node:sqlite 模擬 D1
npm run seed    # 從 scripts/original.json 重新產生 lib/seed.js
```
