## MODIFIED Requirements

### Requirement: 副食品名稱輸入支援歷史候選清單
副食品名稱（`label`）輸入欄位 SHALL 提供基於歷史記錄的 autocomplete 候選清單，讓使用者可直接點選已記錄過的食物名稱。選擇已有歷史食材的名稱後，系統 SHALL 提供快速套用上次食材的功能（見 `solid-food-last-ingredients-autofill` spec）。

#### Scenario: 有歷史副食品記錄時顯示候選清單
- **WHEN** 使用者開啟副食品記錄表單並點擊食物名稱輸入欄位
- **THEN** 系統 SHALL 顯示過去記錄中所有唯一的非空食物名稱作為候選選項

#### Scenario: 點選候選名稱填入輸入欄位
- **WHEN** 使用者從候選清單中選擇一個食物名稱
- **THEN** 系統 SHALL 將該名稱填入食物名稱輸入欄位

#### Scenario: 沒有歷史副食品記錄時不顯示候選清單
- **WHEN** 使用者開啟副食品記錄表單，但過去無任何副食品記錄
- **THEN** 系統 SHALL 不顯示候選清單，輸入欄位維持一般文字輸入行為

#### Scenario: 候選清單排序
- **WHEN** 歷史候選清單顯示時
- **THEN** 候選名稱 SHALL 依最近使用時間由新到舊排序

#### Scenario: 使用者仍可自由輸入新名稱
- **WHEN** 使用者在名稱欄位輸入一個不存在於候選清單的名稱
- **THEN** 系統 SHALL 允許儲存該新名稱，不強制限制只能選候選項目
