## 1. GAS 批量同步實作

- [x] 1.1 在 `GAS_SCRIPT.gs` 中實作 `handleBatchSync` 函式。
- [x] 1.2 整合 Drive API 的 `md5Checksum` 比對邏輯。
- [x] 1.3 更新 `doPost` 以支援 `batchSync` 動作。

## 2. App 端同步協議重構

- [x] 2.1 修改 `src/hooks/useSync.ts`：實作 `syncFingerprints` 狀態管理與 LocalStorage 持久化。
- [x] 2.2 實作新的 `callBatchSync` 輔助函式。
- [x] 2.3 重構 `fullSync`：將多輪的 pull/push 整合為單次 `batchSync` 請求。
- [x] 2.4 更新本地資料庫合併邏輯，以處理 `batchSync` 回傳的差異化資料。

## 3. 效能優化與驗證

- [x] 3.1 驗證在雲端無變動時，同步是否能在一秒內完成（Checksum Hit）。
- [x] 3.2 驗證在多日資料同時變更時，是否僅發出單次網路請求。
- [x] 3.3 測試大數據量下的同步穩定性。
