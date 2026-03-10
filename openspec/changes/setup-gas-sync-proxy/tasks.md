## 1. GAS 端升級 (GAS Setup)

- [x] 1.1 已提供 `Code.gs` 代碼（包含 OAuth 換票、Drive 代理與 LINE 通知）。
- [ ] 1.2 在 GAS 的指令碼屬性中填入 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SYNC_SECRET`。
- [ ] 1.3 重新部署 GAS 並獲取新的 Web App URL。

## 2. 同步 Hook 重構 (Hook Refactoring)

- [x] 2.1 已將 `handleGoogleLogin` 改為使用 `initCodeClient`。
- [x] 2.2 已實作 `auth` 換票動作，將 code 發送給 GAS。
- [x] 2.3 已重構 `pullRecordsFromDrive`，將請求轉向 GAS 的 `pull` 動作。
- [x] 2.4 已重構 `syncToDriveDirect`，將請求轉向 GAS 的 `push` 動作。

## 3. UI 與配置整合 (UI & Config)

- [x] 3.1 已在 `src/types.ts` 的 `BabyInfo` 中新增 `syncSecret` 欄位。
- [x] 3.2 已修改 `SettingsPanel.tsx`，加入 `syncSecret` 輸入框與長效授權按鈕。
- [x] 3.3 已調整「連結 Google 雲端」按鈕的顯示狀態。

## 4. 驗證與發佈 (Verification)

- [x] 4.1 確認 Google Cloud Console 的重新導向 URI 設定正確。
- [ ] 4.2 測試初次綁定流程：App 取得 code -> GAS 換取 refresh_token。
- [ ] 4.3 測試長效性：手動清除瀏覽器中的 access_token，確認 App 依然能透過 GAS 完成同步。
- [x] 4.4 執行 `npm run deploy` 發佈新架構（已建構通過）。
