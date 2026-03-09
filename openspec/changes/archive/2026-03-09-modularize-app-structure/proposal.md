## Why

目前的 `App.tsx` 已演變為包含 600 多行代碼的「萬能組件」，同時處理型別定義、數據同步、業務邏輯與多個 UI 區塊。這種高度耦合的結構導致後續功能開發（如：增加新紀錄類型）與維護變得日益困難且容易出錯。

## What Changes

- **模組化重構**：將 `App.tsx` 拆分為多個專門的組件與 Hooks。
- **型別與常數分離**：建立獨立的型別定義與全域常數檔案。
- **自定義 Hooks**：將 Google Drive 同步、LINE 通知與本地儲存邏輯封裝為獨立的 Hooks。
- **UI 組件化**：將表單、清單、設定與統計區塊拆分為獨立的 React 組件。
- **代碼清理**：提升代碼的可讀性，並縮減 `App.tsx` 的規模。
- **不變性保證**：本變更**不涉及**資料格式的修改，現有的 LocalStorage 與雲端備份資料將完全相容。

## Capabilities

### New Capabilities
- `modular-architecture`: 建立清晰的檔案結構（components, hooks, utils, types）。
- `sync-hooks`: 封裝與外部 API（Google Drive, LINE）互動的邏輯。

### Modified Capabilities
- `record-tracking`: 重構紀錄的新增、修改與刪除邏輯，使其更易於擴充。

## Impact

- `src/App.tsx`: 大規模精簡，僅保留路由與佈局。
- 新增多個檔案：包含 `types.ts`, `constants.ts`, 以及 `src/components/`, `src/hooks/`, `src/utils/` 目錄下的組件。
