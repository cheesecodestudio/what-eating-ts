-- ============================================================
-- what-eating-ts — Supabase schema migration
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
  id                  TEXT PRIMARY KEY,
  name                TEXT NOT NULL,
  in_stock            BOOLEAN NOT NULL DEFAULT FALSE,
  food_group          TEXT,
  portion_description TEXT,
  portion_unit        TEXT,
  equivalent_servings NUMERIC,
  create_date         TEXT NOT NULL
);

-- 2. Plates table
CREATE TABLE IF NOT EXISTS plates (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL,
  create_date TEXT NOT NULL
);

-- 3. Plate-ingredients join table (with cascade deletes)
CREATE TABLE IF NOT EXISTS plate_ingredients (
  id            TEXT PRIMARY KEY,
  plate_id      TEXT NOT NULL REFERENCES plates(id) ON DELETE CASCADE,
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity      NUMERIC NOT NULL DEFAULT 1,
  unit          TEXT NOT NULL DEFAULT 'unit'
);

-- Disable RLS — access is only through the Express server using the service role key
ALTER TABLE ingredients     DISABLE ROW LEVEL SECURITY;
ALTER TABLE plates          DISABLE ROW LEVEL SECURITY;
ALTER TABLE plate_ingredients DISABLE ROW LEVEL SECURITY;
