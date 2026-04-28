-- Seed ingredientes (PostgreSQL)
BEGIN;

TRUNCATE TABLE dish_ingredients, dishes, ingredients RESTART IDENTITY CASCADE;

INSERT INTO ingredients (id, name, in_stock, food_group, unit_of_measure, portion, create_date) VALUES
  ('I0001', 'Carne molida', FALSE, 'Protein', 'Grams', NULL, CURRENT_DATE::text),
  ('I0002', 'Masa tortilla', FALSE, 'Grain', 'Cup', NULL, CURRENT_DATE::text),
  ('I0003', 'Ensalada', FALSE, 'Vegetable', 'Cup', NULL, CURRENT_DATE::text),
  ('I0004', 'Queso semiduro', FALSE, 'Protein', 'Grams', NULL, CURRENT_DATE::text),
  ('I0005', 'Huevo', FALSE, 'Protein', 'Unit', NULL, CURRENT_DATE::text),
  ('I0006', 'Espaguetti', FALSE, 'Grain', 'Cup', NULL, CURRENT_DATE::text),
  ('I0007', 'Salsa de hongos', FALSE, '', 'Cup', NULL, CURRENT_DATE::text),
  ('I0008', 'Pollo', FALSE, 'Protein', 'Grams', NULL, CURRENT_DATE::text),
  ('I0009', 'Verduras cocidas', FALSE, 'Vegetable', 'Cup', NULL, CURRENT_DATE::text),
  ('I0010', 'Margarina', FALSE, 'Fat', 'Unit', NULL, CURRENT_DATE::text),
  ('I0011', 'Salsa de tomate natural', FALSE, 'Vegetable', 'Cup', NULL, CURRENT_DATE::text),
  ('I0012', 'Cebolla y chile dulce', FALSE, 'Vegetable', 'Cup', NULL, CURRENT_DATE::text),
  ('I0013', 'Caracolitos cocidos', FALSE, 'Grain', 'Cup', NULL, CURRENT_DATE::text),
  ('I0014', 'Huevo duro', FALSE, 'Protein', 'Unit', NULL, CURRENT_DATE::text),
  ('I0015', 'Atun', FALSE, 'Protein', 'Grams', NULL, CURRENT_DATE::text),
  ('I0016', 'Aderezo light', FALSE, 'Fat', 'Unit', NULL, CURRENT_DATE::text),
  ('I0017', 'Platano', FALSE, 'Grain', 'Unit', NULL, CURRENT_DATE::text),
  ('I0018', 'Verduras fritas', FALSE, 'Vegetable', 'Cup', NULL, CURRENT_DATE::text),
  ('I0019', 'Aceite', FALSE, 'Fat', 'Unit', NULL, CURRENT_DATE::text),
  ('I0020', 'Cebollino y perejil', FALSE, 'Vegetable', 'Cup', NULL, CURRENT_DATE::text),
  ('I0021', 'Jamon', FALSE, 'Protein', 'Unit', NULL, CURRENT_DATE::text),
  ('I0022', 'Tomate, Rabano, pepino', FALSE, 'Vegetable', 'Cup', NULL, CURRENT_DATE::text),
  ('I0023', 'Arroz', FALSE, 'Grain', 'Cup', NULL, CURRENT_DATE::text),
  ('I0024', 'Frijoles blancos', FALSE, 'Grain', 'Cup', NULL, CURRENT_DATE::text),
  ('I0025', 'Costilla de cerdo', FALSE, 'Protein', 'Grams', NULL, CURRENT_DATE::text),
  ('I0026', 'Pico de gallo', FALSE, 'Vegetable', 'Cup', NULL, CURRENT_DATE::text),
  ('I0027', 'Zanahoria cocida', FALSE, 'Vegetable', 'Cup', NULL, CURRENT_DATE::text),
  ('I0028', 'Salchicha', FALSE, 'Fat', 'Unit', NULL, CURRENT_DATE::text),
  ('I0029', 'Papa cocida', FALSE, 'Grain', 'Cup', NULL, CURRENT_DATE::text),
  ('I0030', 'Tortilla de harina', FALSE, 'Grain', 'Unit', NULL, CURRENT_DATE::text),
  ('I0031', 'Carne desmechada', FALSE, 'Protein', 'Grams', NULL, CURRENT_DATE::text),
  ('I0032', 'Frutas', FALSE, 'Fruit', 'Cup', NULL, CURRENT_DATE::text),
  ('I0033', 'Avena', FALSE, 'Grain', 'Cup', NULL, CURRENT_DATE::text),
  ('I0034', 'Leche', FALSE, 'Dairy', 'Cup', NULL, CURRENT_DATE::text),
  ('I0035', 'Yogurt griego', FALSE, 'Dairy', 'Cup', NULL, CURRENT_DATE::text),
  ('I0036', 'Soda', FALSE, 'Grain', 'Unit', NULL, CURRENT_DATE::text),
  ('I0037', 'Pure de papa', FALSE, 'Grain', 'Cup', NULL, CURRENT_DATE::text),
  ('I0038', 'Margarina light', FALSE, 'Fat', 'Unit', NULL, CURRENT_DATE::text),
  ('I0039', 'Tortilla horneada', FALSE, 'Grain', 'Unit', NULL, CURRENT_DATE::text),
  ('I0040', 'Frijoles molidos', FALSE, 'Grain', 'Cup', NULL, CURRENT_DATE::text),
  ('I0041', 'Pan rallado', FALSE, 'Grain', 'Cup', NULL, CURRENT_DATE::text),
  ('I0042', 'Papas casera', FALSE, 'Grain', 'Cup', NULL, CURRENT_DATE::text),
  ('I0043', 'Zanahoria casera', FALSE, 'Vegetable', 'Cup', NULL, CURRENT_DATE::text),
  ('I0044', 'Queso mozzarella', FALSE, 'Protein', 'Unit', NULL, CURRENT_DATE::text),
  ('I0045', 'Tortillas tostadas', FALSE, 'Grain', 'Unit', NULL, CURRENT_DATE::text),
  ('I0046', 'Sopa de tortilla', FALSE, 'Vegetable', 'Cup', NULL, CURRENT_DATE::text),
  ('I0047', 'Repollo', FALSE, 'Vegetable', 'Cup', NULL, CURRENT_DATE::text),
  ('I0048', 'Tomate', FALSE, 'Vegetable', 'Cup', NULL, CURRENT_DATE::text),
  ('I0049', 'Zanahoria y vainica', FALSE, 'Vegetable', 'Cup', NULL, CURRENT_DATE::text),
  ('I0050', 'Tocineta', FALSE, 'Fat', 'Grams', NULL, CURRENT_DATE::text),
  ('I0051', 'Cebollino', FALSE, 'Vegetable', 'Cup', NULL, CURRENT_DATE::text),
  ('I0052', 'Aderezo', FALSE, 'Fat', 'Unit', NULL, CURRENT_DATE::text),
  ('I0053', 'Cereal azucarado', FALSE, 'Grain', 'Cup', NULL, CURRENT_DATE::text),
  ('I0054', 'Pinto', FALSE, 'Grain', 'Cup', NULL, CURRENT_DATE::text),
  ('I0055', 'Baguette', FALSE, 'Grain', 'Unit', NULL, CURRENT_DATE::text),
  ('I0056', 'Lechuga', FALSE, 'Vegetable', 'Cup', NULL, CURRENT_DATE::text),
  ('I0057', 'Banano', FALSE, 'Fruit', 'Unit', NULL, CURRENT_DATE::text),
  ('I0058', 'Mantequilla de mani', FALSE, 'Fat', 'Unit', NULL, CURRENT_DATE::text),
  ('I0059', 'Tomate cocido', FALSE, 'Vegetable', 'Cup', NULL, CURRENT_DATE::text),
  ('I0060', 'Granola', FALSE, 'Grain', 'Cup', NULL, CURRENT_DATE::text),
  ('I0061', 'Pan blanco', FALSE, 'Grain', 'Unit', NULL, CURRENT_DATE::text),
  ('I0062', 'Espinaca', FALSE, 'Vegetable', 'Cup', NULL, CURRENT_DATE::text),
  ('I0063', 'Yogurt regular', FALSE, 'Dairy', 'Cup', NULL, CURRENT_DATE::text);

-- Keep multi-group column aligned for all seeded ingredients.
UPDATE ingredients
SET food_groups = ARRAY[food_group]::TEXT[]
WHERE food_group IS NOT NULL
  AND (food_groups IS NULL OR cardinality(food_groups) = 0);

-- Salchicha counts as both Protein and Fat.
UPDATE ingredients
SET food_group = 'Protein',
    food_groups = ARRAY['Protein', 'Fat']::text[]
WHERE name = 'Salchicha';

COMMIT;
