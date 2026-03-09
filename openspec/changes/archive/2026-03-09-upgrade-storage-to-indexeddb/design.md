## Context

目前應用程式將所有 `records` 序列化為 JSON 並存放在一個 LocalStorage Key 中。這在資料量小時運作良好，但缺乏索引功能且容易觸及 5MB 上限。IndexedDB 是瀏覽器內建的物件導向資料庫，適合處理此類需求。

## Goals / Non-Goals

**Goals:**
- 將 `records` 儲存位置遷移至 IndexedDB。
- 實作無損資料遷移邏輯。
- 提升資料查詢與排序效能。
- 保持 `useRecords.ts` 的對外介面不變，最小化對 UI 組件的影響。

**Non-Goals:**
- 本次重構不涉及資料格式（Record 介面）的變更。
- 不會將 `babyInfo` 遷移至 IndexedDB（其資料量極小，維持在 LocalStorage 即可）。

## Decisions

### 1. 使用 Dexie.js 封裝庫
- **決策**：使用 `Dexie.js` 作為操作 IndexedDB 的工具。
- **理由**：IndexedDB 的原生 API 非常繁瑣且基於事件。Dexie 提供了簡潔的 Promise 型 API、強大的索引功能以及優秀的 TypeScript 支援。

### 2. 搬家邏輯 (Migration Strategy)
- **決策**：在 `useRecords` Hook 的 `useEffect` 中，檢查資料庫是否已有資料且 LocalStorage 是否非空。若符合條件，則執行一次性搬移。
- **流程**：
    1. 開啟 Dexie 資料庫。
    2. 檢查 `localStorage.getItem('baby-records-migrated')` 標記。
    3. 若未遷移：讀取舊資料 -> `db.records.bulkAdd()` -> 驗證數量 -> 設定遷移標記。

### 3. 異步狀態處理
- **決策**：由於 IndexedDB 是非同步的，`records` 狀態的初始化將從同步變為非同步。
- **理由**：我們需要在 UI 上處理「載入中」的短暫狀態，或確保 `records` 在未從資料庫讀取前為空陣列。

## Risks / Trade-offs

- **[Risk] 遷移中斷導致資料重複**：若搬家到一半斷電或重整，可能導致資料重複。
    - 🛡️ **Mitigation**: 使用 `bulkAdd` 搭配 `id` 作為主鍵，Dexie 會自動處理重複 ID 衝突（或使用交易事務）。
- **[Trade-off] 外部庫依賴**：新增了 `dexie` 作為依賴項。
    - 🛡️ **Mitigation**: Dexie 非常輕量（約 20KB），且能極大減少我們手動寫資料庫代碼的錯誤率。
