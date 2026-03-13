## Context

目前同步僅處理當日 CSV。為了支援「昨日」資料預載，我們需要將 `useSync` 的請求範圍擴充。

## Goals / Non-Goals

**Goals:**
- 在 Google Drive 自動建立「育兒助手備份」資料夾並存放 CSV。
- App 開啟時同時抓取昨今兩日的 CSV 並合併。
- 首頁顯示「正在睡覺」狀態，並提供快速結束按鈕。

**Non-Goals:**
- 不追蹤超過 48 小時前的歷史資料檔案。
- 不提供手動選取資料夾功能（直接寫死在「育兒助手備份」）。

## Decisions

### 1. 同步範疇擴充 (Yesterday Sync)
- **決策**：在 `useSync` 的 `fullSync` 邏輯中，將傳入的 `dateStr` 擴展為數組 `[yesterday, today]`。
- **理由**：育兒紀錄的連貫性強烈依賴前一天晚上的最後幾次紀錄。預載昨日資料能解決 90% 的跨日焦慮。

### 2. GAS 腳本調整 (Folder Logic)
- **邏輯**：
    ```javascript
    var folderName = "育兒助手備份";
    var folders = DriveApp.getFoldersByName(folderName);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
    // 後續儲存皆使用 folder.createFile() / folder.getFilesByName()
    ```
- **理由**：完全自動化，使用者無需手動輸入 ID，符合「簡單即高品質」原則。

### 3. 首頁睡眠橫幅 (Live Banner Component)
- **樣式**：使用 `Framer Motion` 顯示。
- **邏輯**：如果 `sleepStartTime` 不為空，則計算 `now - sleepStartTime`。
- **行為**：點擊按鈕後調用 `App.tsx` 中的睡眠完成邏輯，將紀錄推入資料庫並清空 `sleepStartTime`。

## Risks / Trade-offs

- **[Risk] 同步延遲**：同時抓取兩份檔案會增加一倍的網路請求時間。
    - 🛡️ **Mitigation**: 採用 Promise.all 併行請求，通常 1-2 秒內可完成。
- **[Risk] 重複資料夾**：如果有同名資料夾，DriveApp.getFoldersByName 可能會抓到舊的。
    - 🛡️ **Mitigation**: 在腳本中優先抓取最早建立的同名資料夾，或在第一次執行時記錄下 Folder ID。
