## MODIFIED Requirements

### Requirement: 紀錄頁包含副食品、奶粉、疫苗三個子頁面
「紀錄」頁（RecordsPage）SHALL 包含三個子頁面：副食品、奶粉、疫苗，並以副食品為預設頁。

#### Scenario: 進入紀錄頁時預設顯示副食品統計頁
- **WHEN** 使用者切換至「紀錄」tab
- **THEN** 系統 SHALL 預設顯示副食品統計子頁面（而非奶粉）

#### Scenario: 子頁切換正常運作
- **WHEN** 使用者點擊子頁標籤列中的「奶粉」或「疫苗」
- **THEN** 系統 SHALL 切換至對應子頁面，副食品頁隱藏
