## Context

目前 `RecordsPage` 只有兩個子頁：奶粉（`FormulaPage`）和疫苗（`VaccinePage`）。副食品記錄（`type === 'babyfood'`）已存在於資料模型中，透過 `label`（食物名稱）、`amount`（克數）、`timestamp` 欄位儲存完整資訊。現在需要一個統計視圖讓家長看到副食品引入全貌。

## Goals / Non-Goals

**Goals:**
- 在 RecordsPage 新增副食品統計子頁，設為預設 tab
- 依食物名稱分組，顯示次數、總克數、最近記錄
- 長按展開該食物完整歷史（原地展開，不彈 bottom sheet）
- 資料純計算自 records，不需新增資料結構

**Non-Goals:**
- 不提供在此頁面新增/編輯/刪除副食品記錄（新增仍走日常頁的 RecordForm）
- 不做時間範圍篩選
- 不做食物類別（subType）維度的統計

## Decisions

### 資料計算方式：useMemo 在組件內

副食品統計資料量小、計算邏輯簡單，直接在 `SolidFoodStatsPage` 內用 `useMemo` 計算分組結果即可。不需要抽到 hook 或 App.tsx。

### 長按展開：原地展開（不用 bottom sheet）

長按食物卡片後，在卡片下方原地展開詳細列表。用 `expandedFood: string | null` state 追蹤目前展開哪個食物。再次長按同一張卡收合；長按其他卡切換展開目標。

**放棄 bottom sheet 的理由**：bottom sheet 已用於全域新增記錄表單，在此用展開列表更輕量，也讓使用者不需離開頁面上下文。

### 長按實作：onContextMenu + onTouchStart/End

Mobile 長按用 `onTouchStart` 設 timer（500ms），`onTouchEnd`/`onTouchMove` 取消 timer。Desktop 用 `onContextMenu` 觸發同一行為（`preventDefault` 避免跳出瀏覽器選單）。

### 排序：依總次數由多到少

讓最常吃的食物排在最前面，符合「想快速了解主食」的使用情境。

### tab 預設值：`'babyfood'`

`RecordsPage` 的 `useState<SubTab>` 初始值改為 `'babyfood'`。

## Risks / Trade-offs

- [長按 vs 點擊] 長按在 mobile 有 300ms+ 延遲才觸發，使用者可能不直覺 → 在卡片上加入「長按展開詳細」提示文字緩解
- [空狀態] 若沒有任何 babyfood 記錄，頁面直接空白 → 顯示引導提示
