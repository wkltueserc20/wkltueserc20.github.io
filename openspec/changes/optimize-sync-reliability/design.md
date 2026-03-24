## Context

當前 `fullSync` 流程在下載雲端 CSV 期間（約 1-3 秒）會遺失新產生的本地紀錄。同時，推送邏輯缺乏日期識別，導致雲端資料檔案不符。

## Goals / Non-Goals

**Goals:**
- **消除 Race Condition**：確保同步期間產生的新資料不被蓋掉。
- **精準分群推送**：CSV 檔名與內容日期必須一致。
- **動態變動偵測**：不再受限於拉取昨今兩天，而是拉取最近有變動的檔案。
- **API 安全性**：強化資料庫更新操作，避免危險的 `clear()`。

**Non-Goals:**
- 不改變現有 CSV 結構（保持欄位一致）。
- 不實作屬性級別的細粒度合併（維持整筆 LWW）。

## Decisions

### 1. 同步前的 Fresh Read 策略
- **決策**：在 `mergeRecords` 執行前，從 IndexedDB 重新獲取一次最新紀錄，而不是使用 `fullSync` 開始時的閉包變數。
- **理由**：這確保了同步下載期間產生的任何本地變更都能參與合併。

### 2. 資料庫操作：由 `clear+bulkAdd` 改為 `bulkPut`
- **決策**：在 `setAllRecords` 中移除 `db.records.clear()`。
- **理由**：`clear()` 會造成短暫的資料真空期，若此時使用者操作會報錯且資料易遺失。`bulkPut` 會依據 `id` 更新現有資料，並保留其他本地新資料。

### 3. GAS 端偵測 `listRecent` 檔案
- **決策**：在 GAS `doPost` 中新增 `listRecent` 動作，使用 `folder.getFiles()` 並過濾出 `mimeType: 'text/csv'`，依 `lastUpdated` 排序回傳前 5 個檔名。
- **理由**：解決「修改舊資料同步不到」的根本問題，比固定拉取昨今兩天更具擴展性。

### 4. 按日期分群推送 (Grouped Push)
- **決策**：App 推送前，依據 `timestamp` 將資料分組。
- **理由**：
    - 將 R(3/20) 寫入 `baby_records_20260320.csv`。
    - 將 R(3/24) 寫入 `baby_records_20260324.csv`。
    - 解決雲端資料冗餘與管理混亂。

## Risks / Trade-offs

- **[Risk] 推送請求次數增加**：如果一次修改跨多日，會發出多次 POST 給 GAS。
    - 🛡️ **Mitigation**: 通常一次操作只會動到 1-2 天的資料（如補登昨天紀錄）。
- **[Trade-off] 實作複雜度提升**：同步邏輯由「一次性 Pull/Push」變為「分組處理」。
    - 🛡️ **Mitigation**: 封裝 `syncSingleDate` 函式，並使用 `Promise.all` 處理，保持結構清晰。
