## 1. 核心邏輯修正 (Hook)

- [x] 1.1 修改 `src/hooks/useSync.ts` 中的 `callGasApi`，加入 `lineEnabled` 檢查。

## 2. 呼叫端優化 (App)

- [x] 2.1 修改 `App.tsx` 中的 `handleSaveRecord`，在觸發 `callGasApi` 與顯示同步提示前，先檢查 `lineEnabled`。

## 3. 驗證與部署 (Verification)

- [x] 3.1 驗證關閉開關後，新增餵奶紀錄不再發送通知，且不顯示「正在同步...」提示。
- [x] 3.2 驗證在開關關閉時，手動點擊「測試 GAS」按鈕依然能發送測試訊息。
- [x] 3.3 執行 `npm run deploy` 發佈修復版本。
