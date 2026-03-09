## 1. 環境準備 (Setup)

- [x] 1.1 安裝 `vite-plugin-pwa` 依賴。
- [x] 1.2 準備 PWA 圖示（已存在 `public/icon.svg`，需確認格式相容性）。

## 2. Vite 配置 (Vite Config)

- [x] 2.1 修改 `vite.config.ts` 引入 `VitePWA` 插件。
- [x] 2.2 配置 `VitePWA` 的 `registerType` 為 `autoUpdate`。
- [x] 2.3 在插件配置中定義 `manifest`（從現有的 `manifest.json` 遷移或直接引用）。
- [x] 2.4 配置 `workbox` 策略，確保所有資產都被納入快取。

## 3. 應用程式註冊 (Registration)

- [x] 3.1 修改 `src/main.tsx`，加入 `virtual:pwa-register` 註冊代碼。
- [x] 3.2 確保在開發環境與生產環境下 PWA 插件行為符合預期。

## 4. 驗證與測試 (Verification)

- [x] 4.1 執行生產環境建構 (`npm run build`)，檢查是否生成 `sw.js` 與 `registerSW.js`。
- [x] 4.2 部署到 GitHub Pages 並開啟飛航模式，測試是否能成功開啟 App。
- [x] 4.3 檢查 Chrome DevTools 的 Application 分頁，確認 Service Worker 已啟動且 Cache Storage 已填滿。
