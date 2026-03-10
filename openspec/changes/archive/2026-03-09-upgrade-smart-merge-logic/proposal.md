## Why

目前多人協作時，若兩個設備同時存有同一筆紀錄但內容不同（修改紀錄情境），系統會採取「本地優先」策略，這導致後同步的設備可能會用舊資料覆蓋掉雲端已更新的內容。引入「最後修改時間優先 (Last-Write-Wins)」的智慧合併邏輯，能確保各設備始終保留最即時的變更。

## What Changes

- **紀錄模型升級**：在 `Record` 介面新增 `updatedAt` (最後修改時間戳)。
- **CSV 格式擴充**：在 CSV 檔案最後方新增第 12 欄 `最後修改時間戳`。
- **智慧合併演算法優化**：修改 `mergeRecords` 工具，若 ID 相同則比對 `updatedAt`，保留數值較大（較新）的紀錄。
- **自動更新機制**：在 App 中每次執行 `addRecord` 或 `updateRecord` 時，自動填入當下的 `Date.now()`。
- **相容性處理**：對沒有 `updatedAt` 的舊紀錄預設為 `0`，確保新變更一定能成功覆蓋舊資料。

## Capabilities

### New Capabilities
- `conflict-resolution`: 實現基於時間戳的自動衝突解決機制。

### Modified Capabilities
- `data-merging`: 升級原本簡單的去重邏輯為基於 `updatedAt` 的智慧比對。
- `data-sync`: 確保同步時能正確傳遞與解析新的 `updatedAt` 欄位。

## Impact

- `src/types.ts`: 定義變更。
- `src/utils/mergeUtils.ts`: 合併邏輯核心修改。
- `src/utils/csvUtils.ts`: 解析與生成邏輯調整。
- `src/App.tsx`: 存檔動作邏輯更新。
