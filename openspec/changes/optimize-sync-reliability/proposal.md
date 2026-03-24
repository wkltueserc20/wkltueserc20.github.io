## Why

當前同步機制存在嚴重的競爭風險 (Race Condition)，可能導致在同步期間產生的本地新紀錄被舊的雲端資料覆蓋。此外，目前的「全量推送到今日檔」邏輯導致雲端資料冗餘且日誌分組失去意義。本次變更旨在建立一個精準、安全且高效的多人同步架構。

## What Changes

- **精準日期推送 (Selective Date-based Push)**：依據紀錄實際日期寫入對應的 CSV，而非全部塞入今日檔案。
- **變動偵測拉取 (Smart Pull)**：GAS 端新增偵測最近修改檔案的功能，App 僅同步有變動的日期。
- **原子化合併 (Atomic Merge)**：修正同步流程，在合併前重新讀取本地最新狀態，並使用 `bulkPut` 取代 `clear` 以防止資料遺失。
- **軟刪除一致性**：移除具誤導性的硬刪除函式，全面改用狀態標記。

## Capabilities

### New Capabilities
- `smart-sync-protocol`: 實作基於變動偵測與日期分群的智慧同步協議，確保多人協作下的一致性與效率。

### Modified Capabilities
<!-- No requirement changes to existing documented specs, as they were undocumented. -->

## Impact

- `src/hooks/useSync.ts`: 核心同步邏輯重構。
- `src/hooks/useRecords.ts`: 資料庫更新 API 安全性強化。
- `openspec/GAS_SCRIPT.gs`: 新增 `listRecent` 動作與強化 `push`/`pull` 邏輯。
- `src/utils/mergeUtils.ts`: 確保 LWW 策略在精準推送下的正確性。
