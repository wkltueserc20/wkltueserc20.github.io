## Context

目前 App 啟動時會加載所有歷史紀錄，但 `stats` 的計算僅限於目前所選日期。我們需要一套能橫跨「今天與昨天」的數據彙整邏輯，並將其視覺化。

## Goals / Non-Goals

**Goals:**
- 提供「今日 vs 昨日」的增減數據。
- 加入睡眠紀錄中的「單次最長長覺」分析。
- 顯示成長紀錄的「新鮮度」（距離上次量測的天數）。
- 保持首頁介面的極簡感，僅在數據下方加入精緻的標籤。

**Non-Goals:**
- 不進行跨週、跨月的複雜趨勢分析（這屬於統計頁面範疇）。
- 不實作 AI 預測功能。

## Decisions

### 1. 數據獲取：雙日期彙整 (Dual-Date Aggregation)
- **決策**：在 `App.tsx` 的 `useMemo(stats)` 中，除了計算 `dayRecords`，同時計算 `yesterdayRecords`。
- **理由**：利用現有的 `records` 陣列，增加一組過濾邏輯即可達成，不需要額外的 API 請求或資料存取。

### 2. 洞察指標定義 (Metrics)
- **奶量差值**：`todayTotal - yesterdayTotal`。
- **睡眠差值**：`todaySleepMins - yesterdaySleepMins`。
- **成長新鮮度**：`Math.floor((now - latestGrowth.timestamp) / 86400000)` 天前。

### 3. UI 呈現：對比標籤 (Comparison Tags)
- **決策**：在卡片數值下方新增一個高度縮小的淡色區域。
- **配色規則**：
    - **奶量**：增加為綠色 (代表營養充足)，減少為紅色 (需注意)。
    - **睡眠**：增加為綠色 (代表休息充足)，減少超過 20% 為黃色 (提醒)。
    - **文字樣式**：`text-[9px]`, `font-black`, `uppercase`。

### 4. 工具函式
- **決策**：在 `utils/dateUtils.ts` 新增 `getYesterdayDateString(targetDate)`。
- **理由**：確保跨月份、跨年份的「昨天」計算正確（例如 3/1 的昨天是 2/28）。

## Risks / Trade-offs

- **[Risk] 資料不全導致的對比失真**：如果昨天沒紀錄，今日增加會顯示 +100%。
    - 🛡️ **Mitigation**: 若昨日數據為 0，則不顯示百分比對比，僅顯示「較昨天增加」。
- **[Trade-off] 計算開銷微增**：每次紀錄變動會多過濾一次陣列。
    - 🛡️ **Mitigation**: 目前紀錄量（數百筆）下，JavaScript 處理速度在毫秒級，不影響體感。
