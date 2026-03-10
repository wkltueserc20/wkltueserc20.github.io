## Context

目前 `useSync.ts` 中的同步流程分為 Pull, Merge, Push 三個子任務。寫入任務 `syncToDriveDirect` 內部雖然有 `try...catch`，但它只是記錄錯誤而沒有將異常狀態傳回給呼叫者。這導致 UI 層面無法感知真正的同步結果。

## Goals / Non-Goals

**Goals:**
- 確保所有網路請求失敗時皆能拋出異常。
- 確保 `fullSync` 能攔截到寫入階段的錯誤。
- 修正 UI 誤報「同步完成」的問題。
- 改進並發控制，確保最後一次狀態變更最終會被同步。

**Non-Goals:**
- 不引入第三方資料庫同步庫（如 PouchDB）。
- 不處理多檔案並行同步（維持單一 CSV 策略）。

## Decisions

### 1. 錯誤重拋 (Error Propagation)
- **決策**：在 `syncToDriveDirect` 和 `pullRecordsFromDrive` 中，移除吞掉錯誤的 `catch` 區塊，或是改用 `throw err` 重新拋出。同時增加 `if (!response.ok)` 判斷。
- **理由**：非同步函式應當讓呼叫者知道其成敗，以便呼叫者決定 UI 顯示（如 Toast 或狀態指標）。

### 2. 並發排隊機制
- **決策**：引入一個 `pendingSync: boolean` 或簡單的「防抖延時」。
- **推薦方案**：在 `fullSync` 中使用 `debounce` 封裝，或在 `syncToDriveDirect` 開始前檢查並紀錄是否有新的變動需求。考量到現狀，先實作「如果正在同步，則標記為需要再次同步」的邏輯。

### 3. HTTP 狀態碼檢驗
- **決策**：在每一個 `fetch` 呼叫後立即執行 `if (!res.ok) throw new Error(...)`。
- **理由**：Google API 若回傳 401, 403, 404 等狀態，`fetch` 本身不會報錯（除非網路斷線），必須手動檢查。

## Risks / Trade-offs

- **[Risk] 過多失敗提示**：如果網路極差，使用者可能會頻繁看到「同步失敗 ❌」。
    - 🛡️ **Mitigation**: 針對背景靜默同步，即使失敗也不顯示 Toast，僅更新右上角的視覺狀態圖示（例如變紅或顯示驚嘆號）。
- **[Trade-off] 代碼複雜度**：增加錯誤處理會讓 Hook 的行數增加。
    - 🛡️ **Mitigation**: 透過良好的註釋與模組化維持可讀性。
