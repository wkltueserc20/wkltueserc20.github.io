## Why

目前的同步機制雖然精準，但每次同步需要發出多次 HTTP 請求（listRecent + 多個 pull + 多個 push），導致在網路不穩定或 GAS 冷啟動時，使用者需等待 5-10 秒。本變更旨在實作「批量同步協定」與「MD5 指紋比對」，將多次通訊縮減為一輪，並避免下載重複資料。

## What Changes

- **批量同步介面 (Batch Sync API)**：在 GAS 端實作支援同時處理多個 pull/push 任務的單一進入點。
- **指紋校驗機制 (Checksum Matching)**：利用 Google Drive 檔案的 `md5Checksum` 進行比對，僅傳輸內容有變動的 CSV 檔案。
- **本地同步快取 (Local Sync Cache)**：App 端記錄各日期檔案的最後同步指紋，實現智慧差分下載。
- **通訊往返優化**：將原本平均 7 次的往返次數降低為 1 次。

## Capabilities

### New Capabilities
- `batch-sync-protocol`: 提供一輪式批量同步協議，支援指紋比對與差異化傳輸。

### Modified Capabilities
<!-- No spec-level requirement changes. -->

## Impact

- `openspec/GAS_SCRIPT.gs`: 新增 `batchSync` 動作與內部 Drive 資源批量處理邏輯。
- `src/hooks/useSync.ts`: 核心同步流程由多次 callGasProxy 簡化為單次呼叫。
- `LocalStorage`: 用於儲存 `sync-fingerprints` 快取。
