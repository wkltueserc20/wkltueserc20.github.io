## Context

目前「自動通知開關」僅作為設定頁面的一個狀態存在，並未被整合進發送通知的核心流程。

## Goals / Non-Goals

**Goals:**
- 確保當 `lineEnabled` 為 false 時，絕不發出 GAS API 請求（手動測試除外）。
- 同步 UI 提示訊息，避免在關閉開關時顯示「正在同步雲端提醒...」。

**Non-Goals:**
- 不涉及 GAS 伺服器端的代碼修改。
- 不改變 `babyInfo` 的資料結構。

## Decisions

### 1. 核心攔截策略
- **決策**：在 `useSync.ts` 的 `callGasApi` 函式開頭，增加一個 `isTest` 與 `lineEnabled` 的複合判斷。
- **理由**：這能確保所有的雲端排程請求（不論是從哪裡觸發的）都能在最底層被正確過濾。

### 2. UI 提示一致性
- **決策**：在 `App.tsx` 的 `handleSaveRecord` 中，將 `callGasApi` 及其對應的 `showToast` 訊息包裹在 `if (babyInfo?.lineEnabled)` 判斷中。
- **理由**：如果使用者關閉了通知，系統就不應該顯示「正在同步雲端提醒...」這種會讓人誤以為功能還在執行的訊息。

## Risks / Trade-offs

- **[Risk] 手動測試按鈕**：需確保手動「測試 GAS」按鈕在開關關閉時依然能運作（以便排查連線問題）。
    - 🛡️ **Mitigation**: 使用傳入的 `isTest` 參數來跳過開關檢查。
