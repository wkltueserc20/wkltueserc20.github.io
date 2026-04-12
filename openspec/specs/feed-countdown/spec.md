### Requirement: FeedCountdown timer fires every second
`FeedCountdown` 的 `setInterval` 週期 SHALL 為 1000ms，確保進度條每秒平滑更新、元件不顯示為凍結狀態。

#### Scenario: 進度條持續移動
- **WHEN** 距下次餵奶還有剩餘時間
- **THEN** 進度條寬度每秒遞增，配合 CSS transition 呈現流暢動畫

#### Scenario: 倒數文字每分鐘更新
- **WHEN** `now` 每秒更新
- **THEN** 顯示的 `Xh Ym` 字串在跨分鐘時自動更新，無需使用者重開頁面
