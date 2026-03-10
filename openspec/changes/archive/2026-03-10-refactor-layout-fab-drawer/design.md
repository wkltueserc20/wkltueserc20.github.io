## Context

目前專案的 `App.tsx` 導覽列與內容區塊是線性堆疊的。為了實作 FAB (Floating Action Button)，我們需要調整 CSS 佈局層級，利用 `z-index` 與 `fixed` 定位。

## Goals / Non-Goals

**Goals:**
- 提供一個全域可見、位於導覽列中央的圓形「＋」按鈕。
- 實作滑動式的 `BottomSheet` 容器。
- 點擊「編輯紀錄」時，也能觸發 `BottomSheet` 開啟並載入該筆紀錄。
- 確保在手機虛擬鍵盤彈出時，抽屜內的表單依然易於操作。

**Non-Goals:**
- 不改變 `RecordForm` 內部的欄位邏輯。
- 不引入重型動畫庫（優先使用 Tailwind 動畫）。

## Decisions

### 1. 抽屜容器設計
- **決策**：建立 `src/components/Layout/BottomSheet.tsx`。
- **結構**：
    - `Backdrop`: 半透明黑色背景，點擊可關閉。
    - `Sheet Content`: 白色容器，圓角設於頂部，支援從下往上的 `slide-in` 動畫。
- **技術**：使用 `AnimatePresence` (如果引入 framer-motion) 或單純的 CSS Classes 控制動畫。

### 2. 導覽列 (Navbar) 的 CSS 調整
- **決策**：給予 Navbar 一個 `relative` 容器，並讓圓按鈕透過 `absolute -top-10` 向上偏移。
- **視覺**：圓按鈕背景使用深色 (`slate-900`) 或主色 (`indigo-600`)，與導覽列產生視覺對比。

### 3. 狀態連動
- **決策**：
    - 新增 `const [showForm, setShowForm] = useState(false)`。
    - 當 `isEditing` 被設定時，同步呼叫 `setShowForm(true)`。
    - 點擊底部「＋」時，呼叫 `setIsEditing(null)` 與 `setShowForm(true)`。

## Risks / Trade-offs

- **[Risk] 手機軟體鍵盤遮擋**：當抽屜在底部，點擊輸入框時，鍵盤可能蓋住儲存按鈕。
    - 🛡️ **Mitigation**: 確保抽屜內部支援捲動 (`overflow-y-auto`)，且底部留有足夠的 `padding`。
- **[Trade-off] DOM 結構嵌套**：抽屜代碼可能需要放置在 `App.tsx` 的最後方以獲得最高 `z-index`。
