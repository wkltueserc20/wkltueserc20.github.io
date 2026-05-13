## ADDED Requirements

### Requirement: 未施打疫苗可調整預約資訊
系統 SHALL 在未施打疫苗卡片提供「調整預約」按鈕，允許使用者修改預約日期、疫苗名稱、劑次及備註，並將更新寫入 `timestamp` 欄位，不影響 `endTimestamp`。

#### Scenario: 開啟調整預約 modal
- **WHEN** 使用者點擊未施打疫苗卡片的「調整預約」按鈕
- **THEN** 系統彈出 modal，顯示疫苗名稱、劑次、預約日期（type="date"）、備註欄位，預填目前資料

#### Scenario: 儲存修改後更新卡片
- **WHEN** 使用者修改欄位後點擊「儲存調整」
- **THEN** 系統更新該疫苗的 `timestamp`、`subType`、`label`、`note`，卡片顯示新的預約日期，modal 關閉

#### Scenario: 取消不儲存
- **WHEN** 使用者點擊 modal 的「✕」或背景遮罩
- **THEN** modal 關閉，資料不變

#### Scenario: 日期格式驗證
- **WHEN** 使用者未填寫預約日期即點擊儲存
- **THEN** 系統不執行儲存（timestamp 為 NaN 時不呼叫 callback）
