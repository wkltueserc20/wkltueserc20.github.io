## 1. Props 傳遞（App → RecordsPage → SolidFoodStatsPage）

- [x] 1.1 在 `RecordsPage` props interface 新增 `isConnected: boolean`、`onRenameFood: (oldLabel: string, newLabel: string) => void`
- [x] 1.2 在 `App.tsx` 傳入 `isConnected` 與 `handleRenameFood`（先空實作）給 `RecordsPage`
- [x] 1.3 `RecordsPage` 將 `isConnected` 與 `onRenameFood` 往下傳給 `SolidFoodStatsPage`
- [x] 1.4 `SolidFoodStatsPage` props interface 新增 `isConnected: boolean`、`onRenameFood: (oldLabel: string, newLabel: string) => void`

## 2. Pull-to-refresh 提示（solid-food-pull-sync-hint）

- [x] 2.1 在 `SolidFoodStatsPage` 列表頂部（食材多樣性 banner 之前）加入提示條：`isConnected` 為 true 時顯示「↓ 下拉頁面可同步最新資料」小字灰色文字
- [x] 2.2 確認 `isConnected` 為 false 時提示條不渲染

## 3. handleRenameFood（App.tsx）

- [x] 3.1 實作 `handleRenameFood(oldLabel, newLabel)`：將所有 `type === 'babyfood' && !isDeleted && label === oldLabel` 的 records 更新 `label` 與 `updatedAt`，逐筆呼叫 `updateRecord`，再呼叫 `fullSync` 並 `showToast`
- [x] 3.2 oldLabel === newLabel 時提前返回不作任何操作

## 4. 副食品名稱重命名 UI（solid-food-rename）

- [x] 4.1 在 `SolidFoodStatsPage` 每張食物卡片名稱右側加入 ✎ 小按鈕（點擊後設定 `renameTarget` state，不展開歷史；阻止事件冒泡避免觸發 toggleExpand）
- [x] 4.2 新增 `RenameSheet` 底部 sheet 元件（或 inline 於 `SolidFoodStatsPage`），包含預填舊名稱的 input、取消、確認修改按鈕
- [x] 4.3 確認時若新名稱與其他 group label 重複，在 sheet 內顯示「「{新名稱}」已有 N 筆記錄，確認後兩組記錄將合併」警告，按鈕改為「確認合併」；再次確認後才呼叫 `onRenameFood`
- [x] 4.4 新名稱為空時停用確認按鈕
- [x] 4.5 點擊取消或 backdrop 關閉 sheet 且不修改

## 5. 上次食材快速套用（solid-food-last-ingredients-autofill）

- [x] 5.1 在 `RecordForm.tsx` 新增 `lastIngredients` useMemo：從 `records` 找最新的 `type === 'babyfood' && !isDeleted && label === foodName && ingredients?.length > 0` 的那筆，取其 `ingredients`；找不到則為空陣列
- [x] 5.2 在食材標籤區上方，當 `!isEditing && lastIngredients.length > 0 && foodIngredients.length === 0` 時，顯示「📋 上次食材」區塊：列出 `lastIngredients` 各食材名稱，旁邊放「套用」按鈕
- [x] 5.3 點擊「套用」後呼叫 `setFoodIngredients(lastIngredients)`，套用區塊因 `foodIngredients.length > 0` 自動消失
