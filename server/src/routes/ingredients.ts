import { Router, Request, Response } from 'express'
import { supabase } from '../db'
import { generateId, today } from '../utils'

const router = Router()

const mapRow = (r: Record<string, any>) => ({
  Id: r.id,
  Name: r.name,
  InStock: r.in_stock as boolean,
  FoodGroup: r.food_group ?? null,
  PortionDescription: r.portion_description ?? null,
  PortionUnit: r.portion_unit ?? null,
  EquivalentServings: r.equivalent_servings ?? null,
  CreateDate: r.create_date,
})

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
  const { Name, InStock, FoodGroup, PortionDescription, PortionUnit, EquivalentServings } = req.body

  if (!Name || typeof Name !== 'string' || Name.trim() === '') {
    res.status(400).json({ error: 'Name is required' })
    return
  }

  const id = generateId('I')
  const createDate = today()

  const { data, error } = await supabase
    .from('ingredients')
    .insert({
      id,
      name: Name.trim(),
      in_stock: !!InStock,
      food_group: FoodGroup ?? null,
      portion_description: PortionDescription ?? null,
      portion_unit: PortionUnit ?? null,
      equivalent_servings: EquivalentServings ?? null,
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
  const { Name, InStock, FoodGroup, PortionDescription, PortionUnit, EquivalentServings } = req.body

  if (!Name || typeof Name !== 'string' || Name.trim() === '') {
    res.status(400).json({ error: 'Name is required' })
    return
  }

  const { data, error } = await supabase
    .from('ingredients')
    .update({
      name: Name.trim(),
      in_stock: !!InStock,
      food_group: FoodGroup ?? null,
      portion_description: PortionDescription ?? null,
      portion_unit: PortionUnit ?? null,
      equivalent_servings: EquivalentServings ?? null,
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
