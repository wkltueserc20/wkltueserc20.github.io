## Why

目前系統的 Google Drive 同步僅為單向備份（覆蓋式），這限制了多個協作者（如父母雙方）在不同設備上同時使用的能力。引入雙向同步與智慧合併邏輯，可以讓多台設備共享最新的育兒紀錄，實現真正的多人協作。

## What Changes

- **雙向同步機制**：將原本的「僅推播 (Push-only)」升級為「拉取並合併 (Pull & Merge)」。
- **智慧合併演算法**：在 `utils` 中實作基於 `id` 與 `timestamp` 的紀錄合併邏輯，確保資料不重複且維持最新狀態。
- **自動化觸發**：
    - App 啟動時自動拉取雲端資料。
    - 每次新增/修改紀錄後，先合併再推播。
- **UI 強化**：在設定頁面或導覽列增加同步狀態提示。

## Capabilities

### New Capabilities
- `data-merging`: 實作多來源紀錄的去重與衝突解決邏輯。
- `remote-pull`: 實現從 Google Drive 下載並解析 CSV 的功能。

### Modified Capabilities
- `data-sync`: 將原本的 `syncToDriveDirect` 改造為包含 Pull 階段的完整同步流程。

## Impact

- `src/hooks/useSync.ts`: 核心邏輯變更。
- `src/utils/mergeUtils.ts`: 新增工具函式。
- `src/App.tsx`: 啟動時的初始化邏輯調整。
