## Context

目前 `getRecordTargetTs` 依賴 `endTimestamp` 來判定歸屬日期。然而，`App.tsx` 中的 `handleFinishSleep` (由首頁橫幅觸發) 並沒有存入該欄位，導致睡眠紀錄在跨日時，統計數據會留在「入睡前的那一天」。

## Goals / Non-Goals

**Goals:**
- 將「起床時間」設為睡眠紀錄的歸屬日期。
- 修復 `handleFinishSleep` 的欄位缺失。

**Non-Goals:**
- 不改變餵奶或成長紀錄的歸屬邏輯（依然維持 `timestamp`）。

## Decisions

### 1. 補全 Record 欄位
- **決策**：在 `handleFinishSleep` 中加入 `endTimestamp: nowTs`。
- **理由**：與 `handleSaveRecord` (表單) 的結構保持一致，且滿足 `getRecordTargetTs` 的前置條件。

### 2. 歸屬函式確認
- **決策**：`getRecordTargetTs` 保持目前的邏輯，即睡眠紀錄優先使用 `endTimestamp`。
- **理由**：這能完美處理「橫跨午夜」的情境。

## Risks / Trade-offs

- **[Risk] 舊數據修正**：已存檔且缺失 `endTimestamp` 的舊睡眠紀錄，可能依然顯示在錯誤的日期。
    - 🛡️ **Mitigation**: 對於這類簡單 App，使用者可以手動刪除該紀錄並重新補登，或者在 `getRecordTargetTs` 中加入「如果類型為睡眠且沒有 `endTimestamp`，但有 `amount`，則補算結束時間」的防呆邏輯。
