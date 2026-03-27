## Why

同步速度是目前最大的痛點。GAS + Google Drive 架構每次同步需 2-10 秒（GAS 冷啟動 3-10 秒 + 6-15 次 Drive API call），導致使用體驗差。先前已透過 `smartSync` 協定優化（合併請求、並行化、fingerprint 快取），但瓶頸在 GAS 平台本身，無法進一步改善。

同時移除已不再使用的 LINE 通知功能，大幅簡化系統。

遷移到 Cloudflare Workers + D1 後，預期同步時間從 2-10 秒降至 0.1-0.5 秒。

## What Changes

### 新增：Cloudflare Workers + D1 同步後端
- 建立 Cloudflare Worker 作為 sync API (`POST /api/sync`)
- 建立 D1 SQLite 資料庫儲存所有紀錄
- 認證方式：syncSecret（與現有模式一致）
- 同步協定：client 送 `{ lastSyncAt, changes }` → server 回 `{ records, syncedAt }`
- 一次 UPSERT + 一次 SELECT 完成雙向同步，取代現有的 list/pull/push/fingerprint 流程

### 移除：GAS + Google Drive 同步
- 移除 `callGasProxy`、`callSmartSync`、所有 Drive API 相關邏輯
- 移除 CSV 序列化/反序列化（`csvUtils.ts` 的 sync 用途）
- 移除 MD5 fingerprint 快取機制
- 移除 Google OAuth 登入流程（`handleGoogleLogin`、`google.accounts.oauth2`）
- 移除 `googleClientId`、`googleFolderId`、`gasUrl` 設定欄位

### 移除：LINE 通知功能
- 移除 `sendLineAction`、`callGasApi`、`cancelGasSchedule`
- 移除 `lineToken`、`lineUserId`、`lineEnabled` 設定欄位
- 移除 GAS 端排程邏輯
- 移除 `corsproxy.io` CORS proxy 用法

### 簡化：Settings 面板
- 同步設定從 6 個欄位（gasUrl、syncSecret、googleClientId、lineToken、lineUserId、lineEnabled）簡化為 2 個（syncUrl、syncSecret）

## Capabilities

### New Capabilities
- `cloudflare-sync`: Cloudflare Workers + D1 雲端同步，單一 POST 請求完成雙向同步
- `simplified-settings`: 精簡的設定面板，只需 sync URL + 密碼

### Removed Capabilities
- `smart-sync-protocol`: GAS smartSync 協定（被 cloudflare-sync 取代）
- `parallel-drive-operations`: GAS fetchAll 並行化（不再需要）
- `dirty-date-tracking`: 按日期追蹤髒資料（改為按 record 追蹤 updatedAt）
- `line-notification`: LINE 推播通知功能

### Modified Capabilities
- `data-sync` (useSync.ts): 整個 hook 重寫，從 GAS/Drive 改為 Cloudflare Worker 呼叫
- `csv-export-import`: 保留匯出/匯入 CSV 功能（本地使用），移除 sync 用途

## Impact

### 前端 (React App)
- `src/hooks/useSync.ts` — 完全重寫：移除 GAS/Drive/LINE，改為 Cloudflare sync
- `src/types.ts` — BabyInfo 移除 LINE 和 Google 相關欄位，新增 `syncUrl`
- `src/components/Settings/SettingsPanel.tsx` — 大幅簡化設定 UI
- `src/App.tsx` — 移除 LINE 通知觸發邏輯、簡化 sync 呼叫
- `src/utils/csvUtils.ts` — 保留（匯出/匯入用），但移除 sync 相關用途
- `index.html` — 移除 Google GSI script tag

### 新增：Cloudflare 後端
- `worker/` — 新目錄，包含 Worker 程式碼和 D1 schema
- `worker/src/index.ts` — Worker 入口：路由、認證、sync 邏輯
- `worker/schema.sql` — D1 table 定義
- `worker/wrangler.toml` — Cloudflare 部署設定

### 移除
- `openspec/GAS_SCRIPT.gs` — 不再需要（可封存）

## Non-goals

- 多寶寶支援（目前一個 D1 database = 一個寶寶）
- 使用者帳號系統（繼續用 syncSecret 共享認證）
- 即時同步 / WebSocket（維持 pull-based 同步模式）
- 資料加密（私人使用，HTTPS 已足夠）
