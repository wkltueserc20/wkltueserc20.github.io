## Context

目前同步流程 (v9.6) 在執行一次完整的雙向同步時，平均會產生：
1. `listRecent`: 1 請求
2. `pull` (變動檔案): 1-5 請求
3. `push` (日期分群): 1-3 請求
總計 3~9 次網路往返。在行動網路或 GAS 延遲較高時，使用者體驗不佳。

## Goals / Non-Goals

**Goals:**
- **通訊合併**：將所有 pull/push 任務合併為一個大的 JSON Payload。
- **指紋比對**：利用 MD5 Checksum 避免下載內容未變動的檔案。
- **極速響應**：將同步總時間控制在 2 秒內。

**Non-Goals:**
- 不改變現有的 CSV 資料格式。
- 不引入額外的伺服器（仍維持 GAS 作為唯一後端）。

## Decisions

### 1. GAS `batchSync` 介面協定
- **設計**：
    ```json
    // Request
    {
      "action": "batchSync",
      "pull": ["file1.csv", "file2.csv"], // 需要檢查 MD5 的檔案
      "push": [{"name": "file3.csv", "csv": "..."}] // 需要寫入的資料
    }
    // Response
    {
      "status": "success",
      "results": {
        "file1.csv": {"md5": "abc...", "csv": "...只有 MD5 不符時才回傳內容..."},
        "file2.csv": {"status": "unchanged"}
      }
    }
    ```
- **理由**：一對一的 REST 風格在 GAS 上效率極低，批量傳輸是 Google 官方建議的優化方式。

### 2. 本地指紋快取 (Fingerprint Cache)
- **設計**：在 LocalStorage 儲存 `baby-sync-md5: { "file1.csv": "abc..." }`。
- **運作**：每次同步後更新快取。下一次同步時將此快取傳給 GAS 進行比對。

### 3. GAS 端 MD5 獲取方式
- **決策**：使用 Drive API 的 `files.get` 並要求 `md5Checksum` 欄位。
- **理由**：這比 `file.getBlob().getDataAsString()` 再算 MD5 快得多，因為 Checksum 是 Google Drive 預計算好的。

## Risks / Trade-offs

- **[Risk] Payload 體積過大**：若一次推送多個大檔案，Base64 或 JSON 體積會增加。
    - 🛡️ **Mitigation**: 育兒紀錄 CSV 通常極小（< 50KB），單次同步負擔在安全範圍內。
- **[Trade-off] GAS 記憶體限制**：GAS 處理大型 JSON 字串有 10MB 左右的限制。
    - 🛡️ **Mitigation**: 對於純文字 CSV 來說，這足以容納數萬筆紀錄。
