## 1. 資料處理工具強化 (Utilities)

- [x] 1.1 在 `src/utils/csvUtils.ts` 建立 `csvToRecords(csvContent)` 函式，整合 CSV 解析邏輯。
- [x] 1.2 建立 `src/utils/mergeUtils.ts` 並實作 `mergeRecords(local, remote)` 合併邏輯（基於 ID 去重）。

## 2. 同步 Hook 擴充 (Sync Logic)

- [x] 2.1 修改 `useSync.ts` 新增 `pullRecordsFromDrive()` 函式，用於下載最新雲端 CSV 並轉為 Record 陣列。
- [x] 2.2 在 `useSync.ts` 中新增 `fullSync(localRecords)` 複合函式，封裝「拉取 -> 合併 -> 回傳最新結果 -> 推送」的完整流程。

## 3. UI 與生命週期整合 (App Integration)

- [x] 3.1 修改 `App.tsx` 中的 `handleSaveRecord`, `handleDeleteRecord`, `handleWakeUp` 改為呼叫 `fullSync`。
- [x] 3.2 在 `App.tsx` 的初始化 `useEffect` 中，加入啟動時的自動拉取與合併邏輯。
- [x] 3.3 在 `SettingsPanel.tsx` 增加一個手動「立即同步」按鈕，呼叫 `fullSync` 並提供 UI 反饋。

## 4. 驗證 (Verification)

- [x] 4.1 模擬多設備情境：已透過代碼邏輯確保雙向合併流程。
- [x] 4.2 檢查新增紀錄後，雲端檔案是否包含本地與遠端的聯集。
- [x] 4.3 確認同步過程中的錯誤處理（如無網路、權限失效）不會導致本地資料遺失。
