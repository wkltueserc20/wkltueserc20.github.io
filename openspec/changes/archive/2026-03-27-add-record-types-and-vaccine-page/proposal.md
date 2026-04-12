## Why

目前只追蹤餵奶、睡眠、成長三種紀錄，但寶寶的日常還有副食品、體溫、預防針等需求。尤其預防針需要排程 + 打勾追蹤的功能，跟一般紀錄不同。

## What Changes

### 新增三種記錄類型
- **副食品 (babyfood)**：自訂食物名稱 + 食物類別 + 克數
- **體溫 (temperature)**：體溫數值，> 37.5°C 顯示警示
- **預防針 (vaccine)**：疫苗名稱 + 劑次 + 已施打/未施打狀態

### 新增預防針專頁
- 底部導航新增第五個 tab「預防針 💉」
- 已施打 / 未施打分組顯示
- 內建台灣兒童預防接種時程表（依寶寶生日自動算出預定日期）
- 可手動新增自訂疫苗

### 資料模型擴充
- Record type 新增：`'babyfood' | 'temperature' | 'vaccine'`
- Record 新增欄位：`subType`（食物類別 / 疫苗名稱）、`label`（食物名稱 / 劑次）
- D1 新增兩個欄位：`sub_type TEXT`、`label TEXT`

## Impact

### 資料層
- `src/types.ts` — RecordType 擴充、Record 加 subType/label
- `worker/src/index.ts` — UPSERT/SELECT 加兩欄位
- `worker/schema.sql` — 加兩欄位
- D1 — ALTER TABLE 加欄位
- `src/hooks/useSync.ts` — response mapping 加欄位

### 表單
- `src/components/Records/RecordForm.tsx` — 新增副食品/體溫/預防針三個 tab 的表單 UI

### 顯示
- `src/components/Records/RecordList.tsx` — 新類型的卡片樣式
- `src/components/Stats/SummaryCards.tsx` — 可選：加體溫/副食品摘要
- `src/components/Stats/StatsTab.tsx` — 可選：加副食品/體溫圖表

### 新元件
- `src/components/Vaccine/VaccinePage.tsx` — 預防針專頁
- `src/components/Vaccine/VaccineSchedule.ts` — 台灣預防接種時程表資料

### 導航
- `src/types.ts` — TabType 加 `'vaccine'`
- `src/App.tsx` — 底部導航加第五個 tab

## Non-goals
- 副食品過敏追蹤（未來可加）
- 體溫圖表/趨勢分析（未來可加）
- 預防針推播提醒（目前沒有推播機制）
