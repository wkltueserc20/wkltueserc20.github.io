## 1. 資料層

- [x] 1.1 在 `src/types.ts` 的 `Record` 介面新增 `ingredients?: string[]` 欄位
- [x] 1.2 建立 `src/utils/ingredientInference.ts`，實作本地食材字典（蔬菜、水果、蛋白質、穀物各類）及推斷函式（後綴剝除 + 最長匹配）

## 2. 統計計算

- [x] 2.1 在 `SolidFoodStatsPage` 的 `useMemo` 中，計算所有 babyfood records 的 ingredients 聯集唯一數，供頁面頂部顯示
- [x] 2.2 在 `FoodGroup` 介面新增 `ingredients: string[]` 欄位，從同 label records 取第一筆有值的 ingredients（同 label 一致）

## 3. UI：統計頁頂部摘要

- [x] 3.1 在卡片列表上方新增「已嘗試食材種類 N 種」摘要區塊

## 4. UI：卡片食材標籤

- [x] 4.1 在每張食物卡片新增食材 tag 顯示區（已標記時顯示 chip，未標記時顯示灰色提示）
- [x] 4.2 每個食材 chip 新增 × 刪除按鈕，點擊時批次移除同 label 所有 records 的該食材
- [x] 4.3 在卡片新增 ＋ 按鈕，點擊時開啟食材選取 Sheet

## 5. UI：食材選取 Sheet

- [x] 5.1 建立 `IngredientSheet` 元件（bottom sheet），顯示三層：自動推斷建議、歷史標籤、自由輸入框
- [x] 5.2 實作輸入框即時過濾歷史標籤功能
- [x] 5.3 點選建議或歷史標籤時，批次新增至同 label 所有 records 的 ingredients
- [x] 5.4 自由輸入 Enter 確認時，同樣批次新增並關閉 Sheet

## 6. App 層批次更新

- [x] 6.1 在 `App.tsx` 新增 `handleUpdateIngredients(label, newIngredients)` 函式，批次更新所有同 label 未刪除 records 並觸發 sync
- [x] 6.2 將 `handleUpdateIngredients` 傳入 `SolidFoodStatsPage` 作為 prop
