## Why

目前的統計圖表固定顯示「最近 7 天」的數據。然而，寶寶的作息規律往往是以週或雙週為週期變動的。提供「7天、14天、28天」的切換功能，能讓家長在需要查看細節時使用短週期，在需要觀察長期成長趨勢或作息趨勢時切換到長週期，極大地提升了數據的實用性。

## What Changes

- **新增時間區間狀態**：引入 `statsRange` 狀態，支援 7, 14, 28 三種數值。
- **動態圖表生成**：重構 `milkChartData` 與 `sleepChartData` 的 `useMemo` 邏輯，使其根據 `statsRange` 自動擴展時間軸。
- **全域區間切換器**：在統計分頁頂部新增一個 iOS 風格的 Segmented Control (分段選擇器)。
- **圖表視覺優化**：
    - 當天數較多時（如 28 天），自動縮小圖表 X 軸的日期字體。
    - 優化 Y 軸刻度，確保不同天數下的數值顯示均等。
- **一致性同步**：切換一次區間，頁面內所有相關趨勢圖同步更新。

## Capabilities

### New Capabilities
- `stats-time-range-control`: 實作可控制全域統計天數的 UI 與狀態系統。

### Modified Capabilities
- `data-visualization`: 擴充圖表數據處理能力，支援動態時間長度。

## Impact

- `src/App.tsx`: 狀態定義與 `useMemo` 邏輯重構。
- 統計分頁 UI 佈局微調。
