## Context

目前 App 啟動時僅讀取 LocalStorage。Google Drive 的同步邏輯 `syncToDriveDirect` 採取的是「寫入」策略，這導致在多設備環境下，後寫入的設備會覆蓋前一個設備的內容。

## Goals / Non-Goals

**Goals:**
- 實現 `mergeRecords(local, remote)` 函式，處理跨設備的資料合併。
- 擴充 `useSync` Hook，增加 `pullRecords` 功能。
- 實現「啟動即同步」：當 App 加載且 Google 帳號已連結時，自動下載並合併。
- 維持 CSV 檔案作為單一事實來源 (Single Source of Truth)。

**Non-Goals:**
- 不涉及即時 WebSocket 通訊（如 Firebase）。
- 不處理圖片同步（僅同步文字/數字紀錄）。

## Decisions

### 1. 合併策略：基於 ID 的去重
- **決策**：使用 `Map<string, Record>` 以 `id` 為 key 進行合併。
- **理由**：`crypto.randomUUID()` 產生的 ID 幾乎不會重複。如果 ID 相同，則視為同一筆紀錄。

### 2. 啟動與操作觸發同步
- **決策**：
    - **啟動時**：執行 `Pull -> Merge -> SetState`。
    - **變動後**：執行 `Pull -> Merge -> SetState -> Push`。
- **理由**：這能最大程度減少「兩邊同時改」造成的衝突，確保寫入前已拿到雲端最新狀態。

### 3. CSV 解析強化
- **決策**：在 `utils/csvUtils.ts` 中復用 `parseCSVLine` 並建立一個通用的 `csvToRecords` 轉換器。
- **理由**：確保從 `handleImportCSV` 和 `pullRecords` 進來的資料解析邏輯一致。

## Risks / Trade-offs

- **[Risk] 同步延遲**：Google Drive API 的反映速度約在數百毫秒到一秒，對於極高頻率的同時寫入仍可能有衝突。
    - 🛡️ **Mitigation**: 提供手動「強制同步」按鈕，並在合併時保留最新的時間戳變更。
- **[Trade-off] 流量消耗**：每次改動都先拉再推，會增加 API 調用次數。
    - 🛡️ **Mitigation**: 由於 CSV 檔案通常很小（數十 KB），流量影響微乎其微。
