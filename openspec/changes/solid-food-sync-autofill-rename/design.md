## Context

App 已有全域 pull-to-refresh（掛在 `<main>` 的 `onTouchEnd`）和 `fullSync` 機制，但 `RecordsPage` / `SolidFoodStatsPage` 完全沒有接收 sync 相關 props，導致：
1. 使用者在副食品頁面看不到任何同步入口或提示
2. `RecordForm` 在選擇舊名稱時只有關鍵字推斷，不會帶入上次實際使用的食材
3. `SolidFoodStatsPage` 的食物名稱是 `<span>`，打錯後無法修正，只能刪掉重建

## Goals / Non-Goals

**Goals:**
- 讓副食品頁面的使用者知道「下拉可以同步」
- 新增副食品時同名記錄的食材可一鍵套用
- 副食品名稱打錯可在記錄頁直接修正，重名時有警告

**Non-Goals:**
- 不新增獨立的同步按鈕（pull-to-refresh 已足夠）
- 不改動同步邏輯本身（fullSync 行為不變）
- 不支援部分食材合併（重名時整組食材以新名稱那筆為主）

## Decisions

### D1：Sync 提示的位置與實作

選擇在 `SolidFoodStatsPage` 頂部加一個低調的提示條（非 button），`isConnected` 為 true 時才顯示。

理由：不額外佔用操作空間，只是提示性文字，不會誤導使用者認為這是可按的觸發點。

傳遞路徑：`App` → `RecordsPage` → `SolidFoodStatsPage`（只傳 `isConnected`，不傳 `isSyncing`，因為提示是靜態的）

### D2：上次食材套用的觸發時機

只在以下條件同時成立時顯示「上次食材」套用區塊：
- `!isEditing`（非編輯模式）
- `foodName` 完全符合 records 中某個 babyfood label
- `foodIngredients.length === 0`（目前尚未選取任何食材）

用 `useMemo` 計算 `lastIngredients`（從 records 找最新同 label 且有 ingredients 的那筆）。
點「套用」後直接 `setFoodIngredients(lastIngredients)`，之後使用者仍可增減。

不使用 `useEffect` 自動套用，避免使用者在打字過程中被意外覆蓋。

### D3：重名警告的實作

Rename 流程：
1. 使用者在 bottom sheet 輸入新名稱 → 點確認
2. 若 `groups.some(g => g.label === newName && g.label !== oldLabel)` → 顯示 inline 警告文字，要求再次確認
3. 確認後才呼叫 `onRenameFood(oldLabel, newLabel)`

`handleRenameFood` 在 App.tsx：
```
records.map(r => r.type === 'babyfood' && !r.isDeleted && r.label === oldLabel
  ? { ...r, label: newLabel, updatedAt: now }
  : r
)
→ 每筆 updateRecord
→ fullSync
→ showToast
```

重名合併後，兩組 records 的食材以各自原本的 ingredients 保留（不做食材合併），SolidFoodStatsPage 的 group 計算邏輯會自動合併顯示。

## Risks / Trade-offs

- **重名合併不可逆**：目前 rename 只做 soft update（updatedAt 更新），但合併後若後悔需要手動逐筆改，沒有 undo。可接受，因為警告流程已明確告知。
- **lastIngredients 讀取最新的一筆**：若使用者同一道食物不同次用了不同食材，只取最新的，不做食材聯集。這是預期行為。
- **foodIngredients 為空才顯示套用**：使用者若已手動選了食材再輸入舊名稱，不會顯示套用提示，符合「不覆蓋已選食材」的設計意圖。

## Migration Plan

純前端改動，無資料 schema 變更，無需 migration。既有 records 資料完全兼容。
