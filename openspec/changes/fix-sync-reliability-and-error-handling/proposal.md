## Why

目前系統的 Google Drive 同步功能存在「虛報成功」的風險。由於寫入邏輯 (`syncToDriveDirect`) 會吞掉 API 錯誤且不回傳執行結果，導致頂層邏輯 (`fullSync`) 無法判斷寫入是否真正完成，卻依然向使用者顯示「同步完成 ✅」。這會導致使用者誤以為資料已安全上傳，實際上雲端可能並未更新。

## What Changes

- **強化錯誤傳遞機制**：修改 `syncToDriveDirect` 及其相關 API 呼叫，確保在 HTTP 狀態碼非 `ok` 或網路異常時拋出錯誤 (throw Error)。
- **精準狀態回饋**：優化 `fullSync` 的捕捉邏輯，確保只有在「拉取、合併、寫入」三個階段全部成功後才顯示「同步完成」，否則顯示「同步失敗」。
- **並發處理優化**：改進 `isSyncing` 的攔截邏輯，考慮引入簡單的「等待重試」或「最後一次必執行」機制，避免最後一筆修改被遺漏。
- **日誌增強**：在控制台提供更詳細的同步階段資訊，方便排查問題。

## Capabilities

### New Capabilities
- `sync-health-check`: 確保同步流程的每一個環節都具備自我診斷能力。

### Modified Capabilities
- `data-sync`: 提升同步邏輯的強健性與錯誤處理精度。

## Impact

- `src/hooks/useSync.ts`: 主要的邏輯修改檔案。
- UI 反饋：使用者將能看到更真實的同步狀態（成功或失敗）。
