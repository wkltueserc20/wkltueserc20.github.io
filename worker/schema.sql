CREATE TABLE IF NOT EXISTS records (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL,
  milk_type   TEXT,
  time        TEXT NOT NULL,
  timestamp   INTEGER NOT NULL,
  end_ts      INTEGER,
  amount      REAL,
  weight      REAL,
  height      REAL,
  note        TEXT DEFAULT '',
  updated_at  INTEGER NOT NULL,
  is_deleted  INTEGER DEFAULT 0,
  device_name TEXT DEFAULT '',
  sub_type    TEXT DEFAULT '',
  label       TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_records_updated_at ON records(updated_at);
CREATE INDEX IF NOT EXISTS idx_records_timestamp ON records(timestamp DESC);
