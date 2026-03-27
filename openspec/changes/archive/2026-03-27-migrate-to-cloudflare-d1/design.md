## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      Client (PWA)                        │
│                                                          │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │  Dexie   │◀──▶│  useSync.ts  │───▶│  Settings UI  │  │
│  │ IndexedDB │    │  (重寫)      │    │  (簡化)       │  │
│  └──────────┘    └──────┬───────┘    └───────────────┘  │
│                         │                                │
└─────────────────────────┼────────────────────────────────┘
                          │ POST /api/sync
                          │ { syncSecret, lastSyncAt, changes[] }
                          ▼
┌──────────────────────────────────────────────────────────┐
│                  Cloudflare Worker                        │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │  Auth 驗證   │───▶│  Sync 邏輯   │                   │
│  │  syncSecret  │    │  UPSERT+SEL  │                   │
│  └──────────────┘    └──────┬───────┘                   │
│                             │                            │
│                       ┌─────▼──────┐                    │
│                       │     D1     │                    │
│                       │  (SQLite)  │                    │
│                       └────────────┘                    │
└──────────────────────────────────────────────────────────┘
```

## D1 Schema

```sql
CREATE TABLE records (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL,          -- 'feeding' | 'sleep' | 'growth'
  milk_type   TEXT,                   -- 'formula' | 'breast' | NULL
  time        TEXT NOT NULL,          -- 顯示用時間字串
  timestamp   INTEGER NOT NULL,       -- 開始時間 (ms since epoch)
  end_ts      INTEGER,               -- 結束時間 (ms, nullable)
  amount      REAL,                   -- ml / 分鐘 / NULL
  weight      REAL,                   -- kg (growth only)
  height      REAL,                   -- cm (growth only)
  note        TEXT DEFAULT '',        -- 備註
  updated_at  INTEGER NOT NULL,       -- 最後修改時間 (ms) — LWW 依據
  is_deleted  INTEGER DEFAULT 0       -- 0=存在, 1=軟刪除
);

CREATE INDEX idx_records_updated_at ON records(updated_at);
CREATE INDEX idx_records_timestamp ON records(timestamp DESC);
```

## Sync Protocol

### Request

```
POST /api/sync
Content-Type: application/json

{
  "syncSecret": "user-shared-secret",
  "lastSyncAt": 1711500000000,
  "changes": [
    {
      "id": "550e8400-...",
      "type": "feeding",
      "milkType": "formula",
      "time": "2026-03-27 14:30:00",
      "timestamp": 1711500000000,
      "endTimestamp": null,
      "amount": 150,
      "weight": null,
      "height": null,
      "note": "",
      "updatedAt": 1711500060000,
      "isDeleted": false
    }
  ]
}
```

### Response

```json
{
  "ok": true,
  "records": [
    { "id": "...", "type": "feeding", ... }
  ],
  "syncedAt": 1711500070000
}
```

### Server Logic (Pseudo-code)

```
function handleSync(request):
  1. 驗證 syncSecret
  2. 對每個 change:
     - 查詢 D1 中該 id 的 updated_at
     - 如果 change.updatedAt > existing.updated_at → UPSERT
     - 如果 change.updatedAt <= existing.updated_at → 跳過（server 版本較新）
  3. SELECT * FROM records WHERE updated_at > lastSyncAt
  4. 回傳 { records, syncedAt: now() }
```

### LWW Conflict Resolution

```
衝突場景：兩台手機同時編輯同一筆紀錄

手機 A: { id: "123", amount: 150, updatedAt: T1 }  ──push──▶ D1
手機 B: { id: "123", amount: 180, updatedAt: T2 }  ──push──▶ D1

若 T2 > T1 → D1 存 amount=180
手機 A 下次 sync → 拉回 amount=180（T2 較新，A 接受）

結果：兩台手機最終一致，以最後修改者為準
```

## Field Name Mapping

Client 用 camelCase，D1 用 snake_case：

```
Client (JS)        D1 (SQL)
───────────        ────────
id                 id
type               type
milkType           milk_type
time               time
timestamp          timestamp
endTimestamp       end_ts
amount             amount
weight             weight
height             height
note               note
updatedAt          updated_at
isDeleted          is_deleted
```

Worker 內做 camelCase ↔ snake_case 轉換。

## Client-Side Changes

### useSync.ts (重寫)

```
新的 state:
  - syncUrl: string (from BabyInfo)
  - syncSecret: string (from BabyInfo)
  - lastSyncAt: number (存 localStorage)
  - isSyncing: boolean
  - syncError: string | null

新的 fullSync():
  1. 從 IndexedDB 讀取 updated_at > lastSyncAt 的紀錄
  2. POST /api/sync { syncSecret, lastSyncAt, changes }
  3. 收到 response.records → mergeRecords(local, remote)
  4. 寫入 IndexedDB
  5. 更新 lastSyncAt = response.syncedAt
```

### BabyInfo type (修改)

```
移除:
  - lineToken, lineUserId, lineEnabled
  - gasUrl, googleClientId, googleFolderId

新增:
  - syncUrl: string  (Cloudflare Worker URL)

保留:
  - name, birthday, avatar
  - syncSecret
```

### App.tsx (簡化)

```
移除:
  - LINE 通知觸發 (callGasApi, cancelGasSchedule, sendLineAction)
  - Google OAuth script 載入
  - 深夜判斷邏輯 (isLateNight)

保留:
  - visibility change → silent sync
  - network online → silent sync
  - record CRUD → fullSync
```

## Cloudflare Setup

### wrangler.toml

```toml
name = "baby-tracker-sync"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "baby-tracker"
database_id = "<建立後填入>"
```

### 環境變數

```
SYNC_SECRET = "user-defined-secret"  (透過 wrangler secret 設定)
```

## Security

- HTTPS only（Cloudflare 預設）
- syncSecret 驗證每個請求
- CORS 設定只允許 `https://wkltueserc20.github.io`
- D1 不對外暴露，只有 Worker 可存取
- 無敏感資料（育兒紀錄，非金融/醫療）

## Migration Path

1. 部署 Worker + D1（空資料庫）
2. 前端加入新的 sync 邏輯（保留舊的作為 fallback）
3. 使用者在設定中輸入新的 sync URL
4. 首次 sync 時 lastSyncAt=0 → 全量推送本地紀錄到 D1
5. 確認正常後，移除舊的 GAS 程式碼
