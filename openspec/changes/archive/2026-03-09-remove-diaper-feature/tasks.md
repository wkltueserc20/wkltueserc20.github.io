## 1. 類型與數據處理 (Types & Data)

- [x] 1.1 修改 `RecordType` 型別，移除 `'diaper'`。
- [x] 1.2 修改 `useEffect` 的資料加載邏輯，過濾掉 `diaper` 類型的舊數據。
- [x] 1.3 修改 `handleImportCSV` 解析邏輯，過濾掉 `diaper` 紀錄。

## 2. 統計邏輯更新 (Stats)

- [x] 2.1 修改 `useMemo(stats)` 移除 `peeCount` 與 `pooCount`。
- [x] 2.2 在 `stats` 中新增「最新成長數據」獲取邏輯（抓取最近一筆 `growth` 紀錄）。

## 3. UI 調整 (UI Layout)

- [x] 3.1 重新設計首頁頂部統計卡片（奶量全寬，睡眠與成長半寬）。
- [x] 3.2 移除表單類別切換中的「尿布」按鈕與相關條件渲染 UI（狀態按鈕）。
- [x] 3.3 移除列表過濾器（Filter）中的「尿尿」選項。
- [x] 3.4 移除列表渲染（Record List Item）中關於 `diaper` 的邏輯。

## 4. 驗證與測試 (Verification)

- [x] 4.1 確認點擊各個按鈕後不會噴錯。
- [x] 4.2 測試匯入包含尿布紀錄的舊 CSV，確認其被正確忽略。
- [x] 4.3 確認統計區塊在手機與桌面端的佈局正常。
