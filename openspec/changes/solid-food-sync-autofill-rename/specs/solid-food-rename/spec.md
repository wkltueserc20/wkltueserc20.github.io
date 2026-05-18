## ADDED Requirements

### Requirement: 副食品統計頁支援修改食物名稱
系統 SHALL 在副食品統計頁的每張食物卡片上提供 ✎ 編輯按鈕，讓使用者可以修改該食物的名稱。修改後，所有持有該 label 的未刪除 babyfood records 均 SHALL 更新為新名稱，並觸發同步。

#### Scenario: 點擊 ✎ 按鈕開啟重命名 sheet
- **WHEN** 使用者點擊食物卡片上的 ✎ 按鈕
- **THEN** 系統 SHALL 顯示底部 sheet，內含預填舊名稱的文字輸入欄位與「確認修改」、「取消」按鈕

#### Scenario: 輸入新名稱後確認修改（不重名）
- **WHEN** 使用者輸入一個不與其他現有 label 重複的新名稱並點擊「確認修改」
- **THEN** 系統 SHALL 更新所有該 label 的未刪除 babyfood records 的 `label` 欄位為新名稱，關閉 sheet，顯示成功 toast，並觸發 fullSync

#### Scenario: 新名稱與現有 label 重複時顯示警告
- **WHEN** 使用者輸入的新名稱已存在於其他食物群組的 label
- **THEN** 系統 SHALL 在 sheet 內顯示「「{新名稱}」已有 N 筆記錄，確認後兩組記錄將合併」的警告文字，並將確認按鈕改為「確認合併」

#### Scenario: 重名警告後確認合併
- **WHEN** 使用者在看到重名警告後點擊「確認合併」
- **THEN** 系統 SHALL 更新所有舊 label 的 records 為新名稱，兩組 records 合併顯示為同一群組，觸發 fullSync

#### Scenario: 點擊取消或 sheet backdrop 關閉
- **WHEN** 使用者點擊取消按鈕或 sheet 背景遮罩
- **THEN** 系統 SHALL 關閉 sheet，不對任何 record 作任何修改

#### Scenario: 提交空名稱時不允許儲存
- **WHEN** 使用者清空名稱輸入欄位後點擊確認
- **THEN** 系統 SHALL 停用「確認修改」按鈕（disabled 狀態），不允許儲存

#### Scenario: 提交與原名稱相同時不作任何變更
- **WHEN** 使用者未更改名稱直接點擊確認
- **THEN** 系統 SHALL 關閉 sheet 但不更新任何 record，不觸發 fullSync
