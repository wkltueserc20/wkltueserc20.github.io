## 1. GAS 核心功能更新

- [x] 1.1 修改 `openspec/GAS_SCRIPT.gs` 的 `doPost`，新增 `listRecent` 動作：回傳資料夾內最近修改的 5 個 CSV 檔名。
- [x] 1.2 測試 GAS 部署（這部分建議由使用者手動在 GAS 編輯器貼上代碼）。

## 2. 資料庫 API 安全性強化

- [x] 2.1 修改 `src/hooks/useRecords.ts`：移除 `deleteRecord` 函式以避免硬刪除誤用。
- [x] 2.2 修改 `src/hooks/useRecords.ts` 的 `setAllRecords`：將 `clear()` + `bulkAdd()` 改為單一 `bulkPut()` 以消除資料空窗期。

## 3. 同步協議重構 (App 端)

- [x] 3.1 修改 `src/hooks/useSync.ts` 的 `pullRecordsFromDrive`：改為先呼叫 `listRecent` 獲取變動清單，再併行 Pull。
- [x] 3.2 實作「分組推送」邏輯：在 `syncToDriveDirect` 中依日期分組，將資料推回正確的 CSV 檔。
- [x] 3.3 修正 `fullSync` 的競爭風險：在合併前加入 `db.records.toArray()` 讀取最新本地狀態。

## 4. 驗證與測試

- [x] 4.1 驗證「同步中新增紀錄」是否能在完成後被保留。
- [x] 4.2 驗證不同日期的紀錄是否被正確寫入對應的雲端 CSV。
- [x] 4.3 驗證「刪除紀錄」是否能透過軟刪除正確同步。
