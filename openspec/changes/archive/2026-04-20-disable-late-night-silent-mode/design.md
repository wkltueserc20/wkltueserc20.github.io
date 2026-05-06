## Context

現有的「深夜靜音」功能透過 `quietHourStart`（預設 23）與 `quietHourEnd`（預設 1）兩個欄位定義靜音區間。當最後一筆餵奶紀錄的時間落在此區間內，`FeedCountdown` 會顯示靜音狀態而非倒數計時。

目前沒有任何機制可以讓使用者完全停用此功能，且因為欄位皆為 optional 並有預設值，undefined 也視為「啟用」。

## Goals / Non-Goals

**Goals:**
- 讓使用者可在設定頁一鍵關閉深夜靜音功能
- 關閉後，`FeedCountdown` 完全略過靜音判斷，永遠顯示倒數
- 開關狀態持久化至 `babyInfo`（同步至雲端）

**Non-Goals:**
- 不改變現有時段選擇器邏輯
- 不新增多組靜音區間
- 不影響其他使用 `quietHour` 的功能（目前僅 `FeedCountdown`）

## Decisions

### 新增 `quietHourDisabled` boolean 欄位

**選擇**：在 `BabyInfo` 新增 `quietHourDisabled?: boolean`，預設 `undefined`（視為 `false`，即啟用靜音）。

**理由**：最小侵入性變更。不需要遷移現有資料；undefined 與 false 皆代表「使用靜音」，只有明確設為 `true` 才關閉。無破壞性變更。

**替代方案**：將 `quietHourStart`/`quietHourEnd` 設為 `null` 代表停用 → 會影響現有預設值邏輯，較複雜。

### 設定頁 UI：使用 toggle 開關

**選擇**：在深夜靜音列的右側，時段選擇器前方加一個開關 toggle（checkbox 樣式或 pill toggle）。開關關閉時，隱藏時段選擇器。

**理由**：toggle 清楚傳達「啟用/停用」語意，比在時段選擇器中新增「關閉」選項更直覺。

## Risks / Trade-offs

- [向後相容] `quietHourDisabled` 欄位不存在的舊資料視為啟用靜音 → 與現有行為一致，無風險
- [同步] 欄位透過現有 `babyInfo` 同步機制自動處理 → 無需額外工作
