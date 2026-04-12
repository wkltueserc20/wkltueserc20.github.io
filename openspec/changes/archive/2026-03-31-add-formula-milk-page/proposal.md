## Why

目前只記錄每次餵奶量，但沒有追蹤「一罐奶粉用了多久」「哪個店家比較便宜」的功能。家長需要知道奶粉消耗速度以便補貨，也想比較不同通路的價格。

## What Changes

### 新增奶粉管理頁面

將現有的「💉 疫苗」獨立 tab 整合進新的「📒 紀錄」tab，內含兩個子標籤：
- **疫苗**：原本的 VaccinePage（不變）
- **奶粉**：新的 FormulaPage

### 奶粉頁面功能

**使用記錄區塊**
- 【使用中】：依奶粉名稱分群，顯示開瓶日期 → 使用中
- 【已用完】：依奶粉名稱分群，預設折疊，旁邊顯示罐數，展開後顯示每罐細節
- 每筆記錄可編輯（開瓶日期、用完日期、店家、金額）
- 每個品牌群組顯示累計花費

**店家價格表區塊**
- 以「奶粉品牌 + 店家」為 key 記錄定價
- 新增一罐時選擇品牌 + 店家，自動帶入對應定價
- 可新增 / 編輯各組合的價格

**新增一罐表單**
- 奶粉名稱（從既有品牌選，或輸入新的）
- 店家（從既有店家選，或輸入新的）→ 自動帶入金額
- 金額（可手動修改）
- 開瓶日期（預設今天，僅年月日）
- 用完日期（可空白，之後再填）
- 備註

### 資料模型

沿用現有 `Record` 型別，新增兩種 type：

```
formula_can（使用記錄）
  subType: 奶粉品牌名稱   ← 分群 key
  label:   店家名稱
  amount:  購買金額
  timestamp:    開瓶日期
  endTimestamp: 用完日期（空 = 使用中）

formula_price（店家價格表）
  subType: 奶粉品牌名稱
  label:   店家名稱
  amount:  定價
  timestamp: 建立/更新時間
```

Sync 機制完全不需要修改。

## Impact

### 類型
- `src/types.ts` — RecordType 加 `'formula_can' | 'formula_price'`，TabType 加 `'records'`，移除 `'vaccine'`

### 導航
- `src/App.tsx` — 底部導航 vaccine tab 改為 records tab，加入 RecordsPage，TAB_ORDER 更新

### 新元件
- `src/components/Records/RecordsPage.tsx` — 疫苗/奶粉子標籤容器
- `src/components/Formula/FormulaPage.tsx` — 奶粉主頁面

### 資料庫
- `src/db/db.ts` — 版本升級，formula_can / formula_price 加入索引

## Non-goals
- 奶粉消耗速度預測或補貨提醒（未來可加）
- 奶粉與餵奶記錄的關聯分析（未來可加）
- 多寶寶奶粉管理（超出目前 app 範疇）
