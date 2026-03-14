## Why

寶寶的睡眠常跨越午夜（例如昨晚 21:00 到今天 07:00）。如果紀錄歸屬在「開始睡覺」的日期，家長在查看「今天」的統計時會看到 0 小時，這不符合直覺且不便於追蹤。睡眠紀錄應該以「起床（醒來）的時間」作為歸屬日期。

目前的機制在「首頁睡眠橫幅」結束睡眠時，遺漏了 `endTimestamp` 欄位，導致系統自動退回到以 `timestamp` (開始時間) 作為歸屬，造成了數據錯誤。

## What Changes

- **補齊 `endTimestamp`**：在 `handleFinishSleep` (首頁橫幅控制邏輯) 中，明確加入 `endTimestamp` 欄位。
- **統一欄位邏輯**：確保所有產生的睡眠紀錄 `Record` 物件都一致包含 `endTimestamp`（如果已完成）。
- **核對歸屬函式**：確認 `src/utils/dateUtils.ts` 中的 `getRecordTargetTs` 持續以 `endTimestamp` 為優先。

## Capabilities

### Modified Capabilities
- `sleep-live-monitor`: 修復結束睡眠時的資料結構。
- `data-visualization`: 確保圖表正確抓取以結束時間為基準的紀錄。

## Impact

- `src/App.tsx`: 修正 `handleFinishSleep` 的紀錄生成邏輯。
- `src/utils/dateUtils.ts`: (可選) 加強歸屬邏輯的健壯性。
