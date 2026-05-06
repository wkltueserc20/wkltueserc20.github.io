## Why

目前「深夜靜音」功能沒有關閉選項，使用者無法停用此功能，只能被迫套用預設的 23:00～01:00 靜音區間。新手父母在夜間仍需倒數提醒時，沒有辦法關閉此功能。

## What Changes

- 在設定頁「偏好設定」的深夜靜音列新增「關閉」切換開關（toggle）
- 開關關閉時，隱藏時段選擇器（起始/結束時間），並停用靜音邏輯
- 開關開啟時（預設），維持現有的時段選擇器行為
- 新增 `quietHourDisabled` 欄位至 `BabyInfo` 型別
- `FeedCountdown` 在 `quietHourDisabled === true` 時跳過靜音判斷

## Capabilities

### New Capabilities

（無新獨立 capability）

### Modified Capabilities

- `feed-countdown`: 新增 `quietHourDisabled` 旗標，當為 `true` 時完全略過靜音時段判斷

## Impact

- `src/types.ts`：`BabyInfo` 新增 `quietHourDisabled?: boolean`
- `src/components/Settings/SettingsPanel.tsx`：深夜靜音列新增開關 UI
- `src/components/Home/FeedCountdown.tsx`：靜音邏輯加入 `quietHourDisabled` 判斷
- `src/App.tsx`：傳遞 `quietHourDisabled` prop 至 `FeedCountdown`
