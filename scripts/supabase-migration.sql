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

-- 4. Daily menus (template catalog)
CREATE TABLE IF NOT EXISTS daily_menus (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  create_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_menu_meals (
  id            TEXT PRIMARY KEY,
  daily_menu_id TEXT NOT NULL REFERENCES daily_menus(id) ON DELETE CASCADE,
  meal_name     TEXT NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS daily_menu_entries (
  id                 TEXT PRIMARY KEY,
  daily_menu_meal_id TEXT NOT NULL REFERENCES daily_menu_meals(id) ON DELETE CASCADE,
  dish_id            TEXT REFERENCES dishes(id) ON DELETE SET NULL
);

ALTER TABLE daily_menus DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_menu_meals DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_menu_entries DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_daily_menus_create_date ON daily_menus(create_date);
CREATE INDEX IF NOT EXISTS idx_daily_menu_meals_daily_menu_id ON daily_menu_meals(daily_menu_id);
CREATE INDEX IF NOT EXISTS idx_daily_menu_meals_sort_order ON daily_menu_meals(sort_order);
CREATE INDEX IF NOT EXISTS idx_daily_menu_entries_daily_menu_meal_id ON daily_menu_entries(daily_menu_meal_id);
CREATE INDEX IF NOT EXISTS idx_daily_menu_entries_dish_id ON daily_menu_entries(dish_id);

COMMIT;