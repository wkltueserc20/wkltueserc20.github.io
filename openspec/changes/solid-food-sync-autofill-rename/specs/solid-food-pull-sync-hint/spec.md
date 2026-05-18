## ADDED Requirements

### Requirement: 副食品統計頁已連線時顯示下拉同步提示
系統 SHALL 在 `SolidFoodStatsPage` 的頂部，當 `isConnected` 為 `true` 時，顯示一條低調的「↓ 下拉頁面可同步最新資料」提示文字，提示使用者可以使用下拉手勢觸發同步。

#### Scenario: 已連線時顯示提示條
- **WHEN** 使用者進入副食品統計頁且 `isConnected` 為 `true`
- **THEN** 系統 SHALL 在列表最頂部顯示「↓ 下拉頁面可同步最新資料」提示

#### Scenario: 未連線時不顯示提示條
- **WHEN** 使用者進入副食品統計頁且 `isConnected` 為 `false`
- **THEN** 系統 SHALL 不顯示下拉同步提示，版面與目前相同

#### Scenario: 提示不可點擊、不觸發任何動作
- **WHEN** 使用者點擊下拉同步提示文字
- **THEN** 系統 SHALL 不觸發任何行為（提示只是說明文字，非 button）

#### Scenario: isConnected 從已連線切換為未連線時隱藏提示
- **WHEN** 使用者的 sync 連線設定被移除，`isConnected` 變為 `false`
- **THEN** 提示條 SHALL 消失
