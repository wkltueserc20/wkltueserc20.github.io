## 1. 環境準備 (Setup)

- [x] 1.1 安裝 `dexie` 依賴。
- [x] 1.2 建立 `src/db/db.ts` 並定義 `BabyTrackerDB` 資料庫結構與 `records` 表。

## 2. 遷移邏輯實作 (Migration)

- [x] 2.1 在 `useRecords.ts` 中建立遷移偵測邏輯。
- [x] 2.2 實作將 LocalStorage 資料批量寫入 IndexedDB 的功能。
- [x] 2.3 加入遷移成功的驗證與標記機制。

## 3. Hook 重構 (Hook Refactoring)

- [x] 3.1 修改 `useRecords.ts` 的初始化邏輯，改為從 `db.records` 讀取資料。
- [x] 3.2 更新 `addRecord`, `updateRecord`, `deleteRecord` 改為非同步的資料庫操作。
- [x] 3.3 確保 `setAllRecords` (用於匯入或同步合併) 能正確清空並重寫資料庫。

## 4. 驗證與測試 (Verification)

- [x] 4.1 驗證現有資料是否成功搬家（已實作自動遷移邏輯）。
- [x] 4.2 測試新增、修改、刪除紀錄，確認資料庫同步更新。
- [x] 4.3 檢查 Chrome DevTools 的 Application -> IndexedDB 分頁，確認資料格式正確。
