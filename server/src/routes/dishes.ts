import { Router, Request, Response } from 'express'
import { supabase } from '../db'
import { generateId, today } from '../utils'

const router = Router()

const DISH_SELECT = '*, dish_ingredients(id, ingredient_id, servings, ingredients(in_stock))'

const fetchDishById = (id: string) =>
  supabase.from('dishes').select(DISH_SELECT).eq('id', id).single()

const mapDish = (dish: Record<string, any>) => {
  const dis: any[] = dish.dish_ingredients ?? []
  const canMake = dis.length > 0 ? dis.every(di => di.ingredients?.in_stock === true) : false
  return {
    Id: dish.id,
    Name: dish.name,
    Type: dish.type,
    CreateDate: dish.create_date,
    CanMake: canMake,
    Ingredients: dis.map(di => ({
      IngredientId: di.ingredient_id,
      Servings: di.servings,
    })),
  }
}

// GET /api/dishes
router.get('/', async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('dishes')
    .select(DISH_SELECT)
    .order('create_date', { ascending: false })

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json((data ?? []).map(mapDish))
})

// POST /api/dishes
router.post('/', async (req: Request, res: Response) => {
  const { Name, Type, Ingredients } = req.body

  if (!Name || typeof Name !== 'string' || Name.trim() === '') {
    res.status(400).json({ error: 'Name is required' })
    return
  }
  if (!Type || typeof Type !== 'string') {
    res.status(400).json({ error: 'Type is required' })
    return
  }

  const id = generateId('D')
  const createDate = today()

  const { error: dishError } = await supabase
    .from('dishes')
    .insert({ id, name: Name.trim(), type: Type, create_date: createDate })

  if (dishError) {
    res.status(500).json({ error: dishError.message })
    return
  }

  if (Array.isArray(Ingredients) && Ingredients.length > 0) {
    const ingredientIds = Ingredients.map((di: any) => di.IngredientId)
    const { data: existingIngredients } = await supabase
      .from('ingredients')
      .select('id')
      .in('id', ingredientIds)

    const validIds = new Set((existingIngredients ?? []).map((i: any) => i.id))
    const diRows = Ingredients
      .filter((di: any) => validIds.has(di.IngredientId))
      .map((di: any) => ({
        id: generateId('DI'),
        dish_id: id,
        ingredient_id: di.IngredientId,
        servings: di.Servings ?? 1,
      }))

    if (diRows.length > 0) {
      const { error: diError } = await supabase.from('dish_ingredients').insert(diRows)
      if (diError) {
        res.status(500).json({ error: diError.message })
        return
      }
    }
  }

  const { data, error } = await fetchDishById(id)
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.status(201).json(mapDish(data))
})

// PUT /api/dishes/:id
router.put('/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string
  const { Name, Type, Ingredients } = req.body

  if (!Name || typeof Name !== 'string' || Name.trim() === '') {
    res.status(400).json({ error: 'Name is required' })
    return
  }
  if (!Type || typeof Type !== 'string') {
    res.status(400).json({ error: 'Type is required' })
    return
  }

  const { data: updateData, error: updateError } = await supabase
    .from('dishes')
    .update({ name: Name.trim(), type: Type })
    .eq('id', id)
    .select('id')

  if (updateError) {
    res.status(500).json({ error: updateError.message })
    return
  }
  if (!updateData || updateData.length === 0) {
    res.status(404).json({ error: 'Dish not found' })
    return
  }

  await supabase.from('dish_ingredients').delete().eq('dish_id', id)

  if (Array.isArray(Ingredients) && Ingredients.length > 0) {
    const ingredientIds = Ingredients.map((di: any) => di.IngredientId)
    const { data: existingIngredients } = await supabase
      .from('ingredients')
      .select('id')
      .in('id', ingredientIds)

    const validIds = new Set((existingIngredients ?? []).map((i: any) => i.id))
    const diRows = Ingredients
      .filter((di: any) => validIds.has(di.IngredientId))
      .map((di: any) => ({
        id: generateId('DI'),
        dish_id: id,
        ingredient_id: di.IngredientId,
        servings: di.Servings ?? 1,
      }))

    if (diRows.length > 0) {
      const { error: diError } = await supabase.from('dish_ingredients').insert(diRows)
      if (diError) {
        res.status(500).json({ error: diError.message })
        return
      }
    }
  }

  const { data, error } = await fetchDishById(id)
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json(mapDish(data))
})

// DELETE /api/dishes/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string

  const { data, error } = await supabase
    .from('dishes')
    .delete()
    .eq('id', id)
    .select('id')

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  if (!data || data.length === 0) {
    res.status(404).json({ error: 'Dish not found' })
    return
  }
  res.status(204).send()
})

export default router
