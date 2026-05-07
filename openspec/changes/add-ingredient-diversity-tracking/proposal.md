## Why

家長記錄副食品時，label 欄位（如「南瓜雞肉泥」）可能包含多種食材，無法從現有資料直接得知寶寶實際嘗試過幾種不同食材。追蹤食物多樣性是嬰兒副食品餵養的重要指標，目前缺乏這個功能。

## What Changes

- 在 `Record` 型別新增 `ingredients?: string[]` 欄位，儲存個別食材標籤
- 副食品統計頁頂部新增「已嘗試食材種類 N 種」總計顯示
- 每張食物卡片直接顯示 ingredient tag，支援點擊新增／刪除
- 點擊新增時彈出選取 sheet，顯示自動建議（從 label 解析）及歷史標籤（所有 label 用過的食材），支援自由輸入新食材
- 同一 label 的所有記錄批次套用 ingredients，只需標記一次
- 本地自動推斷：去除泥／糊／粥等後綴後比對字典，預填 ingredients 建議值，用戶可手動修改

## Capabilities

### New Capabilities
- `ingredient-tag-editor`: 副食品統計頁內的食材標籤編輯功能（顯示 tag、新增／刪除、選取 sheet）
- `ingredient-diversity-stats`: 統計頁頂部顯示已嘗試食材總種類數
- `ingredient-auto-inference`: 從 label 自動推斷個別食材的本地邏輯（字典 + 後綴剝除）

### Modified Capabilities
- `solid-food-stats`: 卡片需新增 ingredient tag 顯示區，現有 spec 的卡片結構有所擴充

## Impact

- `src/types.ts`：Record 介面新增 `ingredients` 欄位
- `src/components/SolidFood/SolidFoodStatsPage.tsx`：主要修改，加入 tag UI、統計顯示、編輯邏輯
- `src/App.tsx`：更新記錄時需傳遞 ingredients（批次更新同 label 記錄）
- 無外部 API 依賴，完全本地運作，離線可用
- 舊資料向下相容（ingredients 為選填）
