## Context

目前 `RecordList` 內的每個項目都是靜態渲染。要實作滑動刪除，我們需要為列表項目建立一個「兩層結構」：底層是隱藏的操作按鈕，頂層是可拖曳的內容卡片。

## Goals / Non-Goals

**Goals:**
- 實現順暢的左滑揭示 (Left-swipe to reveal) 動畫。
- 點擊卡片本體觸發編輯回呼。
- 點擊揭示後的紅色區域觸發刪除確認。
- 確保當一個項目被滑開時，點擊其他地方或滑動其他項目會自動收回當前項目。

**Non-Goals:**
- 不實作右滑手勢（僅保留單向左滑）。
- 不實作全屏滑動刪除（必須點擊按鈕確認，防止誤刪）。

## Decisions

### 1. 使用 Framer Motion 進行手勢管理
- **決策**：採用 `framer-motion` 的 `drag` 屬性。
- **理由**：相比於原生 `touchstart`，Framer Motion 處理了彈力回饋、動量與慣性，且能輕鬆設定 `dragConstraints` 與 `dragElastic`，體感遠超手寫邏輯。

### 2. 組件結構 (Compound Component)
- **決策**：建立 `SwipeableRecordItem` 組件。
- **佈局**：
    ```text
    Container (Relative, Overflow-hidden)
     ├── Bottom Layer (Absolute Right-0, Red Background, Delete Icon)
     └── Top Layer (Motion.div, Drag="x", White Background, Record Info)
    ```

### 3. 滑動閾值與鎖定
- **決策**：向左滑動限制在 `-80px`。
- **交互**：當滑動距離超過 `-40px` 且放手時，自動彈到 `-80px`（保持開啟）；否則彈回 `0`（收回）。

### 4. 點擊穿透處理
- **決策**：頂層 Motion 容器需區分「點擊」與「拖曳」。
- **解決方案**：利用 Framer Motion 的 `onTap` 代替 `onClick`，確保在拖曳過程中不會意外觸發編輯。

## Risks / Trade-offs

- **[Risk] 使用者發現性 (Discoverability)**：初次使用者可能不知道可以左滑。
    - 🛡️ **Mitigation**: 在初次啟動的手冊中增加手勢說明，或在清單載入時加入微小的橫向擺動動畫提示。
- **[Trade-off] 渲染壓力**：列表項目過多時，大量的 Motion 組件可能影響性能。
    - 🛡️ **Mitigation**: 配合現有的分頁或過濾邏輯（每日紀錄通常不超過 20 筆），性能影響在可控範圍內。
