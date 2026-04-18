## Context

目前 app 已支援餵奶、睡眠、成長、副食品、體溫、疫苗等記錄類型，統一以 `Record` 介面儲存，`RecordType` 聯集識別類型。統計頁（StatsTab）顯示圖表，SummaryCards 顯示每日摘要。

用藥記錄需求與現有 babyfood 記錄相似：都有「名稱」、「數量」、「單位」三個核心欄位，且現有 `Record` 介面已有 `label`、`amount`、`subType` 欄位可直接對應。

## Goals / Non-Goals

**Goals:**
- 新增 `medication` RecordType，沿用 `label`（藥名）、`amount`（劑量）、`subType`（單位：mg/ml/顆）
- 在 RecordForm 新增用藥表單，藥名支援歷史記錄 autocomplete
- 在 SummaryCards 當日有用藥時顯示用藥次數（💊 icon）
- 在 StatsTab 新增「最近用藥」區塊：顯示最近一筆用藥日期與藥名

**Non-Goals:**
- 用藥提醒 / 推播通知
- 藥物資料庫整合
- 用藥圖表（折線/柱狀）

## Decisions

### 沿用既有 Record 欄位，不新增欄位
`label` = 藥名，`amount` = 劑量數字，`subType` = 單位（mg / ml / 顆 / 包）。
與 babyfood 的欄位對應相同，無需修改 `Record` 介面，只需加入新 RecordType。

**替代方案：** 新增 `medicationName`、`dosageUnit` 欄位。
**放棄理由：** Record 介面已有足夠的通用欄位；過度特化 interface 會增加維護負擔。

### 統計頁只顯示「最近用藥日期+藥名」，不顯示圖表
用藥是事件性資料（生病才有），不適合折線圖。父母最需要的是「上次什麼時候給了什麼藥」。

### 藥名 autocomplete 使用與 solidFoodLabels 相同模式
從所有歷史 `medication` records 收集 `label` 值，傳入表單作為 datalist 選項。

## Risks / Trade-offs

- [重複給藥風險] 本功能僅記錄，不做劑量間隔提示 → 可於後續迭代補充
- [subType 欄位語意複用] babyfood 用 subType 存分類，medication 用來存單位，語意不同但不衝突，因各自以 `type` 識別
