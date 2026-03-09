## Why

為了進一步提升多人協作的體感，系統需要能自動感應環境變化（如重新回到 App、恢復網路連線）並執行背景同步。這能確保使用者看到的資料始終是最新的，且不會被頻繁的彈出提示干擾。

## What Changes

- **自動同步觸發機制**：
    - **頁面可見性觸發**：當使用者切換回 App 視窗時自動觸發同步。
    - **連線狀態觸發**：當設備重新連上網路時自動觸發同步。
    - **定期檢查觸發**：每 5 分鐘進行一次背景靜默同步。
- **安靜同步模式 (Silent Sync)**：擴充同步邏輯，支援在不顯示 Toast 提示的情況下執行背景作業。
- **視覺狀態指標**：在 Header 右側新增一個微小的旋轉圖示，用於指示同步進行中。
- **操作防抖 (Debouncing)**：針對連續的紀錄修改加入防抖處理，避免過度頻繁請求 API。

## Capabilities

### New Capabilities
- `auto-sync-trigger`: 監聽瀏覽器事件並自動啟動同步。
- `sync-status-indicator`: 在 UI 上安靜地展示背景同步狀態。

### Modified Capabilities
- `data-sync`: 擴充 `fullSync` 以支援 `silent` 參數。

## Impact

- `src/hooks/useSync.ts`: 新增安靜模式支援。
- `src/App.tsx`: 整合事件監聽器與防抖邏輯。
- `src/components/Layout/SyncIndicator.tsx`: 新增視覺指標組件。
