## ADDED Requirements

### Requirement: 新增副食品時顯示上次食材快速套用按鈕
當使用者在新增副食品記錄表單（非編輯模式）中輸入的食物名稱完全符合歷史記錄中的某個 label，且目前食材列表為空時，系統 SHALL 在食材區顯示「上次食材」區塊，列出最近一次同名記錄的食材，並提供「套用」按鈕。

#### Scenario: 名稱完全符合歷史且食材為空時顯示套用區塊
- **WHEN** 使用者在新增模式下輸入的 `foodName` 完全等於歷史 records 中某個 babyfood 記錄的 `label`，且 `foodIngredients` 為空陣列
- **THEN** 系統 SHALL 在食材輸入區上方顯示「📋 上次食材」區塊，列出最新同名記錄的 `ingredients` 及「套用」按鈕

#### Scenario: 點擊套用後將上次食材填入食材列表
- **WHEN** 使用者點擊「套用」按鈕
- **THEN** 系統 SHALL 將上次食材整組填入 `foodIngredients`，套用區塊消失

#### Scenario: 食材已有值時不顯示套用區塊
- **WHEN** 使用者輸入符合歷史的食物名稱，但 `foodIngredients` 已含有一個以上的食材
- **THEN** 系統 SHALL 不顯示「上次食材」套用區塊，不影響已選食材

#### Scenario: 名稱不符合任何歷史記錄時不顯示套用區塊
- **WHEN** 使用者輸入的食物名稱不完全等於任何歷史 babyfood label
- **THEN** 系統 SHALL 不顯示「上次食材」套用區塊

#### Scenario: 編輯模式下不顯示套用區塊
- **WHEN** 使用者正在編輯一筆既有的副食品記錄
- **THEN** 系統 SHALL 不顯示「上次食材」套用區塊，無論名稱是否符合歷史

#### Scenario: 歷史記錄中同名食物沒有 ingredients 時不顯示套用區塊
- **WHEN** 使用者輸入符合歷史的食物名稱，但該食物的所有歷史記錄 `ingredients` 均為空陣列或 undefined
- **THEN** 系統 SHALL 不顯示「上次食材」套用區塊
