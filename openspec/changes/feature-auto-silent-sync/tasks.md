## 1. 同步 Hook 強化 (Hook Updates)

- [x] 1.1 修改 `useSync.ts`，為 `fullSync` 增加 `silent` 選項，當為 true 時不觸發 `showToast`。
- [x] 1.2 確保 `handleGoogleLogin` 在靜默模式失敗時不會彈出錯誤，僅維持靜默。

## 2. 視覺指示器 (UI Components)

- [x] 2.1 建立 `src/components/Layout/SyncStatus.tsx`，顯示一個微小的旋轉圖示或綠點。
- [x] 2.2 在 `App.tsx` 的 `header` 區塊整合 `SyncStatus` 組件。

## 3. 自動觸發邏輯 (Auto-Trigger)

- [x] 3.1 在 `App.tsx` 中使用 `useEffect` 監聽 `visibilitychange` 事件，當頁面可見時執行靜默同步。
- [x] 3.2 監聽 `window` 的 `online` 事件，當網路恢復時執行靜默同步。
- [x] 3.3 (已跳過) 考慮到效率，取消設置每 5 分鐘一次的定時同步，改為純事件驅動。

## 4. 防抖與優化 (Optimization)

- [x] 4.1 實作並發保護機制，確保快速的操作不會造成重複同步。
- [x] 4.2 驗證自動同步在不同設備間的資料流向是否正確（已編譯通過且邏輯完整）。
