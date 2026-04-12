## Context

目前副食品記錄（`type: 'babyfood'`）儲存於 Dexie IndexedDB，欄位包含 `label`（食物名稱）、`amount`（克數）、`subType`（分類）。使用者每次輸入食物名稱時都需要手動打字，且每日副食品攝取總克數目前未顯示於任何統計區塊（`SummaryCards.tsx` 僅涵蓋母奶/配方奶、睡眠、體溫、成長）。

## Goals / Non-Goals

**Goals:**
- 在 `RecordForm.tsx` 副食品名稱輸入欄位新增 autocomplete，從歷史記錄中萃取唯一 `label` 值作為候選清單
- 在 `SummaryCards.tsx` 新增今日副食品總克數統計卡片

**Non-Goals:**
- 不新增獨立的食物名稱管理頁面（新增、刪除、重新命名）
- 不支援跨日統計（僅顯示當日）
- 不改變現有資料結構或 IndexedDB schema

## Decisions

### 1. Autocomplete 資料來源：從現有記錄動態萃取
從 Dexie `records` table 中查詢所有 `type === 'babyfood'` 且非刪除的記錄，萃取唯一的非空 `label` 值，按最近使用時間排序。

**理由**：無需新增資料表或 localStorage key，與現有架構一致；歷史名稱會自動隨資料新增而更新。

**替代方案**：維護獨立的名稱清單 → 需要額外 CRUD，增加複雜度，不採用。

### 2. Autocomplete UI：HTML datalist 元素
使用原生 `<datalist>` 搭配 `<input list="...">` 實作，無需引入新的 UI 套件。

**理由**：專案目前未使用 autocomplete 套件，原生 datalist 在 iOS/Android WebView 上支援良好，實作簡單。

**替代方案**：自訂下拉選單（custom dropdown）→ 需要處理鍵盤導航、focus 管理等，過度工程化，不採用。

### 3. 每日副食品統計：在 App.tsx useMemo 中計算
在現有的每日統計計算邏輯（`App.tsx`）中新增 `dailySolidFoodGrams`，使用與其他統計相同的 `dayRecords` filter 模式。

**理由**：與現有架構完全一致，只需加一個 reduce 運算。

### 4. 統計顯示位置：SummaryCards.tsx 新增卡片
若當日有任何副食品記錄則顯示統計卡片，0 克時不顯示（避免無意義的零值）。

## Risks / Trade-offs

- [datalist 樣式限制] 原生 datalist 外觀受瀏覽器控制，無法完全客製化 → 可接受，功能優先於樣式
- [大量歷史記錄效能] 若記錄數量龐大，萃取唯一名稱可能略慢 → 名稱清單可在元件 mount 時一次計算並 memoize，影響可忽略
