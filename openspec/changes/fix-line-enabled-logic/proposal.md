## Why

目前系統中的「啟用自動通知功能」開關僅影響 UI 表現，核心的 GAS 雲端排程邏輯 (`callGasApi`) 並未判斷該開關狀態。這導致使用者即使在設定中關閉了自動通知，在紀錄餵奶時依然會收到 LINE 通知，造成功能與預期不符。

## What Changes

- **核心邏輯防護**：修改 `src/hooks/useSync.ts` 中的 `callGasApi` 函式，新增 `lineEnabled` 的狀態判斷。
- **UI 觸發優化**：修改 `src/App.tsx` 中的 `handleSaveRecord`，在呼叫雲端排程前進行開關判斷，並僅在開啟時顯示相關提示。
- **預設值一致性**：確保新建立寶寶資訊時，`lineEnabled` 的預設行為符合邏輯。

## Capabilities

### Modified Capabilities
- `notification-system`: 修復開關邏輯，確保通知功能完全受控於使用者設定。

## Impact

- `src/hooks/useSync.ts`: `callGasApi` 邏輯變更。
- `src/App.tsx`: `handleSaveRecord` 呼叫端判斷。
