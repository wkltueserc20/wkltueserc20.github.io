## MODIFIED Requirements

### Requirement: FeedCountdown timer fires every second
`FeedCountdown` 的 `setInterval` 週期 SHALL 為 1000ms，確保進度條每秒平滑更新、元件不顯示為凍結狀態。

#### Scenario: 進度條持續移動
- **WHEN** 距下次餵奶還有剩餘時間
- **THEN** 進度條寬度每秒遞增，配合 CSS transition 呈現流暢動畫

#### Scenario: 倒數文字每分鐘更新
- **WHEN** `now` 每秒更新
- **THEN** 顯示的 `Xh Ym` 字串在跨分鐘時自動更新，無需使用者重開頁面

## ADDED Requirements

### Requirement: 深夜靜音可被完全停用
當 `quietHourDisabled` 為 `true` 時，`FeedCountdown` SHALL 完全略過靜音時段判斷，永遠正常顯示倒數計時。

#### Scenario: 停用靜音後深夜仍顯示倒數
- **WHEN** `quietHourDisabled === true`
- **THEN** 即使目前時間落在 `quietHourStart`～`quietHourEnd` 區間內，`FeedCountdown` 仍顯示倒數而非靜音狀態

#### Scenario: 未設定停用時維持原靜音行為
- **WHEN** `quietHourDisabled` 為 `false`、`undefined` 或未傳入
- **THEN** 靜音邏輯依現有 `quietHourStart`/`quietHourEnd` 判斷運作
