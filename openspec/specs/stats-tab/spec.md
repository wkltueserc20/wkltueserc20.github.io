### Requirement: SummaryCards 當日用藥次數顯示
系統 SHALL 在 SummaryCards 中，當所查詢日期存在用藥記錄時，顯示當日用藥次數（💊 圖示）。

#### Scenario: 當日有用藥記錄時顯示用藥次數
- **WHEN** 所查詢日期存在至少一筆 `type === 'medication'` 且未刪除的記錄
- **THEN** 系統 SHALL 在 SummaryCards 摘要列顯示 💊 圖示與用藥次數

#### Scenario: 當日無用藥記錄時不顯示
- **WHEN** 所查詢日期不存在任何用藥記錄
- **THEN** 系統 SHALL 不顯示用藥次數欄位

#### Scenario: 詳細摘要中顯示用藥資訊
- **WHEN** 使用者長按 SummaryCards 開啟詳細模態視窗，且當日有用藥記錄
- **THEN** 系統 SHALL 在詳細摘要中列出當日每筆用藥的藥名、劑量與時間

### Requirement: StatsTab 最近用藥摘要
系統 SHALL 在 StatsTab 顯示「最近用藥」摘要區塊，包含最近一筆用藥的日期與藥名；若從未有用藥記錄則不顯示此區塊。

#### Scenario: 有用藥記錄時顯示最近用藥
- **WHEN** 系統中存在至少一筆用藥記錄
- **THEN** StatsTab SHALL 顯示最近一筆用藥的日期（格式：M月D日）與藥名

#### Scenario: 無用藥記錄時不顯示區塊
- **WHEN** 系統中不存在任何用藥記錄
- **THEN** StatsTab SHALL 不顯示最近用藥摘要區塊
