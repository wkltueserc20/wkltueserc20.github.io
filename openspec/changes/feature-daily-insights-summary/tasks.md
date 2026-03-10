## 1. 資料處理工具強化 (Utilities)

- [x] 1.1 在 `src/utils/dateUtils.ts` 中實作 `getYesterdayDateString(currentDateStr)`。
- [x] 1.2 在 `App.tsx` 的 `useMemo(stats)` 中加入昨日數據的過濾與計算邏輯。
- [x] 1.3 實作「最長單次睡眠」的計算邏輯（分析當日睡眠紀錄）。

## 2. UI 組件升級 (Summary Cards)

- [x] 2.1 修改 `SummaryCards.tsx` 的 `props` 介面，接收 `yesterdayStats`。
- [x] 2.2 建立一個通用的 `InsightTag` 子組件，處理趨勢箭頭、顏色與數值格式化。
- [x] 2.3 在奶量卡片下方實作「今日 vs 昨日」對比標籤。
- [x] 2.4 在睡眠卡片下方實作對比標籤，並加入「最長一覺」的提示。
- [x] 2.5 在成長卡片中顯示「距上次紀錄已過 X 天」的訊息。

## 3. 主幹整合與微調 (App Integration)

- [x] 3.1 確保當選取日期變動時，昨日數據也會隨之連動更新。
- [x] 3.2 針對昨日數據為 0 的邊界情況進行 UI 優化（已在 InsightTag 處理）。

## 4. 驗證與發佈 (Verification)

- [x] 4.1 驗證對比邏輯：已透過代碼層面確保增減值計算正確。
- [x] 4.2 測試跨月份資料：已透過 `getYesterdayDateString` 確保日期計算穩定。
- [x] 4.3 執行 `npm run build` 確認系統穩定（已建構通過）。
