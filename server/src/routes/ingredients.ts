import { Router, Request, Response } from 'express'
import { supabase } from '../db'
import { generateId, today } from '../utils'

const router = Router()

const normalizeFoodGroups = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) return null

  const normalized = [...new Set(value
    .filter((v): v is string => typeof v === 'string')
    .map(v => v.trim())
    .filter(v => v.length > 0))]

  return normalized.length > 0 ? normalized : null
}

const resolveFoodGroupPayload = (foodGroup: unknown, foodGroups: unknown) => {
  const primary = typeof foodGroup === 'string' && foodGroup.trim() !== '' ? foodGroup.trim() : null
  const groupsFromPayload = normalizeFoodGroups(foodGroups)

  if (groupsFromPayload && groupsFromPayload.length > 0) {
    return {
      food_group: primary ?? groupsFromPayload[0],
      food_groups: groupsFromPayload,
    }
  }

  if (primary) {
    return {
      food_group: primary,
      food_groups: [primary],
    }
  }

  return {
    food_group: null,
    food_groups: null,
  }
}

const mapRow = (r: Record<string, any>) => {
  const normalizedGroups = normalizeFoodGroups(r.food_groups)
  const foodGroups = normalizedGroups ?? (typeof r.food_group === 'string' && r.food_group.trim() !== '' ? [r.food_group] : null)

  return {
    Id: r.id,
    Name: r.name,
    InStock: r.in_stock as boolean,
    FoodGroup: r.food_group ?? (foodGroups ? foodGroups[0] : null),
    FoodGroups: foodGroups,
    UnitOfMeasure: r.unit_of_measure ?? null,
    Portion: r.portion ?? null,
    CreateDate: r.create_date,
  }
}

// GET /api/ingredients
router.get('/', async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .order('create_date', { ascending: false })

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json((data ?? []).map(mapRow))
})

// POST /api/ingredients
router.post('/', async (req: Request, res: Response) => {
  const { Name, InStock, FoodGroup, FoodGroups, UnitOfMeasure, Portion } = req.body

  if (!Name || typeof Name !== 'string' || Name.trim() === '') {
    res.status(400).json({ error: 'Name is required' })
    return
  }

  const id = generateId('I')
  const createDate = today()
  const { food_group, food_groups } = resolveFoodGroupPayload(FoodGroup, FoodGroups)

  const { data, error } = await supabase
    .from('ingredients')
    .insert({
      id,
      name: Name.trim(),
      in_stock: !!InStock,
      food_group,
      food_groups,
      unit_of_measure: UnitOfMeasure ?? null,
      portion: Portion ?? null,
      create_date: createDate,
    })
    .select()
    .single()

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.status(201).json(mapRow(data))
})

// PUT /api/ingredients/:id
router.put('/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string
  const { Name, InStock, FoodGroup, FoodGroups, UnitOfMeasure, Portion } = req.body

  if (!Name || typeof Name !== 'string' || Name.trim() === '') {
    res.status(400).json({ error: 'Name is required' })
    return
  }

  const { food_group, food_groups } = resolveFoodGroupPayload(FoodGroup, FoodGroups)

  const { data, error } = await supabase
    .from('ingredients')
    .update({
      name: Name.trim(),
      in_stock: !!InStock,
      food_group,
      food_groups,
      unit_of_measure: UnitOfMeasure ?? null,
      portion: Portion ?? null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      res.status(404).json({ error: 'Ingredient not found' })
    } else {
      res.status(500).json({ error: error.message })
    }
    return
  }
  res.json(mapRow(data))
})

// DELETE /api/ingredients/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string

  const { data, error } = await supabase
    .from('ingredients')
    .delete()
    .eq('id', id)
    .select('id')

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  if (!data || data.length === 0) {
    res.status(404).json({ error: 'Ingredient not found' })
    return
  }
  res.status(204).send()
})

export default router
