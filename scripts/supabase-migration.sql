-- ============================================================
-- what-eating-ts — Final PostgreSQL schema (current app state)
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

BEGIN;

-- 1. Ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  in_stock        BOOLEAN NOT NULL DEFAULT FALSE,
  food_group      TEXT,
  food_groups     TEXT[],
  unit_of_measure TEXT,
  portion         REAL,
  create_date     TEXT NOT NULL
);

-- Keep existing databases aligned with the latest ingredients shape.
ALTER TABLE ingredients
  ADD COLUMN IF NOT EXISTS food_groups TEXT[];

-- 2. Dishes table
CREATE TABLE IF NOT EXISTS dishes (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL,
  create_date TEXT NOT NULL
);

-- 3. Dish-ingredients join table
CREATE TABLE IF NOT EXISTS dish_ingredients (
  id            TEXT PRIMARY KEY,
  dish_id       TEXT NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  servings      NUMERIC NOT NULL DEFAULT 1
);

-- Disable RLS because API uses service role key
ALTER TABLE ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE dishes DISABLE ROW LEVEL SECURITY;
ALTER TABLE dish_ingredients DISABLE ROW LEVEL SECURITY;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_ingredients_name ON ingredients(name);
CREATE INDEX IF NOT EXISTS idx_dishes_name ON dishes(name);
CREATE INDEX IF NOT EXISTS idx_dish_ingredients_dish_id ON dish_ingredients(dish_id);
CREATE INDEX IF NOT EXISTS idx_dish_ingredients_ingredient_id ON dish_ingredients(ingredient_id);

-- Backfill food_groups from food_group when missing.
UPDATE ingredients
SET food_groups = ARRAY[food_group]::TEXT[]
WHERE food_group IS NOT NULL
  AND (food_groups IS NULL OR cardinality(food_groups) = 0);

-- Domain-specific correction: Salchicha counts as Protein and Fat.
UPDATE ingredients
SET food_group = 'Protein',
    food_groups = ARRAY['Protein', 'Fat']::TEXT[]
WHERE name = 'Salchicha';

COMMIT;
