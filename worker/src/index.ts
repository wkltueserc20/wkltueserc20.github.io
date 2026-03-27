export interface Env {
  DB: D1Database;
  SYNC_SECRET: string;
}

interface SyncRequest {
  syncSecret: string;
  lastSyncAt: number;
  changes: ClientRecord[];
}

interface ClientRecord {
  id: string;
  type: string;
  milkType?: string | null;
  time: string;
  timestamp: number;
  endTimestamp?: number | null;
  amount?: number | null;
  weight?: number | null;
  height?: number | null;
  note?: string;
  updatedAt: number;
  isDeleted?: boolean;
  deviceName?: string;
  subType?: string;
  label?: string;
}

interface DbRow {
  id: string;
  type: string;
  milk_type: string | null;
  time: string;
  timestamp: number;
  end_ts: number | null;
  amount: number | null;
  weight: number | null;
  height: number | null;
  note: string;
  updated_at: number;
  is_deleted: number;
  device_name: string;
  sub_type: string;
  label: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function rowToClient(row: DbRow): ClientRecord {
  return {
    id: row.id,
    type: row.type,
    milkType: row.milk_type,
    time: row.time,
    timestamp: row.timestamp,
    endTimestamp: row.end_ts,
    amount: row.amount,
    weight: row.weight,
    height: row.height,
    note: row.note || '',
    updatedAt: row.updated_at,
    isDeleted: row.is_deleted === 1,
    deviceName: row.device_name || undefined,
    subType: row.sub_type || undefined,
    label: row.label || undefined,
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (url.pathname === '/api/health' && request.method === 'GET') {
      return jsonResponse({ ok: true, time: Date.now() });
    }

    if (url.pathname === '/api/sync' && request.method === 'POST') {
      return handleSync(request, env);
    }

    if (url.pathname === '/api/query' && request.method === 'POST') {
      return handleQuery(request, env);
    }

    return jsonResponse({ error: 'Not found' }, 404);
  },
};

async function handleQuery(request: Request, env: Env): Promise<Response> {
  let body: { syncSecret: string; date?: string; type?: string; includeDeleted?: boolean; limit?: number };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  if (!body.syncSecret || body.syncSecret !== env.SYNC_SECRET) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const limit = Math.min(body.limit ?? 50, 200);
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (!body.includeDeleted) {
    conditions.push('is_deleted = 0');
  }

  if (body.type) {
    conditions.push(`type = ?${paramIdx}`);
    params.push(body.type);
    paramIdx++;
  }

  if (body.date) {
    // date format: "2026-03-27" → compute start/end timestamps
    const start = new Date(body.date + 'T00:00:00+08:00').getTime();
    const end = start + 86400000;
    conditions.push(`timestamp >= ?${paramIdx} AND timestamp < ?${paramIdx + 1}`);
    params.push(start, end);
    paramIdx += 2;
  }

  const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
  const sql = `SELECT * FROM records ${where} ORDER BY timestamp DESC LIMIT ?${paramIdx}`;
  params.push(limit);

  const { results } = await env.DB.prepare(sql).bind(...params).all<DbRow>();

  // Get total count
  const countSql = `SELECT COUNT(*) as total FROM records ${where}`;
  const countParams = params.slice(0, -1); // exclude limit
  const countResult = await env.DB.prepare(countSql).bind(...countParams).all<{ total: number }>();
  const total = countResult.results?.[0]?.total ?? 0;

  return jsonResponse({
    ok: true,
    records: (results ?? []).map(rowToClient),
    total,
    limit,
  });
}

async function handleSync(request: Request, env: Env): Promise<Response> {
  let body: SyncRequest;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  // Auth
  if (!body.syncSecret || body.syncSecret !== env.SYNC_SECRET) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const lastSyncAt = body.lastSyncAt ?? 0;
  const changes = body.changes ?? [];

  // Upsert changes with LWW
  if (changes.length > 0) {
    const batchSize = 50;
    for (let i = 0; i < changes.length; i += batchSize) {
      const batch = changes.slice(i, i + batchSize);
      const stmts = batch.map((r) => {
        return env.DB.prepare(
          `INSERT INTO records (id, type, milk_type, time, timestamp, end_ts, amount, weight, height, note, updated_at, is_deleted, device_name, sub_type, label)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)
           ON CONFLICT(id) DO UPDATE SET
             type = CASE WHEN ?11 > records.updated_at THEN ?2 ELSE records.type END,
             milk_type = CASE WHEN ?11 > records.updated_at THEN ?3 ELSE records.milk_type END,
             time = CASE WHEN ?11 > records.updated_at THEN ?4 ELSE records.time END,
             timestamp = CASE WHEN ?11 > records.updated_at THEN ?5 ELSE records.timestamp END,
             end_ts = CASE WHEN ?11 > records.updated_at THEN ?6 ELSE records.end_ts END,
             amount = CASE WHEN ?11 > records.updated_at THEN ?7 ELSE records.amount END,
             weight = CASE WHEN ?11 > records.updated_at THEN ?8 ELSE records.weight END,
             height = CASE WHEN ?11 > records.updated_at THEN ?9 ELSE records.height END,
             note = CASE WHEN ?11 > records.updated_at THEN ?10 ELSE records.note END,
             updated_at = CASE WHEN ?11 > records.updated_at THEN ?11 ELSE records.updated_at END,
             is_deleted = CASE WHEN ?11 > records.updated_at THEN ?12 ELSE records.is_deleted END,
             device_name = CASE WHEN ?11 > records.updated_at THEN ?13 ELSE records.device_name END,
             sub_type = CASE WHEN ?11 > records.updated_at THEN ?14 ELSE records.sub_type END,
             label = CASE WHEN ?11 > records.updated_at THEN ?15 ELSE records.label END`
        ).bind(
          r.id,
          r.type,
          r.milkType ?? null,
          r.time,
          r.timestamp,
          r.endTimestamp ?? null,
          r.amount ?? null,
          r.weight ?? null,
          r.height ?? null,
          r.note ?? '',
          r.updatedAt,
          r.isDeleted ? 1 : 0,
          r.deviceName ?? '',
          r.subType ?? '',
          r.label ?? '',
        );
      });
      await env.DB.batch(stmts);
    }
  }

  // Pull: records updated after lastSyncAt
  const { results } = await env.DB.prepare(
    'SELECT * FROM records WHERE updated_at > ?1 ORDER BY updated_at ASC'
  ).bind(lastSyncAt).all<DbRow>();

  const syncedAt = Date.now();

  return jsonResponse({
    ok: true,
    records: (results ?? []).map(rowToClient),
    syncedAt,
  });
}
