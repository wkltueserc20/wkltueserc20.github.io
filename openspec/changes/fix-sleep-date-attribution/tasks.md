## 1. 修復核心邏輯 (Core Fix)

- [x] 1.1 在 `src/App.tsx` 的 `handleFinishSleep` 中補上 `endTimestamp` 欄位。
- [x] 1.2 核對 `handleSaveRecord` 確保結構一致（已確認一致）。

## 2. 健壯性優化 (Robustness)

- [x] 2.1 (可選) 強化 `src/utils/dateUtils.ts` 的 `getRecordTargetTs` 防呆邏輯。

## 3. 驗證與發佈 (Verification)

- [x] 3.1 模擬跨夜紀錄並確認其顯示在醒來當日（已驗證邏輯正確）。
- [x] 3.2 部署發佈。
