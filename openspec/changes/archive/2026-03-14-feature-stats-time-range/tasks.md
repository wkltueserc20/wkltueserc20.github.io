## 1. 狀態與邏輯重構 (State & Logic)

- [x] 1.1 在 `App.tsx` 中新增 `statsRange` 狀態，預設值為 7。
- [x] 1.2 重構 `milkChartData` 的 `useMemo`，使其循環次數取決於 `statsRange`。
- [x] 1.3 重構 `sleepChartData` 的 `useMemo`，同樣使其取決於 `statsRange`。

## 2. UI 組件開發 (UI Development)

- [x] 2.1 在統計分頁頂部建立 `RangeSwitcher` 介面（7D, 14D, 28D 按鈕）。
- [x] 2.2 為按鈕添加切換狀態的 `onClick` 事件與選中樣式。
- [x] 2.3 優化圖表 X 軸：當 `statsRange > 14` 時，縮小 `tick` 字體大小與 `barSize`。

## 3. 體驗優化 (Polish)

- [x] 3.1 確保切換區間時，圖表具備平滑的過渡動畫（已驗證）。
- [x] 3.2 檢查資料為空時的圖表顯示（已加入 null 合併運算子防護）。

## 4. 驗證與發佈 (Verification)

- [x] 4.1 手動測試切換至 14D 與 28D，核對日期顯示是否正確（已驗證）。
- [x] 4.2 測試跨月份區間的資料彙整是否準確（已驗證）。
- [x] 4.3 執行 `npm run build` 確認系統穩定（已通過）。
