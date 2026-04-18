## 1. 修正 RecordForm 編輯副食品時的欄位預填邏輯

- [x] 1.1 在 `src/components/Records/RecordForm.tsx` 的 `useEffect` 中，於 `babyfood` 類型分支加入 `setFoodName(r.label || '')`、`setFoodCategory(r.subType || '')`、`setFoodGrams(r.amount ?? 30)`

## 2. 驗證

- [x] 2.1 手動測試：新增一筆副食品記錄後，點擊編輯，確認食物名稱、類別、公克數皆正確預填
- [x] 2.2 確認儲存後資料與編輯前一致，不因預填邏輯導致欄位異常
