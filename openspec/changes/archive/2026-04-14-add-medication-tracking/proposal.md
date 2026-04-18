## Why

小孩生病時需要按時用藥，父母需要記錄每次用藥的藥名、劑量與時間，避免重複用藥或漏藥。目前 app 缺少用藥記錄功能，無法追蹤用藥歷程。

## What Changes

- 新增 `medication`（用藥）Record type，記錄藥名（label）、劑量（amount）、單位（subType）與時間
- 新增「用藥」快速記錄入口，讓使用者能快速填入藥名與劑量
- 統計頁（StatsTab）新增用藥摘要區塊，顯示最近一筆用藥日期、藥名，以及近 7/30 天的用藥筆數

## Capabilities

### New Capabilities
- `medication-record`: 新增用藥記錄的建立、編輯與刪除，整合進現有 Record 資料結構與 RecordForm

### Modified Capabilities
- `stats-tab`: 在統計頁新增「最近用藥」摘要，顯示最近用藥日期與藥名

## Impact

- `src/types.ts`：`RecordType` 聯集加入 `'medication'`
- `src/components/Home/QuickRecord.tsx`：新增用藥快速記錄按鈕
- `src/components/Records/RecordForm.tsx`：新增用藥表單欄位（藥名、劑量、單位）
- `src/components/Records/RecordList.tsx`：用藥記錄顯示項目
- `src/components/Stats/StatsTab.tsx`：新增最近用藥統計區塊
- `src/components/Stats/SummaryCards.tsx`：可能新增用藥摘要卡片
