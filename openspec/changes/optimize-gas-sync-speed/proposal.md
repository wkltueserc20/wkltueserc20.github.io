## Why

每次 fullSync 耗時 20+ 秒，根本原因是 GAS 後端在單次同步中重複呼叫 `getAccessToken()` 和 `getTargetFolderId()` 各 4 次，且所有 Drive API 呼叫皆為序列化執行，總計約 20 次 UrlFetch（每次 ~1 秒）。這導致兩人協作時常常忘記等待同步完成，造成資料不一致。

## What Changes

- **合併 HTTP 請求**：Client 端將 `listRecent` + `batchSync` 合併為單一 `smartSync` 請求，減少一次 HTTP roundtrip
- **消除重複 API 呼叫**：GAS 端的 token 和 folderId 在每次請求中只取得一次，傳遞給所有子操作
- **並行化 Drive API 呼叫**：使用 GAS 原生的 `UrlFetchApp.fetchAll()` 將多個 metadata 查詢、檔案下載、檔案上傳並行執行
- **自適應推送範圍**：Push 從固定 today+yesterday 改為追蹤所有有本地異動的日期（dirty dates），解決補登舊紀錄同步不到的問題

## Capabilities

### New Capabilities
- `smart-sync-protocol`: 合併式單一請求同步協定，包含 list + pull + push 在一次 GAS 呼叫內完成
- `parallel-drive-operations`: GAS 端使用 fetchAll 並行化所有 Google Drive API 呼叫
- `dirty-date-tracking`: Client 端追蹤哪些日期的資料有異動，只推送有變更的日期

### Modified Capabilities

（無現有 spec 需要修改）

## Impact

- `src/hooks/useSync.ts` — 合併請求邏輯、移除 `listRecent` 獨立呼叫、加入 dirty date 追蹤
- `openspec/GAS_SCRIPT.gs` — 新增 `smartSync` action、重構 `handleBatchSync` 為共享 token/folderId、引入 `fetchAll`
- GAS Web App 需要重新部署（新版本號）
- 向後相容：保留舊的 `listRecent` 和 `batchSync` action 以防回退
