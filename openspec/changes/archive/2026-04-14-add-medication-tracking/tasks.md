## 1. 資料層：新增 medication RecordType

- [x] 1.1 在 `src/types.ts` 的 `RecordType` 聯集加入 `'medication'`

## 2. 表單：RecordForm 用藥欄位

- [x] 2.1 在 `src/components/Records/RecordForm.tsx` 新增用藥類型的 state（medName, medAmount, medUnit）
- [x] 2.2 在 RecordForm 的類型選擇區新增「用藥」選項（💊）
- [x] 2.3 新增用藥表單 JSX：藥名 input（含 datalist autocomplete）、劑量 number input、單位 select（mg / ml / 顆 / 包）
- [x] 2.4 更新 handleSubmit，將用藥欄位以 `label`、`amount`、`subType` 儲存
- [x] 2.5 更新 useEffect（isEditing），讀取用藥記錄時還原 medName、medAmount、medUnit
- [x] 2.6 在 RecordFormProps 新增 `medicationLabels: string[]` prop 並接入 datalist

## 3. App 層：傳遞 medicationLabels

- [x] 3.1 在 `src/App.tsx` 從 records 收集 medication label 清單（`medicationLabels`）
- [x] 3.2 將 `medicationLabels` 傳入 RecordForm

## 4. 記錄列表：RecordList 顯示用藥項目

- [x] 4.1 在 `src/components/Records/RecordList.tsx`（或 SwipeableRecordItem）為 medication 類型新增顯示邏輯：💊 圖示、藥名、劑量+單位

## 5. 快速記錄：QuickRecord 用藥按鈕

- [x] 5.1 在 `src/components/Home/QuickRecord.tsx` 新增用藥快速記錄按鈕（💊），點擊後預選 medication 類型

## 6. 統計頁：SummaryCards 當日用藥次數

- [x] 6.1 在 `src/App.tsx` 計算當日 medication 記錄筆數，傳入 SummaryCards 為 `dailyMedCount` prop
- [x] 6.2 在 `src/components/Stats/SummaryCards.tsx` SummaryCardsProps 新增 `dailyMedCount?: number`
- [x] 6.3 在摘要列（compact stats row）有 dailyMedCount > 0 時顯示 💊 圖示與次數
- [x] 6.4 在長按詳細模態中列出當日用藥明細（藥名、劑量、時間）

## 7. 統計頁：StatsTab 最近用藥摘要

- [x] 7.1 在 `src/components/Stats/StatsTab.tsx` 計算最近一筆用藥記錄（最大 timestamp）
- [x] 7.2 新增最近用藥摘要 UI 區塊：顯示日期（M月D日）與藥名；無記錄時不顯示
