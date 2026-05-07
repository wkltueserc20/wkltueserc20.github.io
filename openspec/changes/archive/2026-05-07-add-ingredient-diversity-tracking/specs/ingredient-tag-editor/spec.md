## ADDED Requirements

### Requirement: 副食品卡片顯示食材標籤
副食品統計頁的每張食物卡片 SHALL 在現有資訊下方顯示該 label 對應的食材標籤列表及新增按鈕。

#### Scenario: 已設定 ingredients 時顯示 tag
- **WHEN** 一個 label 的 records 已有 `ingredients` 資料
- **THEN** 卡片 SHALL 顯示每個食材名稱為獨立 tag chip，每個 chip 右側有刪除符號 ×

#### Scenario: 尚未設定 ingredients 時顯示提示
- **WHEN** 一個 label 的 records 的 `ingredients` 為空或未設定
- **THEN** 卡片 SHALL 顯示「（未標記）」灰色提示文字

#### Scenario: 所有卡片皆顯示新增按鈕
- **WHEN** 副食品統計頁顯示任一食物卡片
- **THEN** 卡片 SHALL 顯示一個 ＋ 按鈕供新增食材標籤

### Requirement: 食材標籤選取 Sheet
點擊食物卡片的 ＋ 按鈕 SHALL 彈出一個 sheet，提供三層來源讓使用者選取或輸入食材。

#### Scenario: Sheet 顯示自動推斷建議
- **WHEN** 使用者點擊某 label 卡片的 ＋ 按鈕
- **THEN** Sheet SHALL 在「建議」區段顯示從該 label 自動推斷的食材候選（若推斷有結果）

#### Scenario: Sheet 顯示歷史標籤
- **WHEN** 使用者點擊 ＋ 按鈕且系統存在其他 label 已標記的食材
- **THEN** Sheet SHALL 在「已用過的食材」區段顯示所有 records 的 ingredients 聯集（去重、已選者除外）

#### Scenario: 點選建議或歷史標籤即加入
- **WHEN** 使用者點擊 Sheet 中的任一建議食材或歷史標籤
- **THEN** 系統 SHALL 將該食材立即加入當前 label 的 ingredients 並在卡片上顯示

#### Scenario: 自由輸入新食材
- **WHEN** 使用者在 Sheet 的輸入框輸入文字並按 Enter 或點確認
- **THEN** 系統 SHALL 將該文字作為新食材加入 ingredients

#### Scenario: 輸入框過濾歷史標籤
- **WHEN** 使用者在 Sheet 輸入框輸入部分文字
- **THEN** 歷史標籤區段 SHALL 即時過濾，只顯示包含該文字的標籤

### Requirement: 刪除食材標籤
使用者 SHALL 可從卡片上直接刪除已標記的食材。

#### Scenario: 點擊 tag 的 × 刪除食材
- **WHEN** 使用者點擊卡片上某食材 tag 的 × 符號
- **THEN** 系統 SHALL 從該 label 所有 records 的 ingredients 中移除該食材並更新顯示

### Requirement: 同 label 批次更新 ingredients
編輯某 label 的 ingredients 時，系統 SHALL 將變更套用至所有擁有相同 label 的未刪除 records。

#### Scenario: 新增食材時批次寫入
- **WHEN** 使用者從 Sheet 選取或輸入一個食材
- **THEN** 系統 SHALL 更新所有 `label` 相同的未刪除 records，將該食材加入其 `ingredients` 陣列

#### Scenario: 刪除食材時批次移除
- **WHEN** 使用者刪除某食材 tag
- **THEN** 系統 SHALL 從所有 `label` 相同的未刪除 records 的 `ingredients` 中移除該食材
