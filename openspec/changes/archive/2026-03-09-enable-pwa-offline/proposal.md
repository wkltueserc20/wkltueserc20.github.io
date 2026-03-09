## Why

目前應用程式雖然可以加入主畫面，但在斷網情況下（如醫院地下室、飛機上、收訊不佳的室內）完全無法開啟。透過實作完整的 PWA 離線支援，可以確保應用程式具備「秒開」能力與「全天候可用性」，大幅提升育兒紀錄的可靠性。

## What Changes

- **引入 PWA 核心技術**：安裝並配置 `vite-plugin-pwa`。
- **實作 Service Worker**：自動快取所有的靜態資源（HTML, JS, CSS, 圖示）。
- **離線開啟能力**：確保在無網路連線時，應用程式依然能正常加載介面並讀取 LocalStorage。
- **自動更新機制**：設定為 "Auto Update" 模式，確保使用者能安靜地獲得最新版本而不需要手動重整。
- **Manifest 強化**：優化現有的 `manifest.json` 以完全符合 PWA 標準。

## Capabilities

### New Capabilities
- `offline-access`: 讓應用程式在完全斷網時依然能開啟並運作。
- `background-asset-caching`: 實現靜態資源的背景預載與更新。

### Modified Capabilities
- `app-launch`: 將啟動流程從「依賴網路」改為「快取優先 (Cache-First)」。

## Impact

- `package.json`: 新增 `vite-plugin-pwa` 依賴。
- `vite.config.ts`: 需要新增 PWA 插件配置。
- `src/main.tsx`: 需要加入 Service Worker 的註冊與更新邏輯。
