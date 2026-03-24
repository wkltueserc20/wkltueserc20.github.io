## 1. 雲端資料夾管理 (Remote Folder)

- [x] 1.1 修改 `openspec/GAS_SCRIPT.gs` 中的檔案讀寫邏輯，指定存放於「育兒助手備份」資料夾。
- [ ] 1.2 在設定頁面測試上傳，確認 Google Drive 是否成功建立資料夾並儲存 CSV。

## 2. 跨日同步優化 (Multi-day Sync)

- [x] 2.1 修改 `src/hooks/useSync.ts`，在 `fullSync` 觸發時自動生成昨日與今日日期。
- [x] 2.2 實作對兩份 CSV 的平行下載與本地資料庫合併 (LWW)。
- [x] 2.3 驗證：切換到第二天時，昨日的紀錄依然存在於列表中。

## 3. 睡眠動態監測 (Sleep UX)

- [x] 3.1 建立 `src/components/Layout/SleepBanner.tsx` 組件。
- [x] 3.2 在 `App.tsx` 的統計卡片下方插入該組件，並傳入 `sleepStartTime` 與 `now`。
- [x] 3.3 實作橫幅中的「起來了 ☀️」點擊處理邏輯（自動創建紀錄並重置狀態）。

## 4. 驗證與發佈 (Verification)

- [x] 4.1 手動模擬跨日同步，檢查兩天份資料的合併是否準確。
- [x] 4.2 測試在「正在睡覺」狀態下透過橫幅快速結束，並檢查紀錄時數。
- [x] 4.3 執行 `npm run build` 確認系統穩定。
