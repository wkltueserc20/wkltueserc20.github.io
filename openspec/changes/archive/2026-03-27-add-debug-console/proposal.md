## Why

遷移到 Cloudflare D1 後，需要一個快速檢視資料庫內容的方式來確認同步是否正確寫入。目前只能透過 Cloudflare Dashboard 下 SQL，不夠方便。

## What Changes

- Worker 新增 `POST /api/query` endpoint，支援按日期、類型、軟刪除篩選
- 設定頁面版本號長按進入隱藏的 Debug Console
- Debug Console 提供預設篩選器查詢 D1 資料

## Impact

- `worker/src/index.ts` — 新增 `/api/query` route
- `src/components/Settings/SettingsPanel.tsx` — 版本號長按入口
- `src/components/Settings/DebugConsole.tsx` — 新元件
