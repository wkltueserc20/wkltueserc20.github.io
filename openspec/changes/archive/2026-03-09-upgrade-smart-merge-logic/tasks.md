## 1. 資料模型與工具升級 (Core)

- [x] 1.1 修改 `src/types.ts`，在 `Record` 介面中新增 `updatedAt?: number` 屬性。
- [x] 1.2 修改 `src/utils/csvUtils.ts` 的 `generateCSVString`，在每行最後新增第 12 欄輸出 `updatedAt`。
- [x] 1.3 修改 `src/utils/csvUtils.ts` 的 `csvToRecords`，正確解析第 12 欄為 `updatedAt`，若無則預設為 `0`。
- [x] 1.4 重寫 `src/utils/mergeUtils.ts` 的 `mergeRecords`，實現基於 `updatedAt` 的比對合併邏輯。

## 2. 邏輯觸發優化 (Logic)

- [x] 2.1 修改 `App.tsx` 中的 `handleSaveRecord`，在儲存新紀錄或更新舊紀錄時，強制更新 `updatedAt` 為 `Date.now()`。
- [x] 2.2 修改 `App.tsx` 中的 `handleWakeUp`，在完成睡眠紀錄時，設定 `updatedAt`。

## 3. 驗證與測試 (Verification)

- [x] 3.1 驗證資料遷移：已確保舊 CSV 解析時 `updatedAt` 設為 0。
- [x] 3.2 驗證合併優先級：已透過 `mergeRecords` 邏輯確保 Last-Write-Wins。
- [x] 3.3 執行 `npm run build` 確認無型別錯誤。
