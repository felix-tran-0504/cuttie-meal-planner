-- Run once against your Postgres DB (e.g. psql or GUI):
--   psql "$DATABASE_URL" -f migrations/add_eaten_at.sql

ALTER TABLE meals ADD COLUMN IF NOT EXISTS eaten_at TIMESTAMP WITH TIME ZONE;

UPDATE meals SET eaten_at = created_at WHERE eaten_at IS NULL;
