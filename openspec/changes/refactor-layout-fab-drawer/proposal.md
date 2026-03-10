## Why

目前的應用程式佈局將「新增紀錄表單」直接放置在頁面流中，這在操作時會推擠下方的紀錄清單，且表單佔據了大量的垂直空間。為了提升行動端的操作效率（特別是單手操作），我們需要將核心動作（新增紀錄）整合至底部導覽列的正中央圓按鈕 (FAB)，並採用 iOS 風格的底部抽屜 (Bottom Sheet) 來呈現表單，使主介面保持清爽與專注。

## What Changes

- **底部導覽列重構**：將原本均分的 4 個 Tab 改為「2 + 1 + 2」結構，正中央新增一個醒目的圓形「＋」按鈕。
- **實作底部抽屜 (Drawer)**：建立一個全域的 `BottomSheet` 容器，具備從底部滑入的動畫效果與背景遮罩 (Backdrop)。
- **表單遷移**：將 `RecordForm` 從主頁面流移入 `BottomSheet` 中。
- **動作流程優化**：
    - 點擊底部「＋」按鈕開啟抽屜。
    - 紀錄儲存成功或點擊「取消」後，自動關閉抽屜。
- **介面清爽化**：主頁面不再顯示靜態表單，空間完全釋放給「今日數據摘要」與「紀錄清單」。

## Capabilities

### New Capabilities
- `bottom-sheet-ui`: 建立通用的、具備動畫效果的底部彈出容器。
- `fab-navigation`: 實作以圓形動作按鈕為核心的導覽結構。

### Modified Capabilities
- `app-launch`: 優化首頁啟動後的視覺重心。

## Impact

- `src/App.tsx`: 佈局架構與狀態切換邏輯。
- `src/components/Records/RecordForm.tsx`: 回呼邏輯整合。
- 新增 `src/components/Layout/BottomSheet.tsx` 組件。
