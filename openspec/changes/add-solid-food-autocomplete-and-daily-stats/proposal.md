## Why

記錄副食品時每次都需要手動輸入食物名稱，對重複使用的食物來說十分不便；同時目前缺乏每日副食品攝取量的總覽，照顧者無法快速掌握寶寶當天的副食品總克數。

## What Changes

- 副食品輸入欄位新增歷史名稱自動完成（autocomplete）功能：從過去記錄中提取已使用的食物名稱，供使用者點選快速填入
- 每日副食品統計區塊新增「今日副食品總克數」，顯示當天所有副食品記錄的克數加總

## Capabilities

### New Capabilities
- `solid-food-autocomplete`: 副食品名稱輸入時顯示歷史食物名稱候選清單，支援點選快速填入
- `solid-food-daily-stats`: 每日副食品克數加總統計，顯示於副食品區塊

### Modified Capabilities

## Impact

- `SolidFoodPanel`（或等效副食品記錄元件）：新增 autocomplete UI 及名稱歷史萃取邏輯
- 統計相關元件／頁面（如 DailyStats 或 StatsPanel）：新增副食品每日克數合計顯示
- localStorage 資料存取：從現有副食品記錄中萃取歷史名稱，無需新增欄位
