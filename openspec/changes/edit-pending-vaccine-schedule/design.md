## Context

疫苗記錄分兩類：**未施打**（只有 `timestamp` 預約日期）與**已施打**（有 `endTimestamp` 實際施打日期）。現有的 `onEditVaccine` callback 簽名為 `(record, newEndTimestamp, ...)` — 只能寫入 `endTimestamp`，無法用於調整未施打疫苗的預約日期。

## Goals / Non-Goals

**Goals:**
- 未施打疫苗可編輯預約日期（`timestamp`）、疫苗名稱、劑次、備註
- 語意明確：新增獨立 callback，不與已施打的編輯混用
- 日期精度為「日」（`type="date"`），不需時間

**Non-Goals:**
- 不修改已施打疫苗的編輯流程
- 不新增通知或提醒功能

## Decisions

### 獨立 callback（`onEditPendingVaccine`）而非擴充 `onEditVaccine`

`onEditVaccine` 的第二參數語意是「實際施打時間戳」（`newEndTimestamp`），與預約日期（`timestamp`）不同。若透過 flag 區分，會讓呼叫端難以理解；獨立 callback 讓 `App.tsx` 的意圖清晰，也避免未施打的 `endTimestamp` 被意外寫入。

**Alternatives considered:** 在 `onEditVaccine` 加 `isScheduled: boolean` flag — 拒絕，因為同一 callback 承載兩種完全不同的語意。

### Modal 重用現有樣式

未施打的編輯 modal 與已施打的編輯 modal 樣式一致（圓角卡片、backdrop blur），但：
- 日期欄位改為 `type="date"`（不含時間）
- 標題改為「調整預約」
- label 改為「預約日期」
- 儲存時呼叫 `onEditPendingVaccine`

### 狀態管理

在 `VaccinePage` 中新增獨立的 state set：
- `pendingEditRecord` / `pendingEditDate` / `pendingEditNote` / `pendingEditSubType` / `pendingEditLabel`

與現有的 `editRecord` 系列並存，避免共用 state 時的互相干擾（兩個 modal 有不同欄位、不同 date format）。

## Risks / Trade-offs

- **日期轉換精度**：`type="date"` 的值（如 `"2025-04-15"`）透過 `new Date(value).getTime()` 轉換時，會以本機時區午夜為基準，與原本 `getScheduledDate` 行為一致。→ 無需額外處理。
- **現有資料相容**：只改 `timestamp`，不動 `endTimestamp` 或其他欄位，完全向後相容。
