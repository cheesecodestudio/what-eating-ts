import { Router, Request, Response } from 'express'
import { supabase } from '../db'
import { generateId, today } from '../utils'

type DishInfo = {
  Id: string
  Name: string
  Type: string
  CanMake: boolean
}

type DailyMealView = {
  Id: string
  MealName: string
  SortOrder: number
  EntryId: string | null
  DishId: string | null
  DishName: string | null
  DishType: string | null
  CanMake: boolean
}

type DishIngredientJoinedRow = {
  ingredients: { in_stock: boolean }[] | null
}

type DishNestedRow = {
  id: string
  name: string
  type: string
  dish_ingredients: DishIngredientJoinedRow[] | null
}

type DailyMenuEntryRow = {
  id: string
  dish_id: string | null
  dishes: DishNestedRow | DishNestedRow[] | null
}

type DailyMenuMealRow = {
  id: string
  meal_name: string
  sort_order: number
  daily_menu_entries: DailyMenuEntryRow[] | null
}

const router = Router()

const normalizeMeal = (value: string) => value.trim().toLowerCase()

const mealKindFromName = (mealName: string): 'breakfast' | 'lunch' | 'dinner' | null => {
  const normalized = normalizeMeal(mealName)
  if (normalized.includes('breakfast') || normalized.includes('desayuno')) return 'breakfast'
  if (normalized.includes('lunch') || normalized.includes('almuerzo')) return 'lunch'
  if (normalized.includes('dinner') || normalized.includes('cena')) return 'dinner'
  return null
}

const buildPrincipalSignature = (meals: DailyMealView[]): string | null => {
  const slots: Record<'breakfast' | 'lunch' | 'dinner', string> = {
    breakfast: '-',
    lunch: '-',
    dinner: '-',
  }

  meals.forEach(meal => {
    const kind = mealKindFromName(meal.MealName)
    if (!kind) return
    if (!meal.DishId) return
    slots[kind] = meal.DishId
  })

  const hasAny = Object.values(slots).some(v => v !== '-')
  if (!hasAny) return null
  return `${slots.breakfast}|${slots.lunch}|${slots.dinner}`
}

const buildDishNames = (meals: DailyMealView[]): string[] => {
  const names = meals
    .map(meal => meal.DishName)
    .filter((name): name is string => typeof name === 'string' && name.trim() !== '')

  return [...new Set(names)]
}

const computeCanMake = (dish: DishNestedRow | null): boolean => {
  if (!dish) return false
  const dishIngredients = Array.isArray(dish.dish_ingredients) ? dish.dish_ingredients : []
  return dishIngredients.length > 0 && dishIngredients.every(di => {
    const ingredientRows = Array.isArray(di.ingredients) ? di.ingredients : []
    return ingredientRows.length > 0 && ingredientRows.every(ing => ing.in_stock === true)
  })
}

const mapDish = (dish: DishNestedRow | null): DishInfo | null => {
  if (!dish) return null
  return {
    Id: dish.id,
    Name: dish.name,
    Type: dish.type,
    CanMake: computeCanMake(dish),
  }
}

const mapMealRow = (meal: DailyMenuMealRow): DailyMealView => {
  const entries = Array.isArray(meal.daily_menu_entries) ? meal.daily_menu_entries : []
  const entry = entries[0] ?? null
  const rawDish = Array.isArray(entry?.dishes) ? (entry?.dishes[0] ?? null) : (entry?.dishes ?? null)
  const dish = rawDish ? mapDish(rawDish) : null

  return {
    Id: meal.id,
    MealName: meal.meal_name,
    SortOrder: meal.sort_order,
    EntryId: entry?.id ?? null,
    DishId: entry?.dish_id ?? null,
    DishName: dish?.Name ?? null,
    DishType: dish?.Type ?? null,
    CanMake: dish?.CanMake ?? false,
  }
}

const fetchMealsByDailyMenuId = async (dailyMenuId: string): Promise<DailyMealView[]> => {
  const { data, error } = await supabase
    .from('daily_menu_meals')
    .select('id, meal_name, sort_order, daily_menu_entries(id, dish_id, dishes(id, name, type, dish_ingredients(ingredients(in_stock))))')
    .eq('daily_menu_id', dailyMenuId)
    .order('sort_order', { ascending: true })
    .order('meal_name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map(mapMealRow)
}

const ensureDailyMenuExists = async (id: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('daily_menus')
    .select('id')
    .eq('id', id)
    .limit(1)

  if (error) {
    throw new Error(error.message)
  }

  return Array.isArray(data) && data.length > 0
}

const ensureMealBelongsToDailyMenu = async (dailyMenuId: string, mealId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('daily_menu_meals')
    .select('id')
    .eq('id', mealId)
    .eq('daily_menu_id', dailyMenuId)
    .limit(1)

  if (error) {
    throw new Error(error.message)
  }

  return Array.isArray(data) && data.length > 0
}

const buildDailyMenuDetail = async (id: string) => {
  const { data, error } = await supabase
    .from('daily_menus')
    .select('id, name, create_date')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }

  const meals = await fetchMealsByDailyMenuId(id)

  return {
    Id: data.id,
    Name: data.name,
    CreateDate: data.create_date,
    PrincipalSignature: buildPrincipalSignature(meals),
    DishNames: buildDishNames(meals),
    Meals: meals,
  }
}

// GET /api/daily-menus
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('daily_menus')
      .select('id, name, create_date')
      .order('create_date', { ascending: false })

    if (error) {
      res.status(500).json({ error: error.message })
      return
    }

    const menuIds = (data ?? []).map(row => row.id)

    let mealsByMenu: Record<string, DailyMealView[]> = {}

    if (menuIds.length > 0) {
      const { data: mealsRows, error: mealsError } = await supabase
        .from('daily_menu_meals')
        .select('id, daily_menu_id, meal_name, sort_order, daily_menu_entries(id, dish_id, dishes(id, name, type, dish_ingredients(ingredients(in_stock))))')
        .in('daily_menu_id', menuIds)
        .order('sort_order', { ascending: true })

      if (mealsError) {
        res.status(500).json({ error: mealsError.message })
        return
      }

      mealsByMenu = (mealsRows ?? []).reduce<Record<string, DailyMealView[]>>((acc, meal) => {
        const menuId = meal.daily_menu_id as string
        if (!acc[menuId]) acc[menuId] = []
        acc[menuId].push(mapMealRow(meal))
        return acc
      }, {})
    }

    const summaries = (data ?? []).map(row => {
      const meals = mealsByMenu[row.id] ?? []
      return {
        Id: row.id,
        Name: row.name,
        CreateDate: row.create_date,
        PrincipalSignature: buildPrincipalSignature(meals),
        DishNames: buildDishNames(meals),
      }
    })

    res.json(summaries)
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

// POST /api/daily-menus
router.post('/', async (_req: Request, res: Response) => {
  try {
    const id = generateId('DM')
    const createDate = today()

    const { error } = await supabase
      .from('daily_menus')
      .insert({
        id,
        name: 'Daily menu',
        create_date: createDate,
      })

    if (error) {
      res.status(500).json({ error: error.message })
      return
    }

    const detail = await buildDailyMenuDetail(id)
    res.status(201).json(detail)
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

// GET /api/daily-menus/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const detail = await buildDailyMenuDetail(id)

    if (!detail) {
      res.status(404).json({ error: 'Daily menu not found' })
      return
    }

    res.json(detail)
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

// PUT /api/daily-menus/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const { Name } = req.body

    if (!Name || typeof Name !== 'string' || Name.trim() === '') {
      res.status(400).json({ error: 'Name is required' })
      return
    }

    const { data, error } = await supabase
      .from('daily_menus')
      .update({ name: Name.trim() })
      .eq('id', id)
      .select('id')

    if (error) {
      res.status(500).json({ error: error.message })
      return
    }

    if (!data || data.length === 0) {
      res.status(404).json({ error: 'Daily menu not found' })
      return
    }

    const detail = await buildDailyMenuDetail(id)
    res.json(detail)
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

// DELETE /api/daily-menus/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string

    const { data, error } = await supabase
      .from('daily_menus')
      .delete()
      .eq('id', id)
      .select('id')

    if (error) {
      res.status(500).json({ error: error.message })
      return
    }

    if (!data || data.length === 0) {
      res.status(404).json({ error: 'Daily menu not found' })
      return
    }

    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

// POST /api/daily-menus/:id/meals
router.post('/:id/meals', async (req: Request, res: Response) => {
  try {
    const dailyMenuId = req.params.id as string
    const { MealName, SortOrder } = req.body

    if (!MealName || typeof MealName !== 'string' || MealName.trim() === '') {
      res.status(400).json({ error: 'MealName is required' })
      return
    }

    const exists = await ensureDailyMenuExists(dailyMenuId)
    if (!exists) {
      res.status(404).json({ error: 'Daily menu not found' })
      return
    }

    const id = generateId('DMM')
    const sortOrder = typeof SortOrder === 'number' ? SortOrder : 0

    const { error } = await supabase
      .from('daily_menu_meals')
      .insert({
        id,
        daily_menu_id: dailyMenuId,
        meal_name: MealName.trim(),
        sort_order: sortOrder,
      })

    if (error) {
      res.status(500).json({ error: error.message })
      return
    }

    const detail = await buildDailyMenuDetail(dailyMenuId)
    res.status(201).json(detail)
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

// PUT /api/daily-menus/:id/meals/:mealId
router.put('/:id/meals/:mealId', async (req: Request, res: Response) => {
  try {
    const dailyMenuId = req.params.id as string
    const mealId = req.params.mealId as string
    const { MealName, SortOrder } = req.body

    const belongs = await ensureMealBelongsToDailyMenu(dailyMenuId, mealId)
    if (!belongs) {
      res.status(404).json({ error: 'Meal not found for this daily menu' })
      return
    }

    const payload: Record<string, unknown> = {}

    if (MealName !== undefined) {
      if (typeof MealName !== 'string' || MealName.trim() === '') {
        res.status(400).json({ error: 'MealName must be a non-empty string' })
        return
      }
      payload.meal_name = MealName.trim()
    }

    if (SortOrder !== undefined) {
      if (typeof SortOrder !== 'number' || !Number.isFinite(SortOrder)) {
        res.status(400).json({ error: 'SortOrder must be a valid number' })
        return
      }
      payload.sort_order = SortOrder
    }

    if (Object.keys(payload).length === 0) {
      res.status(400).json({ error: 'At least one field is required (MealName or SortOrder)' })
      return
    }

    const { error } = await supabase
      .from('daily_menu_meals')
      .update(payload)
      .eq('id', mealId)
      .eq('daily_menu_id', dailyMenuId)

    if (error) {
      res.status(500).json({ error: error.message })
      return
    }

    const detail = await buildDailyMenuDetail(dailyMenuId)
    res.json(detail)
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

// DELETE /api/daily-menus/:id/meals/:mealId
router.delete('/:id/meals/:mealId', async (req: Request, res: Response) => {
  try {
    const dailyMenuId = req.params.id as string
    const mealId = req.params.mealId as string

    const belongs = await ensureMealBelongsToDailyMenu(dailyMenuId, mealId)
    if (!belongs) {
      res.status(404).json({ error: 'Meal not found for this daily menu' })
      return
    }

    const { error: deleteEntriesError } = await supabase
      .from('daily_menu_entries')
      .delete()
      .eq('daily_menu_meal_id', mealId)

    if (deleteEntriesError) {
      res.status(500).json({ error: deleteEntriesError.message })
      return
    }

    const { error: deleteMealError } = await supabase
      .from('daily_menu_meals')
      .delete()
      .eq('id', mealId)
      .eq('daily_menu_id', dailyMenuId)

    if (deleteMealError) {
      res.status(500).json({ error: deleteMealError.message })
      return
    }

    const detail = await buildDailyMenuDetail(dailyMenuId)
    res.json(detail)
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

// PUT /api/daily-menus/:id/meals/:mealId/dish
router.put('/:id/meals/:mealId/dish', async (req: Request, res: Response) => {
  try {
    const dailyMenuId = req.params.id as string
    const mealId = req.params.mealId as string
    const { DishId } = req.body as { DishId?: string | null }

    const belongs = await ensureMealBelongsToDailyMenu(dailyMenuId, mealId)
    if (!belongs) {
      res.status(404).json({ error: 'Meal not found for this daily menu' })
      return
    }

    if (DishId !== null && DishId !== undefined) {
      if (typeof DishId !== 'string' || DishId.trim() === '') {
        res.status(400).json({ error: 'DishId must be a non-empty string or null' })
        return
      }

      const { data: dishData, error: dishError } = await supabase
        .from('dishes')
        .select('id')
        .eq('id', DishId)
        .limit(1)

      if (dishError) {
        res.status(500).json({ error: dishError.message })
        return
      }

      if (!dishData || dishData.length === 0) {
        res.status(404).json({ error: 'Dish not found' })
        return
      }
    }

    const { error: clearError } = await supabase
      .from('daily_menu_entries')
      .delete()
      .eq('daily_menu_meal_id', mealId)

    if (clearError) {
      res.status(500).json({ error: clearError.message })
      return
    }

    if (DishId) {
      const { error: insertError } = await supabase
        .from('daily_menu_entries')
        .insert({
          id: generateId('DME'),
          daily_menu_meal_id: mealId,
          dish_id: DishId,
        })

      if (insertError) {
        res.status(500).json({ error: insertError.message })
        return
      }
    }

    const detail = await buildDailyMenuDetail(dailyMenuId)
    res.json(detail)
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

export default router
