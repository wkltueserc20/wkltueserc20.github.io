## ADDED Requirements

### Requirement: 新增用藥 RecordType
系統 SHALL 支援 `type === 'medication'` 的 Record，使用 `label` 欄位儲存藥名、`amount` 欄位儲存劑量數字、`subType` 欄位儲存單位（如 mg、ml、顆、包）。

#### Scenario: 儲存用藥記錄
- **WHEN** 使用者建立一筆 type 為 medication 的記錄，填入藥名、劑量與單位
- **THEN** 系統 SHALL 儲存含 `type: 'medication'`、`label`（藥名）、`amount`（劑量）、`subType`（單位）的 Record

#### Scenario: 用藥記錄可省略劑量
- **WHEN** 使用者未填入劑量或單位
- **THEN** 系統 SHALL 允許 `amount` 與 `subType` 為空，仍可儲存記錄

### Requirement: 用藥記錄表單
系統 SHALL 在 RecordForm 提供用藥類型的輸入表單，包含：藥名（文字輸入，含歷史記錄 autocomplete）、劑量（數字輸入）、單位選擇（mg / ml / 顆 / 包）、記錄時間。

#### Scenario: 填寫用藥表單
- **WHEN** 使用者在 RecordForm 選擇「用藥」類型
- **THEN** 系統 SHALL 顯示藥名輸入欄（datalist autocomplete）、劑量數字欄、單位選擇欄

#### Scenario: 藥名 autocomplete 顯示歷史藥名
- **WHEN** 使用者在藥名欄輸入文字
- **THEN** 系統 SHALL 顯示過去所有用藥記錄中使用過的藥名作為建議選項

### Requirement: 用藥記錄顯示
系統 SHALL 在 RecordList 中顯示用藥記錄，呈現藥名、劑量+單位與記錄時間。

#### Scenario: 顯示完整用藥資訊
- **WHEN** RecordList 中存在用藥記錄
- **THEN** 系統 SHALL 顯示 💊 圖示、藥名、劑量與單位（如「布洛芬 5 ml」）

#### Scenario: 無劑量時只顯示藥名
- **WHEN** 用藥記錄缺少 amount 欄位
- **THEN** 系統 SHALL 只顯示藥名，不顯示劑量與單位

### Requirement: 快速記錄入口
系統 SHALL 在 QuickRecord 區塊新增用藥快速記錄按鈕，點擊後開啟 RecordForm 並預選用藥類型。

#### Scenario: 快速記錄按鈕可見
- **WHEN** 使用者在首頁查看 QuickRecord 區塊
- **THEN** 系統 SHALL 顯示用藥快速記錄按鈕（💊 圖示）

#### Scenario: 點擊快速記錄按鈕
- **WHEN** 使用者點擊用藥快速記錄按鈕
- **THEN** 系統 SHALL 開啟 RecordForm 並預先選擇「用藥」類型
