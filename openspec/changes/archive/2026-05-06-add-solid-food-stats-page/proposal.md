## Why

目前「紀錄」頁只有奶粉和疫苗，副食品記錄散落在日常頁的列表中，家長無法快速了解寶寶吃過哪些食物、各吃了幾次。新增副食品統計頁，讓食物引入狀況一目瞭然。

## What Changes

- 在 RecordsPage 新增「副食品」子頁面，設為預設 tab
- 新頁面依食物名稱分組，顯示次數、總克數、最近記錄
- 支援長按展開該食物的完整歷史記錄（時間 + 克數）
- 沒有副食品記錄時顯示空白提示
- Tab 順序改為：副食品（預設）| 奶粉 | 疫苗

## Capabilities

### New Capabilities

- `solid-food-stats`: 副食品統計頁，依食物名稱分組顯示記錄，長按展開歷史明細

### Modified Capabilities

- `solid-food-autocomplete`: RecordsPage 子 tab 從兩個（奶粉、疫苗）擴增為三個（副食品、奶粉、疫苗），預設 tab 改為副食品

## Impact

- 新增 `src/components/SolidFood/SolidFoodStatsPage.tsx`
- 修改 `src/components/Records/RecordsPage.tsx`（新增 tab、改預設、傳入 records）
- 不影響資料模型與同步邏輯
