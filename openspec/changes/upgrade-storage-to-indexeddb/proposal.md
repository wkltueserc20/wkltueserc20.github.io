## Why

目前的資料儲存機制採用瀏覽器的 LocalStorage，其容量限制（約 5MB）與同步阻塞特性限制了應用程式的長期擴充性與效能。升級至 IndexedDB 不僅能解除容量限制，還能提升大規模資料下的操作流暢度。

## What Changes

- **引入 IndexedDB**：使用 `Dexie.js` 作為底層資料庫管理工具。
- **資料搬家機制**：實作自動化的資料遷移邏輯，確保舊有的 LocalStorage 紀錄安全地移入 IndexedDB。
- **儲存層重構**：修改 `src/hooks/useRecords.ts`，將原本的同步 `localStorage` 讀寫改為非同步的資料庫操作。
- **資料完整性驗證**：在遷移過程中加入核對機制，防止資料遺失。

## Capabilities

### New Capabilities
- `database-storage`: 使用非同步資料庫處理大規模育兒紀錄。
- `data-migration-tool`: 自動處理舊版儲存格式至新版儲存層的轉移。

### Modified Capabilities
- `record-tracking`: 提升紀錄的新增與查詢效能。

## Impact

- `src/hooks/useRecords.ts`: 儲存邏輯的大規模變更。
- `src/db/`: 新增資料庫定義目錄。
- `package.json`: 新增 `dexie` 依賴。
