## Why

目前的紀錄列表採用傳統的靜態圖示按鈕進行編輯與刪除。在行動裝置（尤其是單手操作）情境下，點擊微小的圖標較為困難且容易誤觸。引入「手勢滑動」與「全域點擊」的交互模式，能使 Web App 的操作感更貼近原生 iOS/Android 體驗，提升操作的流暢度與專業感。

## What Changes

- **引入 `framer-motion`**：利用高效的動畫庫實作物理感手勢。
- **全域點擊編輯**：將紀錄卡片改為可點擊區域，點擊任何位置皆可觸發 `onEdit` (開啟編輯抽屜)。
- **左滑顯示刪除**：實作向左滑動手勢，滑動後露出下方的紅色「刪除」按鈕區塊。
- **手勢防護機制**：
    - 設定滑動閾值（如 80px），避免輕微晃動誤觸。
    - 滑動停止後需二次點擊紅色區域，並通過系統 `confirm` 彈窗才執行物理刪除。
- **UI 瘦身**：移除紀錄卡片右側原本常駐的「垃圾桶」與「編輯」小圖標，釋放視覺空間。

## Capabilities

### New Capabilities
- `swipe-to-reveal-actions`: 支援透過橫向滑動手勢揭示隱藏的操作按鈕。
- `gesture-based-navigation`: 整合手勢與現有的狀態管理系統。

### Modified Capabilities
- `record-tracking`: 重構紀錄的操作路徑（從按鈕觸發轉向手勢與區域觸發）。

## Impact

- `RecordList.tsx`: 核心 UI 重構。
- `package.json`: 新增 `framer-motion` 依賴。
- `src/components/Records/SwipeableRecordItem.tsx`: 新增手勢封裝組件。
