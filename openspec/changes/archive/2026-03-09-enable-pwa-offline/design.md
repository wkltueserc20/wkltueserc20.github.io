## Context

目前應用程式是一個純網頁應用（SPA），雖然有 `manifest.json` 但缺乏 Service Worker，無法在離線時處理網路請求。我們需要一套自動化的快取方案來保存應用程式的骨架。

## Goals / Non-Goals

**Goals:**
- 將應用程式轉化為完整的 PWA。
- 實現「離線秒開」的啟動體驗。
- 確保所有的靜態資產（Assets）在使用者初次訪問後被持久化快取。
- 實作自動更新邏輯，確保使用者始終使用最新版本。

**Non-Goals:**
- 不涉及 Google Drive API 的離線隊列（即沒網路時不暫存雲端請求，僅允許本地紀錄，待連線後由現有的智慧合併處理）。
- 不處理大容量多媒體檔案的快取。

## Decisions

### 1. 使用 `vite-plugin-pwa`
- **決策**：採用 `vite-plugin-pwa` 插件進行整合。
- **理由**：它是 Vite 生態系中最成熟的 PWA 解決方案，能自動生成 Service Worker 並與 Vite 的打包流程完美整合，減少手動維護 Workbox 腳本的負擔。

### 2. 更新策略：`registerType: 'autoUpdate'`
- **決策**：設定插件為自動更新模式。
- **理由**：這能提供最像原生 App 的體驗。當開發者推送新版本到 GitHub Pages 時，Service Worker 會在背景靜默下載新版，並在下次開啟時自動切換，不需要彈出煩人的「發現新版本，請點擊更新」對話框。

### 3. 快取策略：`Cache-First` (預設產出物)
- **決策**：對 JS/CSS 使用 Cache-First 策略。
- **理由**：這些檔案在建構時會有雜湊值（Hash），確保了版本的一致性，使用快取優先能達到最快的啟動速度。

## Risks / Trade-offs

- **[Risk] 快取失效導致無法更新**：如果 Service Worker 設定錯誤，可能導致使用者一直看到舊版。
    - 🛡️ **Mitigation**: 使用 `autoUpdate` 並在 `main.tsx` 中正確導入註冊邏輯。
- **[Trade-off] 初次加載流量**：初次啟動時會同時下載並快取整個 App，流量會比平常多一點。
    - 🛡️ **Mitigation**: 由於 App 總體積不到 1MB，此影響可以忽略。
