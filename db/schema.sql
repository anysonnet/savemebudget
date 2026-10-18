-- Idempotent: safe to run on every start. Never drops or alters existing data.

CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL UNIQUE,            -- stored lower-cased
  password_hash text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash text PRIMARY KEY,                   -- sha256 of the cookie token
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);

CREATE TABLE IF NOT EXISTS expenses (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description    text NOT NULL CHECK (char_length(description) BETWEEN 1 AND 100),
  amount_satang  bigint NOT NULL CHECK (amount_satang > 0 AND amount_satang <= 100000000000),
  category       text NOT NULL,
  expense_date   date NOT NULL,                  -- calendar date in Asia/Bangkok
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS expenses_user_date_idx
  ON expenses (user_id, expense_date DESC, created_at DESC);
