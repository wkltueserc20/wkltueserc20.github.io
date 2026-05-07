## Requirements

### Requirement: 副食品統計頁顯示已嘗試食材總種類數
副食品統計頁 SHALL 在食物卡片列表上方顯示一個摘要區塊，呈現已嘗試的唯一食材總種類數。

#### Scenario: 有已標記 ingredients 的記錄時顯示種類數
- **WHEN** 至少一筆未刪除的 babyfood 記錄含有 `ingredients` 資料
- **THEN** 系統 SHALL 顯示「已嘗試食材種類 N 種」，N 為所有 babyfood records 的 ingredients 陣列聯集後去重的長度

#### Scenario: 無任何 ingredients 標記時顯示零
- **WHEN** 所有 babyfood 記錄的 ingredients 皆為空或未設定
- **THEN** 系統 SHALL 顯示「已嘗試食材種類 0 種」或隱藏該摘要區塊

#### Scenario: 新增或刪除食材標籤後即時更新
- **WHEN** 使用者新增或刪除任一 label 的食材標籤
- **THEN** 已嘗試食材種類數 SHALL 即時反映最新值
