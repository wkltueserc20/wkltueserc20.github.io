## Why

三個獨立但相關的改善：記錄頁面殘存的 UX 問題、統計頁缺少奶粉花費彙總、疫苗金額只能塞在備註裡導致資料混亂。

## What Changes

### 1. 記錄頁面小修 (RecordList)

- **移除裝飾性 `>` 箭頭**：現在右側箭頭不可點擊但外觀暗示可互動，容易誤導，直接拿掉
- **Chip 篩選加右側漸層遮罩**：提示使用者可橫向捲動
- **空白狀態文字加日期感知**：查看過去日期時顯示「X月X日沒有紀錄」而非「點下方 ＋ 開始記錄」

### 2. 統計頁新增奶粉花費摘要 (StatsTab)

新增一個花費摘要卡，顯示：
- 累積總花費
- 各品牌花費 + 罐數 + 橫向比例條
- 平均每罐費用

資料來源：`formula_can` 記錄的 `amount` + `subType`，不需要新增任何資料欄位。

### 3. 疫苗金額獨立欄位 (VaccinePage + App)

- 手動新增疫苗表單加「費用」輸入欄
- 編輯 modal 加「費用」輸入欄
- 疫苗卡片顯示費用（有值才顯示）
- 延伸 `onEditVaccine` prop 簽名加入 `newAmount`
- `handleEditVaccine` 寫入 `amount` 欄位

資料模型：直接使用 `Record.amount`，不需要 schema 變更。

## Impact

### 元件
- `src/components/Records/RecordList.tsx` — 移除箭頭、加漸層、空白狀態文字
- `src/components/Stats/StatsTab.tsx` — 加奶粉花費摘要卡
- `src/components/Vaccine/VaccinePage.tsx` — 加金額欄、顯示費用
- `src/App.tsx` — `handleEditVaccine` 加 `amount` 參數

## Non-goals
- 疫苗費用統計圖表（未來可加）
- 奶粉花費時間趨勢圖（現階段摘要卡已足夠）
