## 1. 副食品歷史名稱萃取

- [x] 1.1 在 `App.tsx` 中新增 `solidFoodLabels` useMemo，從所有非刪除的 babyfood 記錄中萃取唯一 `label` 值，依最近使用時間排序
- [x] 1.2 將 `solidFoodLabels` 作為 prop 傳入 `RecordForm`

## 2. 副食品名稱 Autocomplete UI

- [x] 2.1 在 `RecordForm.tsx` 的副食品名稱輸入欄位新增 `<datalist id="food-name-list">` 元素
- [x] 2.2 為食物名稱 `<input>` 加上 `list="food-name-list"` 屬性，並將 `solidFoodLabels` 渲染為 `<option>` 清單
- [x] 2.3 確認 `RecordForm` 的 TypeScript props 型別包含 `solidFoodLabels: string[]`

## 3. 每日副食品克數統計計算

- [x] 3.1 在 `App.tsx` 現有日統計 useMemo 中新增 `dailySolidFoodGrams`：對 `dayRecords` 中 `type === 'babyfood'` 的記錄加總 `amount`（缺值視為 0）
- [x] 3.2 將 `dailySolidFoodGrams` 傳入 `SummaryCards` component

## 4. SummaryCards 統計卡片

- [x] 4.1 在 `SummaryCards.tsx` 新增副食品統計卡片，僅當 `dailySolidFoodGrams > 0` 時顯示
- [x] 4.2 卡片顯示格式：圖示（🥦）+ 總克數（例如 `85g`）+ 標籤（「今日副食品」）
- [x] 4.3 確認 `SummaryCards` 的 TypeScript props 型別包含 `dailySolidFoodGrams?: number`
