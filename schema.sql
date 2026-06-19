-- Den — newsletter signups
-- Run this in the Neon SQL Editor (or any Postgres client).
--
-- After running, set DATABASE_URL in your .env.local:
--   DATABASE_URL=postgresql://user:pass@ep-xxxx.region.aws.neon.tech/dbname?sslmode=require

CREATE TABLE IF NOT EXISTS newsletter_signups (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  email       text        NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS newsletter_signups_created_at_idx
  ON newsletter_signups (created_at DESC);
