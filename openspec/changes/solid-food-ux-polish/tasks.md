## 1. SolidFoodStatsPage — 卡片互動

- [x] 1.1 移除 `onTouchStart`/`onTouchEnd`/`timerRef`/`touchMovedRef` 長按邏輯，改為卡片 `onClick` 展開／收合歷史
- [x] 1.2 卡片右上角加 chevron 指示（展開時顯示 `∧`，收合時顯示 `∨`），移除「長按展開」文字

## 2. SolidFoodStatsPage — 食材標籤區

- [x] 2.1 無食材狀態：改為全寬虛線按鈕「＋ 標記食材」，點擊開啟 IngredientSheet
- [x] 2.2 有食材狀態：chip 列表後改為獨立一行的「＋ 新增食材」文字按鈕（足夠觸控面積）

## 3. SolidFoodStatsPage — Sheet Backdrop

- [x] 3.1 IngredientSheet 外層容器加 `bg-black/40`
- [x] 3.2 食材清單 sheet 外層容器加 `bg-black/40`

## 4. RecordForm — 食材計數標示

- [x] 4.1 食材區塊 label 在有食材時改為「食材（已選 N）」顯示計數
