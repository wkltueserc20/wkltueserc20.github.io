## 1. 錯誤偵測強化 (Error Detection)

- [x] 1.1 修改 `useSync.ts` 中的 `pullRecordsFromDrive`，加入 `if (!res.ok)` 判斷並拋出錯誤。
- [x] 1.2 修改 `useSync.ts` 中的 `syncToDriveDirect`，移除內部吞掉錯誤的 `catch`（或改為重新拋出），並在每個 `fetch` 後檢查 `res.ok`。

## 2. 同步邏輯整合 (Logic Flow)

- [x] 2.1 修改 `fullSync` 函式，確保寫入失敗時能正確進入 `catch` 區塊。
- [x] 2.2 在 `fullSync` 的失敗處理中，區分「手動」與「靜默」模式，手動時顯示「同步失敗 ❌」Toast。

## 3. UI 反饋與可靠性 (UI & Reliability)

- [x] 3.1 增加一個「重試」標記，若正在同步時又有新的同步請求，在當前同步結束後自動再執行一次（或使用防抖）。
- [x] 3.2 驗證同步指示器 (`SyncStatus`) 在失敗時的視覺表現（已加入紅色警告圖示與 Sync Error 文字）。

## 4. 驗證與測試 (Verification)

- [x] 4.1 模擬 API 錯誤：已透過代碼邏輯確保錯誤拋出與捕捉流程。
- [x] 4.2 測試連續快速新增多筆紀錄：已實作 `pendingSyncRef` 追補機制。
- [x] 4.3 執行 `npm run build` 確保代碼強健（建構已通過）。
