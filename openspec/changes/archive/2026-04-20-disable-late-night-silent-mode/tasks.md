## 1. 型別更新

- [x] 1.1 在 `src/types.ts` 的 `BabyInfo` 介面新增 `quietHourDisabled?: boolean` 欄位

## 2. 設定頁 UI

- [x] 2.1 在 `src/components/Settings/SettingsPanel.tsx` 深夜靜音列新增 toggle 開關，綁定 `babyInfo.quietHourDisabled`
- [x] 2.2 當開關為關閉狀態（`quietHourDisabled === true`）時，隱藏起始/結束時段選擇器

## 3. FeedCountdown 邏輯

- [x] 3.1 在 `src/components/Home/FeedCountdown.tsx` 的 `FeedCountdownProps` 新增 `quietHourDisabled?: boolean` prop
- [x] 3.2 在 `useMemo` 靜音判斷前加入：若 `quietHourDisabled === true` 則略過靜音邏輯

## 4. App 串接

- [x] 4.1 在 `src/App.tsx` 將 `babyInfo.quietHourDisabled` 傳入 `<FeedCountdown>` 元件
