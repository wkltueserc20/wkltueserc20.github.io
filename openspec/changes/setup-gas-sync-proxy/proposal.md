## Why

目前的 Google Drive 同步採用「隱式流 (Implicit Flow)」，導致 `access_token` 每小時過期且無法自動背景續約（受限於 iOS Safari 的 Cookie 政策）。這造成使用者在操作時會頻繁遇到帳號選擇視窗。透過實作 GAS 同步代理人 (Authorization Code Flow)，我們可以將長效的 `refresh_token` 存在 GAS 端，實現「一次授權，長期有效」的無感同步體驗。

## What Changes

- **GAS 腳本升級**：將原有的 LINE 通知 GAS 腳本轉化為具備 OAuth 換票與 Drive API 代理能力的「同步中轉站」。
- **App 授權流重構**：從原本請求 Token 改為請求 `Authorization Code`，並傳送至 GAS 進行初次綁定。
- **資料路徑變更**：App 所有的讀取與寫入請求改為傳送至 GAS URL，由 GAS 代表使用者操作 Google Drive。
- **持久化授權**：GAS 將 `refresh_token` 存於 `PropertiesService`，確保 App 端不再需要處理過期跳窗。

## Capabilities

### New Capabilities
- `gas-proxy-sync`: 實現透過自建代理伺服器進行雲端資料交換的功能。
- `long-term-auth`: 支援 Refresh Token 模式的長效身份驗證。

### Modified Capabilities
- `data-sync`: 將原本與 Google Drive 的通訊邏輯遷移至與 GAS 通訊。

## Impact

- `src/hooks/useSync.ts`: 核心同步邏輯重構。
- `src/components/Settings/SettingsPanel.tsx`: 授權介面調整。
- 外部依賴：需要更新 Google Apps Script 端的代碼。
