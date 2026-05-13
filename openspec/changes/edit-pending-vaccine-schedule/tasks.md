## 1. App.tsx — 新增 handleEditPendingVaccine

- [x] 1.1 在 App.tsx 新增 `handleEditPendingVaccine(record, newTimestamp, newNote, newSubType, newLabel)` 函式，更新 `timestamp`（保留 `endTimestamp` 不動）並呼叫 `updateRecord` 與 `fullSync`

## 2. RecordsPage.tsx — 傳遞新 prop

- [x] 2.1 在 `RecordsPageProps` interface 新增 `onEditPendingVaccine` 型別定義
- [x] 2.2 將 `onEditPendingVaccine` 從 props 解構並傳入 `VaccinePage`

## 3. VaccinePage.tsx — UI 與邏輯

- [x] 3.1 在 `VaccinePageProps` interface 新增 `onEditPendingVaccine` prop
- [x] 3.2 新增 state：`pendingEditRecord`, `pendingEditDate`, `pendingEditNote`, `pendingEditSubType`, `pendingEditLabel`
- [x] 3.3 新增 `handleOpenPendingEdit(r)` 函式：填入現有資料並開啟 modal（日期用 `formatLocalValue` 取 `r.timestamp` 的日期部分，format 為 `en-CA`）
- [x] 3.4 新增 `handleSavePendingEdit()` 函式：驗證日期非 NaN 後呼叫 `onEditPendingVaccine`，關閉 modal
- [x] 3.5 未施打卡片按鈕列加入「調整預約」按鈕（放在「已打」與「刪除」之間），點擊呼叫 `handleOpenPendingEdit`
- [x] 3.6 新增「調整預約」modal（樣式同現有 edit modal），欄位：疫苗名稱、劑次、預約日期（`type="date"`）、備註；儲存按鈕呼叫 `handleSavePendingEdit`

## 4. App.tsx — 傳遞 prop

- [x] 4.1 在 `RecordsPage` JSX 中加入 `onEditPendingVaccine={handleEditPendingVaccine}`
