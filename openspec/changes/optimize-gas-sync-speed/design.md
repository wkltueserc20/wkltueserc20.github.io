## Context

育兒助手使用 Google Apps Script (GAS) 作為 Google Drive 同步代理。目前 `fullSync` 流程需要 2 次 HTTP roundtrip（`listRecent` → `batchSync`），而 GAS 內部每次呼叫都獨立執行 `getAccessToken()` 和 `getTargetFolderId()`，導致單次同步觸發約 20 次 Google API UrlFetch，耗時 20+ 秒。

現有架構：
```
Client                          GAS
  │── listRecent ──────────────▶│  getAccessToken()     ← 第 1 次
  │                              │  getTargetFolderId()  ← 第 1 次
  │                              │  Drive.files.list
  │◀── file list ──────────────│
  │                              │
  │── batchSync ───────────────▶│  getAccessToken()     ← 第 2 次
  │   (pull + push)              │  getTargetFolderId()  ← 第 2 次
  │                              │  N × getFileMetadata  ← 逐一序列
  │                              │  N × fetchContent     ← 逐一序列
  │                              │  M × handlePush       ← 每個再取一次 token+folder
  │◀── results ────────────────│
```

## Goals / Non-Goals

**Goals:**
- 將同步時間從 20+ 秒降到 3-5 秒
- 減少 GAS 內部 UrlFetch 次數從 ~20 次到 ~8 次
- 解決補登舊日期紀錄無法同步的問題
- 保持向後相容（舊 action 保留）

**Non-Goals:**
- 不遷移離開 GAS/Google Drive 架構
- 不實作即時推送（WebSocket/SSE）
- 不實作 Service Worker Background Sync
- 不改變 merge 策略（LWW）或資料格式（CSV）

## Decisions

### Decision 1: 合併為單一 `smartSync` GAS action

Client 只發一次 HTTP 請求，GAS 內部完成 list → pull → push 全流程。

**替代方案考量：**
- *保留兩次請求但並行化* — 不可行，因為 batchSync 依賴 listRecent 的結果
- *Client 端快取 file list* — 會導致 stale data，不如讓 GAS 一次做完

**新的請求格式：**
```json
{
  "action": "smartSync",
  "syncSecret": "...",
  "pull": [{"name": "baby_records_20260325.csv", "md5": "abc123"}],
  "push": [{"name": "baby_records_20260326.csv", "csv": "..."}]
}
```

與現有 `batchSync` 的差別：Client 不再傳 pull file list（由 GAS 的 listRecent 邏輯決定），但仍可傳已知的 MD5 fingerprints。

**修正：** Client 仍傳 fingerprints map（所有已知的 fileName→md5），GAS 用 listRecent 結果去比對：

```json
{
  "action": "smartSync",
  "syncSecret": "...",
  "fingerprints": {"baby_records_20260325.csv": "abc123", ...},
  "push": [{"name": "...", "csv": "..."}]
}
```

### Decision 2: GAS 內部共享 token 和 folderId

`handleSmartSync` 開頭取得 token 和 folderId，所有子操作以參數傳遞，不再各自呼叫 `getAccessToken()` / `getTargetFolderId()`。

```
handleSmartSync():
  token = getAccessToken()       ← 唯一一次
  folderId = getTargetFolderId() ← 唯一一次
  listFiles(token, folderId)
  pullFiles(token, folderId, ...)
  pushFiles(token, folderId, ...)
```

節省 ~6 次重複的 UrlFetch。

### Decision 3: 使用 UrlFetchApp.fetchAll() 並行化

GAS 原生支援 `UrlFetchApp.fetchAll(requests[])`，可同時發送多個 HTTP 請求。

**並行化策略：**

| 步驟 | 操作 | 方式 |
|------|------|------|
| 1 | getAccessToken + getTargetFolderId | 序列（有依賴） |
| 2 | listRecent | 序列（需要 folderId） |
| 3 | N × getFileMetadata | **fetchAll 並行** |
| 4 | Changed files download + push file search | **fetchAll 並行** |
| 5 | Push file uploads | **fetchAll 並行** |

**替代方案考量：**
- *全部序列* — 簡單但慢，不符合目標
- *BatchRequest (Google API)* — Drive API 的 batch endpoint 已於 2020 棄用 files 相關操作

### Decision 4: Dirty date tracking（自適應推送）

Client 端維護一個 `dirtyDates: Set<string>` 追蹤哪些日期有本地異動：
- 新增/修改/刪除紀錄時，將該紀錄的日期加入 dirtyDates
- fullSync 時推送所有 dirty dates 的資料（而非固定 today+yesterday）
- 同步成功後清空 dirtyDates

儲存位置：localStorage（`baby-sync-dirty-dates`），確保 App 重開後仍保留未同步的 dirty 標記。

**替代方案考量：**
- *推送所有日期* — 資料量過大，不實際
- *固定 today + 最近 N 天* — 無法涵蓋更早的補登

## Risks / Trade-offs

- **GAS 部署風險** → 保留舊的 `listRecent` 和 `batchSync` action 不刪除，新舊版 Client 都能運作。若 smartSync 出問題，Client 可 fallback。
- **fetchAll 錯誤處理較複雜** → 需逐一檢查 fetchAll 回傳的每個 response，任一失敗不應導致整體失敗，改為 partial success 回報。
- **GAS 執行時間限制 (6 分鐘)** → 目前資料量極小（每日 CSV < 5KB），不會觸及限制。
- **dirtyDates localStorage 可能遺失** → 瀏覽器清 cache 會遺失。影響有限：最壞情況是某次補登沒推上去，下次同步時如果該日期在 listRecent 裡就會自動修復。
