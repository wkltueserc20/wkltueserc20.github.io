## 1. 基礎設施建立 (Foundation)

- [x] 1.1 建立 `src/types.ts` 並搬移 `RecordType`, `MilkType`, `TabType`, `Record`, `BabyInfo` 等定義。
- [x] 1.2 建立 `src/utils/dateUtils.ts` 並搬移所有日期處理函式（`formatLocalValue`, `isSameDay`, `formatTimeWithPeriod`）。
- [x] 1.3 建立 `src/utils/csvUtils.ts` 並搬移 CSV 解析（`parseCSVLine`）與匯出邏輯。

## 2. 邏輯封裝 (Hooks Implementation)

- [x] 2.1 建立 `src/hooks/useSync.ts` 整合 Google Drive 同步（`syncToDriveDirect`）、LINE 通知（`sendLineAction`）與 GAS API 呼叫邏輯。
- [x] 2.2 建立 `src/hooks/useRecords.ts` 封裝 `records` 的 CRUD 邏輯與 LocalStorage 持久化處理。

## 3. UI 組件化 (Component Refactoring)

- [x] 3.1 建立 `src/components/Stats/SummaryCards.tsx` 並遷移首頁頂部統計卡片 UI。
- [x] 3.2 建立 `src/components/Records/RecordForm.tsx` 並遷移紀錄新增與修改的表單 UI 與內部狀態。
- [x] 3.3 建立 `src/components/Records/RecordList.tsx` 並遷移紀錄清單顯示與操作邏輯。
- [x] 3.4 建立 `src/components/Settings/SettingsPanel.tsx` 並遷移設定分頁內容。

## 4. 主幹整合與清理 (App Integration)

- [x] 4.1 修改 `App.tsx` 引用所有拆分後的組件與 Hooks。
- [x] 4.2 清除 `App.tsx` 中已搬移的冗餘代碼，確保組件結構精簡。
- [x] 4.3 進行最終驗證，確保所有功能（同步、圖表、紀錄）運作正常且不丟失 LocalStorage 數據。
