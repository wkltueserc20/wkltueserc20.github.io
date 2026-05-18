## Why

副食品記錄頁缺少三項關鍵 UX：已連線時看不到同步入口、相同副食品每次都要重新選食材、打錯名稱後無法修正。這些摩擦點讓日常使用體驗降低。

## What Changes

- **Pull-to-refresh 提示**：在副食品統計頁（SolidFoodStatsPage）已連線時，顯示「下拉更新」提示條，讓使用者知道可以下拉同步最新資料。
- **上次食材快速套用**：新增副食品記錄時，若輸入名稱完全符合歷史記錄，在食材區顯示「上次食材」及一鍵套用按鈕，省去重複選取步驟。
- **副食品名稱編輯**：副食品統計頁每張食物卡片加入 ✎ 編輯按鈕，可修改名稱；若新名稱已存在，顯示合併警告要求確認後再執行。

## Capabilities

### New Capabilities

- `solid-food-pull-sync-hint`: 副食品統計頁連線狀態下的下拉同步提示 UI
- `solid-food-last-ingredients-autofill`: 新增副食品表單中，相同名稱的上次食材快速套用功能
- `solid-food-rename`: 副食品統計頁名稱編輯與重名合併警告功能

### Modified Capabilities

- `solid-food-stats`: SolidFoodStatsPage 新增 isConnected/onRenameFood props
- `solid-food-autocomplete`: RecordForm 食材區新增「上次食材」套用區塊

## Impact

- `src/App.tsx`：新增 `handleRenameFood`；傳 `isConnected`、`isSyncing` 給 `RecordsPage`
- `src/components/Records/RecordsPage.tsx`：新增 `isConnected`、`isSyncing`、`onRenameFood` props 並往下傳
- `src/components/SolidFood/SolidFoodStatsPage.tsx`：加入 pull hint UI、rename bottom sheet、重名 confirm dialog
- `src/components/Records/RecordForm.tsx`：新增上次食材 useMemo 與套用 UI
