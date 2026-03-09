## Why

在多設備協作的情境下，目前的「物理刪除」策略會導致刪除操作無法同步。當 A 設備刪除紀錄後，雲端依然存有該紀錄，其他設備（或 A 設備下次同步）時會將其視為新資料重新併入，導致紀錄「刪不掉」。引入「軟刪除 (Soft Delete)」機制，能讓刪除動作具備時間戳，確保其能正確在所有設備間傳播。

## What Changes

- **模型升級**：在 `Record` 介面新增 `isDeleted?: boolean` 屬性。
- **CSV 格式調整**：在 CSV 第 6 欄（原本的狀態欄位）重新啟用，用於儲存 `isDeleted` 狀態（例如：`true` 或空字串）。
- **刪除邏輯重構**：將 `handleDeleteRecord` 由「從陣列移除」改為「將屬性設為 `isDeleted: true` 並更新 `updatedAt`」。
- **智慧合併優化**：`mergeRecords` 現在會比對包含 `isDeleted` 狀態在內的最新版本。
- **UI 渲染過濾**：在 `RecordList` 與 `Stats` 計算中，自動排除標記為已刪除的紀錄。

## Capabilities

### New Capabilities
- `soft-deletion-tracking`: 支援對紀錄進行邏輯標記而非物理移除。

### Modified Capabilities
- `data-merging`: 升級合併演算法以處理「墓碑 (Tombstone)」紀錄。
- `data-sync`: 確保刪除標記能正確同步至雲端與其他設備。

## Impact

- `src/types.ts`: 定義變更。
- `src/utils/mergeUtils.ts`: 合併邏輯優化。
- `src/utils/csvUtils.ts`: 欄位解析邏輯。
- `src/App.tsx` & `RecordList.tsx`: 刪除行為與顯示過濾。
