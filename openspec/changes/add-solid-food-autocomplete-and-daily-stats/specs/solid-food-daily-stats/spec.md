## ADDED Requirements

### Requirement: 每日副食品總克數統計卡片
系統 SHALL 在每日統計摘要（SummaryCards）中顯示當日所有副食品記錄的克數加總。

#### Scenario: 當日有副食品記錄時顯示統計卡片
- **WHEN** 所查詢日期存在至少一筆 `type === 'babyfood'` 且未刪除的記錄
- **THEN** 系統 SHALL 在 SummaryCards 中顯示副食品統計卡片，內容為當日所有副食品 `amount` 欄位的加總（單位：克）

#### Scenario: 當日無副食品記錄時不顯示統計卡片
- **WHEN** 所查詢日期不存在任何副食品記錄
- **THEN** 系統 SHALL 不顯示副食品統計卡片

#### Scenario: 副食品總克數計算僅包含當日記錄
- **WHEN** 跨日查看統計時
- **THEN** 每日副食品統計 SHALL 只計算該日的副食品記錄，不包含其他日期

#### Scenario: 副食品記錄缺少 amount 欄位時視為 0 克
- **WHEN** 某筆副食品記錄的 `amount` 欄位為 undefined 或 null
- **THEN** 該筆記錄 SHALL 以 0 克計入總克數，不影響其他記錄的加總
