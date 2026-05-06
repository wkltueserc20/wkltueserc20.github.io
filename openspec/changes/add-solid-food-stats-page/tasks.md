## 1. 新增 SolidFoodStatsPage 組件

- [x] 1.1 建立 `src/components/SolidFood/SolidFoodStatsPage.tsx`，接收 `records: Record[]` prop
- [x] 1.2 實作資料計算邏輯：過濾 babyfood 未刪除記錄、依 label 分組、計算次數/總克數/最近記錄，依次數排序
- [x] 1.3 實作食物卡片 UI：顯示食物名稱、共 N 次、總計 Xg、最近時間 + 克數、長按提示文字
- [x] 1.4 實作長按展開邏輯：`expandedFood` state、onTouchStart/End timer（500ms）、onContextMenu 支援
- [x] 1.5 實作展開後的歷史明細列表：依 timestamp 由新到舊，顯示時間與克數
- [x] 1.6 實作空狀態 UI：無副食品記錄時顯示引導提示

## 2. 修改 RecordsPage

- [x] 2.1 將 `SubTab` type 加入 `'babyfood'`，初始值改為 `'babyfood'`
- [x] 2.2 在 tab 標籤列新增「🥣 副食品」tab（排最前），更新樣式讓三個 tab 均分寬度
- [x] 2.3 在 `RecordsPage` props 加入 `records: Record[]`，並在 `subTab === 'babyfood'` 時渲染 `SolidFoodStatsPage`
- [x] 2.4 在 `App.tsx` 的 `RecordsPage` 呼叫處傳入 `records` prop
