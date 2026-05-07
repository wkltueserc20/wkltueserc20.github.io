## ADDED Requirements

### Requirement: 從 label 自動推斷食材
系統 SHALL 提供一個本地純函式，從副食品 label 字串推斷可能的個別食材列表，用於填充 Sheet 的「建議」區段。

#### Scenario: 單一食材 label 推斷
- **WHEN** label 為「南瓜泥」（食材名 + 後綴）
- **THEN** 推斷函式 SHALL 回傳 `['南瓜']`

#### Scenario: 多食材混合 label 推斷
- **WHEN** label 為「南瓜雞肉泥」（多個食材名 + 後綴）
- **THEN** 推斷函式 SHALL 回傳 `['南瓜', '雞肉']`（順序依出現位置）

#### Scenario: 無法比對時回傳空陣列
- **WHEN** label 無法在字典中比對到任何食材（如「媽媽特調」）
- **THEN** 推斷函式 SHALL 回傳 `[]`，不產生錯誤

#### Scenario: 推斷結果僅為建議，不自動寫入
- **WHEN** 系統對某 label 完成推斷
- **THEN** 系統 SHALL 僅將推斷結果呈現於 Sheet 的建議區段，不自動寫入 records 的 ingredients

### Requirement: 食材字典涵蓋常見嬰兒副食品食材
系統 SHALL 內建一份常見嬰兒副食品食材字典，至少涵蓋以下類別：蔬菜、水果、蛋白質（肉類／魚類／豆類）、穀物。

#### Scenario: 字典涵蓋常見蔬菜
- **WHEN** 推斷函式處理含有常見蔬菜名稱的 label（如南瓜、地瓜、紅蘿蔔、菠菜、花椰菜）
- **THEN** 推斷函式 SHALL 正確識別並回傳對應食材名稱

#### Scenario: 字典涵蓋常見水果
- **WHEN** 推斷函式處理含有常見水果名稱的 label（如蘋果、香蕉、梨、芒果、葡萄）
- **THEN** 推斷函式 SHALL 正確識別並回傳對應食材名稱

#### Scenario: 字典涵蓋常見蛋白質
- **WHEN** 推斷函式處理含有常見蛋白質名稱的 label（如雞肉、豬肉、牛肉、鮭魚、豆腐）
- **THEN** 推斷函式 SHALL 正確識別並回傳對應食材名稱
