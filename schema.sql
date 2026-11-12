/* BrightYard D1 schema. Apply with: */
/* npx wrangler d1 execute brightyard --remote --file=schema.sql */
CREATE TABLE IF NOT EXISTS leads (
  id          TEXT PRIMARY KEY,
  kind        TEXT NOT NULL,            /* pack | review | contact | other form kinds */
  email       TEXT NOT NULL,
  name        TEXT, company TEXT, role TEXT, timing TEXT,
  message     TEXT,                     /* contact form fields */
  brief       TEXT,                     /* the blueprint brief, as typed */
  start_date  TEXT, plan_title TEXT, weeks TEXT,
  page        TEXT,
  parent_id   TEXT,                     /* a review points at its pack */
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS leads_created ON leads (created_at);
CREATE INDEX IF NOT EXISTS leads_email ON leads (email);

/* daily counts only: no cookies, IPs or visitor ids */
CREATE TABLE IF NOT EXISTS events (
  day  TEXT NOT NULL,
  name TEXT NOT NULL,
  n    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, name)
);

/* hourly rate limit buckets keyed by a salted hash that changes every hour */
CREATE TABLE IF NOT EXISTS rate (
  k   TEXT NOT NULL,
  win INTEGER NOT NULL,
  n   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (k, win)
);
