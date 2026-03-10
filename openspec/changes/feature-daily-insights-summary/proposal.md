## Why

目前的應用程式僅顯示當日的總量（奶量、睡眠、成長），缺乏時間軸上的對比維度。這使得使用者難以快速判斷寶寶的作息規律是否有顯著變動。透過實作「數據洞察摘要」，我們能自動對比今日與昨日的數據，並提供人性化的增減提示，讓數據真正發揮指導作用。

## What Changes

- **新增昨日數據對比**：在首頁統計卡片（奶量、睡眠）下方新增對比標籤，顯示較前一日的增減量與百分比。
- **智慧趨勢提示**：利用圖示（📈/📉/➖）直觀展示變化趨勢。
- **長覺洞察**：分析睡眠紀錄，找出昨晚的最長連續睡眠時間，並在摘要中展示。
- **發育動態提醒**：計算距離上次更新成長數據的天數，提醒使用者定期紀錄。
- **UI 色彩引導**：根據數據變化的正負向（如奶量增加為綠色、睡眠減少為黃色）進行視覺強化。

## Capabilities

### New Capabilities
- `daily-data-comparison`: 實作今日與昨日資料的聯動比對邏輯。
- `insight-visual-tags`: 建立專門展示增減趨勢的 UI 小標籤。

### Modified Capabilities
- `growth-summary`: 擴充成長摘要，加入「距離上次測量天數」的提示。

## Impact

- `src/components/Stats/SummaryCards.tsx`: 主要的 UI 修改位置。
- `src/hooks/useRecords.ts` 或 `App.tsx`: 擴充計算邏輯。
- `src/utils/dateUtils.ts`: 新增日期處理輔助函式。
