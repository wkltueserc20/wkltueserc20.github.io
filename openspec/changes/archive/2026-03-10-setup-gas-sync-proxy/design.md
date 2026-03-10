## Context

目前 App 使用的是 Implicit Flow，這在行動裝置與 PWA 環境下非常不穩定。我們需要遷移至 Server-Side Flow (即便沒有傳統伺服器，利用 GAS 亦可達成)，利用 `refresh_token` 來維持長效授權。

## Goals / Non-Goals

**Goals:**
- 將 OAuth 授權邏輯遷移至 Authorization Code Flow。
- 讓 GAS 持有並自動維護 `refresh_token`。
- 使 App 端的資料讀取與寫入對 Google Drive API 透明（透過 GAS 代理）。
- 達成 iOS PWA 環境下「一次登入，長期有效」的目標。

**Non-Goals:**
- 不改變 CSV 檔案的內容格式。
- 不實作多帳號切換。

## Decisions

### 1. 授權代碼交換 (Auth Exchange)
- **決策**：App 呼叫 `google.accounts.oauth2.initCodeClient` 取得 code，並發送 `action: 'auth'` 請求給 GAS。
- **理由**：這是拿到 `refresh_token` 的標準做法。GAS 作為後端可以安全地執行換票動作。

### 2. GAS 作為資料代理人 (Proxy)
- **決策**：App 不再直接呼叫 `https://www.googleapis.com/...`，而是改為呼叫 GAS Web App 網址。
- **Payload 結構**：
    ```json
    { "action": "push", "csv": "...", "fileName": "..." }
    { "action": "pull", "fileName": "..." }
    ```
- **理由**：由 GAS 處理所有 CORS 問題與 Token 續約邏輯，App 端只需處理單純的 HTTP POST 請求。

### 3. 安全性：`SECRET_KEY`
- **決策**：在 GAS 中檢查一個預設的 `SYNC_SECRET` 常數，App 呼叫時需在 Headers 或 Body 帶上此金鑰。
- **理由**：防止 GAS 網址外流後，其他人可以直接存取使用者的 Google Drive 檔案。

## Risks / Trade-offs

- **[Risk] GAS 執行時間限制**：GAS 的單次執行上限為 6 分鐘。
    - 🛡️ **Mitigation**: 育兒紀錄的 CSV 體積非常小，解析與寫入通常在 1 秒內完成，遠低於上限。
- **[Trade-off] 效能延遲**：多了一層 GAS 中轉，API 反應速度會增加約 200-500ms。
    - 🛡️ **Mitigation**: 配合現有的「背景靜默同步」與「同步狀態指示器」，這點延遲對使用者幾乎無感。
