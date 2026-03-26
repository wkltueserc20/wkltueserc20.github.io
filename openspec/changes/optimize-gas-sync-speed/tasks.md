## 1. GAS 端：新增 smartSync action

- [x] 1.1 在 `GAS_SCRIPT.gs` 的 `doPost` switch 中新增 `smartSync` case，呼叫 `handleSmartSync(contents.fingerprints, contents.push)`
- [x] 1.2 實作 `handleSmartSync(fingerprints, pushReqs)` 函式：開頭呼叫 `getAccessToken()` 和 `getTargetFolderId()` 各一次，將 token/folderId 傳遞給所有子操作
- [x] 1.3 在 `handleSmartSync` 中整合 listRecent 邏輯（查詢最近修改的 CSV 檔案列表）

## 2. GAS 端：並行化 Drive API 呼叫

- [x] 2.1 重構 metadata 查詢：將多個 `getFileMetadata` 改為 `UrlFetchApp.fetchAll()` 一次並行查詢所有檔案的 metadata
- [x] 2.2 重構檔案下載：將 MD5 不符的檔案用 `fetchAll()` 並行下載內容
- [x] 2.3 重構 push 邏輯：不再呼叫 `handlePush()`，改為 inline 實作——先用 `fetchAll()` 並行搜尋既有檔案，再用 `fetchAll()` 並行上傳
- [x] 2.4 加入 fetchAll 錯誤處理：逐一檢查每個 response 的 status code，失敗的檔案回報 `{status: "error"}`，不影響其他檔案

## 3. Client 端：合併為單一請求

- [x] 3.1 在 `useSync.ts` 中新增 `callSmartSync(pushData)` 函式，發送 `action: "smartSync"` 並帶上 fingerprints map 和 push 資料
- [x] 3.2 重構 `fullSync`：移除 `callGasProxy('listRecent')` 呼叫，改為呼叫 `callSmartSync`，從回傳結果中取得 files 和 pull results
- [x] 3.3 更新 fingerprint 快取邏輯：從 smartSync response 的 results 中更新 MD5 快取

## 4. Client 端：Dirty date tracking

- [x] 4.1 新增 `dirtyDates` state（`Set<string>`），初始化從 localStorage `baby-sync-dirty-dates` 讀取
- [x] 4.2 匯出 `markDateDirty(dateStr)` 函式供 record 操作（新增/修改/刪除）時呼叫
- [x] 4.3 在 `fullSync` 中，push 資料改為根據 dirtyDates 產生（取代固定 today+yesterday）
- [x] 4.4 同步成功後清空 dirtyDates 並更新 localStorage；失敗時保留

## 5. 整合測試與部署

- [x] 5.1 本地測試：確認 Client 只發出一次 HTTP 請求完成同步
- [ ] 5.2 測試補登舊日期紀錄後，dirty date 正確推送
- [ ] 5.3 測試 GAS fetchAll 部分失敗時的 partial success 行為
- [x] 5.4 部署新版 GAS Web App 並更新版本號
