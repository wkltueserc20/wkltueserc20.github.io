## Context

目前系統具備手動同步能力，但在多設備協作時，使用者必須記得手動點擊或重新整理才能看到另一方的變動。自動化的背景同步將消除這種摩擦。

## Goals / Non-Goals

**Goals:**
- 實現安靜的背景同步（不干擾使用者）。
- 在 UI 角落顯示微小的旋轉圖示指示同步狀態。
- 監聽 `visibilitychange` 與 `online` 事件自動觸發同步。
- 確保背景同步失敗時（如 Token 過期）不會瘋狂彈出錯誤，而是安靜地等待下次手動操作。

**Non-Goals:**
- 不涉及 Service Worker 背景任務（僅在分頁開啟時生效）。
- 不處理跨分頁的狀態廣播（以雲端資料為準）。

## Decisions

### 1. 安靜模式 (Silent Flag)
- **決策**：在 `useSync.ts` 的 `fullSync` 增加 `options: { silent?: boolean }`。
- **理由**：自動同步不應觸發 Toast 提示，以免造成使用者心理負擔。

### 2. 視覺指示器位置
- **決策**：將同步狀態放在 `Header` 的右側，靠近分頁標識的地方。
- **理由**：Header 是全域可見的，且符合主流 App（如 Google Docs）的狀態提示習慣。

### 3. 事件驅動觸發 (Event-driven)
- **決策**：
    - `document.addEventListener('visibilitychange')`: 抓取「回到 App」的時機。
    - `window.addEventListener('online')`: 抓取「恢復連線」的時機。
- **理由**：這些是使用者最需要資料更新的關鍵時刻。

## Risks / Trade-offs

- **[Risk] 過度頻繁請求**：連續的操作可能導致大量 API 呼叫。
    - 🛡️ **Mitigation**: 使用 `lodash.debounce` 或自定義防抖函式處理。
- **[Trade-off] 電量消耗**：頻繁的背景檢查會稍微增加手機電量消耗。
    - 🛡️ **Mitigation**: 定期檢查間隔設定為 5 分鐘，並只在頁面可見時執行。
