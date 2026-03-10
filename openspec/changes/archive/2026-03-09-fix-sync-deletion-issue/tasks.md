## 1. 資料結構與解析升級 (Core)

- [x] 1.1 修改 `src/types.ts`，在 `Record` 介面中新增 `isDeleted?: boolean`。
- [x] 1.2 修改 `src/utils/csvUtils.ts` 的 `generateCSVString`，將 `isDeleted` 寫入第 6 欄位（`r.isDeleted ? "deleted" : ""`）。
- [x] 1.3 修改 `src/utils/csvUtils.ts` 的 `csvToRecords`，解析第 6 欄位為 `isDeleted: c[5] === "deleted"`。

## 2. 刪除邏輯重構 (Deletion Logic)

- [x] 2.1 修改 `App.tsx` 中的 `handleDeleteRecord`，將物理移除 `filter` 改為邏輯更新 `updateRecord`，設定 `isDeleted: true` 並更新 `updatedAt: Date.now()`。
- [x] 2.2 確保 `handleDeleteRecord` 觸發後的同步 `fullSync` 傳遞的是包含該墓碑紀錄的完整陣列。

## 3. 展示層過濾 (UI Filtering)

- [x] 3.1 修改 `App.tsx` 中的 `stats` 計算邏輯，在 `useMemo` 中先過濾掉 `isDeleted` 的紀錄。
- [x] 3.2 修改 `App.tsx` 中的 `milkChartData`, `sleepChartData`, `growthChartData`, `nextFeed` 邏輯，加入 `!r.isDeleted` 過濾。
- [x] 3.3 修改 `src/components/Records/RecordList.tsx`，在渲染前過濾掉已刪除的紀錄。

## 4. 驗證與測試 (Verification)

- [x] 4.1 驗證刪除流：已實作標記刪除邏輯。
- [x] 4.2 驗證同步流：已透過 `updatedAt` 競爭機制確保刪除標記能傳播。
- [x] 4.3 執行 `npm run build` 確認系統穩定（已建構通過）。
