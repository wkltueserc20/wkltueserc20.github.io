## Why

按「開始睡覺」時，睡眠狀態只存在 localStorage，不會同步。另一台手機不知道寶寶正在睡覺，也無法按「起床」。

## What Changes

- 按「開始睡覺」時立即建立一筆 `endTimestamp: null` 的 sleep record 並同步
- SleepBanner 改為讀取進行中的 sleep record（而非 localStorage）
- 任何裝置都可以按「起床」來更新這筆 record
- 移除 localStorage `baby-sleep-start` 機制

## Impact

- `src/App.tsx` — handleStartSleep 改為建立 record + sync；handleFinishSleep 改為更新 record；移除 sleepStartTime state 和 localStorage 邏輯
- `src/components/Layout/SleepBanner.tsx` — 改為接收進行中的 sleep record
- `src/components/Records/RecordForm.tsx` — 睡眠相關 props 調整
