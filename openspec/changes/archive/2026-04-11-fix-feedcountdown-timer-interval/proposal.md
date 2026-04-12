## Why

在 v9.12 的優化中，將 `FeedCountdown` 的 `setInterval` 從 1000ms 改成 60000ms，導致倒數計時顯示近乎凍結：進度條不動、時間字串要等整整一分鐘才更新，使用者誤以為頁面壞掉，需要重開才能看到正確時間。需恢復為合理的更新頻率。

## What Changes

- 將 `FeedCountdown` 的 `setInterval` 從 60000ms 改回 1000ms
- 保留其他 v9.12 的 FeedCountdown 改動（可設定靜音時段、quietHourStart/quietHourEnd props）

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
<!-- 純實作細節變更，無 spec 層行為改變 -->

## Impact

- `src/components/Home/FeedCountdown.tsx`（僅改 interval 數字）
