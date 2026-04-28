---
name: supabase-migration
description: 'Apply schema migrations and seed data to the Supabase project. Use when modifying the database schema, adding tables or columns, running seed data, or verifying the live schema matches the codebase. Covers safety checklist, execution steps, and post-apply validation.'
argument-hint: 'migration | seed | verify'
---

# Supabase Migration

Applies and validates SQL changes against the project Supabase instance.

## When to Use
- Adding or modifying tables or columns
- Running seed data after a fresh setup or after `TRUNCATE`
- Verifying that the live schema is aligned with [scripts/supabase-migration.sql](../../../../scripts/supabase-migration.sql)
- Recovering from a schema drift between codebase and database

---

## Procedure

### 1. Pre-flight checklist
Before running anything, verify:
- [ ] Script is wrapped in `BEGIN; … COMMIT;`
- [ ] All DDL uses `IF NOT EXISTS` (CREATE TABLE, ADD COLUMN, CREATE INDEX)
- [ ] New tables have `DISABLE ROW LEVEL SECURITY`
- [ ] FK join tables use `ON DELETE CASCADE`
- [ ] If `food_group` is affected: backfill `food_groups` is included (see [sql.instructions.md](../../instructions/sql.instructions.md))
- [ ] Seed scripts start with `TRUNCATE TABLE dish_ingredients, dishes, ingredients RESTART IDENTITY CASCADE;`

### 2. Open Supabase SQL Editor
Navigate to: **Supabase Dashboard → Project → SQL Editor → New query**

Paste the full script content. Do **not** split across multiple queries — the `BEGIN/COMMIT` block must run as one unit.

### 3. Execute the script
Click **Run**. Confirm the result panel shows no errors.

### 4. Post-apply validation
Run the verification queries below to confirm the schema landed correctly:

```sql
-- Tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('ingredients', 'dishes', 'dish_ingredients');

-- Columns on ingredients
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'ingredients'
ORDER BY ordinal_position;

-- Indexes exist
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('ingredients', 'dishes', 'dish_ingredients');

-- RLS is disabled
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname IN ('ingredients', 'dishes', 'dish_ingredients');
-- relrowsecurity should be FALSE for all three
```

### 5. Seed data (optional)
If loading fresh seed data, run the scripts **in order**:
1. `scripts/seed-ingredients.sql` — truncates all three tables, then inserts ingredients
2. `scripts/seed-dishes.sql` — inserts dishes and dish_ingredients (no truncate)

Verify row counts:
```sql
SELECT 'ingredients' AS tbl, COUNT(*) FROM ingredients
UNION ALL
SELECT 'dishes',     COUNT(*) FROM dishes
UNION ALL
SELECT 'dish_ingredients', COUNT(*) FROM dish_ingredients;
```

---

## Reference Files
- Schema source of truth: [scripts/supabase-migration.sql](../../../../scripts/supabase-migration.sql)
- Seed — ingredients: [scripts/seed-ingredients.sql](../../../../scripts/seed-ingredients.sql)
- Seed — dishes: [scripts/seed-dishes.sql](../../../../scripts/seed-dishes.sql)
- SQL conventions: [.github/instructions/sql.instructions.md](../../instructions/sql.instructions.md)
