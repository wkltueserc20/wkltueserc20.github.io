## Why

疫苗記錄頁面的「未施打」疫苗目前缺乏編輯功能，使用者無法調整匯入或手動新增的預約日期；當預約需要更改時，只能刪除後重新新增，操作繁瑣且容易遺失備註資訊。

## What Changes

- 未施打疫苗卡片新增「調整預約」按鈕
- 點擊後彈出 modal，可編輯：預約日期（type="date"）、疫苗名稱、劑次、備註
- 新增獨立的 `onEditPendingVaccine` callback，寫入 `timestamp`（而非 `endTimestamp`）

## Capabilities

### New Capabilities
- `pending-vaccine-edit`: 未施打疫苗的預約資訊編輯能力（預約日期、名稱、劑次、備註）

### Modified Capabilities

## Impact

- `src/components/Vaccine/VaccinePage.tsx` — 新增 prop `onEditPendingVaccine`、新增按鈕與 modal 邏輯
- `src/components/Records/RecordsPage.tsx` — 傳遞新 prop `onEditPendingVaccine`
- `src/App.tsx` — 新增 `handleEditPendingVaccine`，更新 `timestamp` 欄位
