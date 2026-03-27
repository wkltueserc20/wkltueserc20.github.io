## Phase 1: Cloudflare 後端建立

- [ ] 註冊 Cloudflare 帳號，安裝 wrangler CLI (`npm i -g wrangler && wrangler login`)
- [ ] 建立 Worker 專案 (`worker/` 目錄，含 `wrangler.toml`、`src/index.ts`)
- [ ] 建立 D1 database (`wrangler d1 create baby-tracker`)
- [ ] 套用 D1 schema（records table + indices）
- [ ] 實作 Worker：`POST /api/sync` endpoint
  - syncSecret 驗證
  - UPSERT changes（LWW: 只寫入 updatedAt 較新的）
  - SELECT updated_at > lastSyncAt 回傳變更
  - camelCase ↔ snake_case 轉換
  - CORS headers（允許 GitHub Pages origin）
- [ ] 實作 Worker：`GET /api/health` 健康檢查
- [ ] 設定 SYNC_SECRET 環境變數 (`wrangler secret put SYNC_SECRET`)
- [ ] 部署 Worker (`wrangler deploy`) 並測試 API

## Phase 2: 前端 — 移除 LINE 通知

- [ ] `types.ts`：從 BabyInfo 移除 `lineToken`、`lineUserId`、`lineEnabled`
- [ ] `useSync.ts`：移除 `sendLineAction`、`callGasApi`、`cancelGasSchedule`
- [ ] `App.tsx`：移除 LINE 通知觸發邏輯（`isLateNight` 判斷、餵奶後排程提醒）
- [ ] `SettingsPanel.tsx`：移除 LINE 設定區塊（token、userId、enabled toggle、測試按鈕）
- [ ] `index.html`：移除 Google GSI `<script>` tag（LINE 和 OAuth 都不再需要）

## Phase 3: 前端 — 接入 Cloudflare 同步

- [ ] `types.ts`：BabyInfo 新增 `syncUrl`，移除 `gasUrl`、`googleClientId`、`googleFolderId`
- [ ] `useSync.ts`：重寫 sync hook
  - 新增 `lastSyncAt` state（localStorage 持久化）
  - 新增 `callSync(changes)` → POST to syncUrl
  - 重寫 `fullSync()`：讀 dirty records → POST → merge → save
  - 移除：`callGasProxy`、`callSmartSync`、`handleGoogleLogin`、fingerprint 邏輯、dirty date 邏輯
- [ ] `App.tsx`：更新 sync 呼叫（移除 Google OAuth 相關 state）
- [ ] `SettingsPanel.tsx`：重新設計同步設定區塊
  - 輸入欄位：Sync URL、Sync Secret
  - 連線狀態顯示
  - 立即同步按鈕
  - 移除 Google 連結按鈕

## Phase 4: 資料遷移 & 測試

- [ ] 首次同步測試：lastSyncAt=0 → 全量推送本地 IndexedDB 到 D1
- [ ] 雙裝置測試：兩台手機新增/編輯/刪除紀錄，確認同步正確
- [ ] 衝突測試：同時編輯同一筆紀錄，確認 LWW 行為正確
- [ ] 離線測試：離線操作 → 上線 → 自動同步
- [ ] 效能測試：確認同步時間 < 1 秒

## Phase 5: 清理

- [ ] 移除 `openspec/GAS_SCRIPT.gs`（或搬到 archive）
- [ ] 移除 `src/utils/csvUtils.ts` 中 sync 專用的函式（保留匯出/匯入用的）
- [ ] 移除 `src/utils/mergeUtils.ts`（如果 merge 邏輯改在 server 端做）或保留（如果 client 端仍做 merge）
- [ ] 封存 `openspec/changes/optimize-gas-sync-speed/`
- [ ] 更新版本號
