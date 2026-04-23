import { Router, Request, Response } from 'express'
import { supabase } from '../db'
import { generateId, today } from '../utils'

const router = Router()

const PLATE_SELECT = '*, plate_ingredients(id, ingredient_id, quantity, unit, ingredients(in_stock))'

// Fetch a single plate with its ingredients and their in_stock status
const fetchPlateById = (id: string) =>
  supabase.from('plates').select(PLATE_SELECT).eq('id', id).single()

// Map DB row to API response shape
const mapPlate = (plate: Record<string, any>) => {
  const pis: any[] = plate.plate_ingredients ?? []
  const canMake = pis.length > 0 ? pis.every(pi => pi.ingredients?.in_stock === true) : false
  return {
    Id: plate.id,
    Name: plate.name,
    Type: plate.type,
    CreateDate: plate.create_date,
    CanMake: canMake,
    Ingredients: pis.map(pi => ({
      IngredientId: pi.ingredient_id,
      Quantity: pi.quantity,
      Unit: pi.unit,
    })),
  }
}

// GET /api/plates
router.get('/', async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('plates')
    .select(PLATE_SELECT)
    .order('create_date', { ascending: false })

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json((data ?? []).map(mapPlate))
})

// POST /api/plates
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

  const id = generateId('P')
  const createDate = today()

  const { error: plateError } = await supabase
    .from('plates')
    .insert({ id, name: Name.trim(), type: Type, create_date: createDate })

  if (plateError) {
    res.status(500).json({ error: plateError.message })
    return
  }

  if (Array.isArray(Ingredients) && Ingredients.length > 0) {
    const ingredientIds = Ingredients.map((pi: any) => pi.IngredientId)
    const { data: existingIngredients } = await supabase
      .from('ingredients')
      .select('id')
      .in('id', ingredientIds)

    const validIds = new Set((existingIngredients ?? []).map((i: any) => i.id))
    const piRows = Ingredients
      .filter((pi: any) => validIds.has(pi.IngredientId))
      .map((pi: any) => ({
        id: generateId('PI'),
        plate_id: id,
        ingredient_id: pi.IngredientId,
        quantity: pi.Quantity ?? 1,
        unit: pi.Unit ?? 'unit',
      }))

    if (piRows.length > 0) {
      const { error: piError } = await supabase.from('plate_ingredients').insert(piRows)
      if (piError) {
        res.status(500).json({ error: piError.message })
        return
      }
    }
  }

  const { data, error } = await fetchPlateById(id)
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.status(201).json(mapPlate(data))
})

// PUT /api/plates/:id
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
    .from('plates')
    .update({ name: Name.trim(), type: Type })
    .eq('id', id)
    .select('id')

  if (updateError) {
    res.status(500).json({ error: updateError.message })
    return
  }
  if (!updateData || updateData.length === 0) {
    res.status(404).json({ error: 'Plate not found' })
    return
  }

  // Replace plate_ingredients
  await supabase.from('plate_ingredients').delete().eq('plate_id', id)

  if (Array.isArray(Ingredients) && Ingredients.length > 0) {
    const ingredientIds = Ingredients.map((pi: any) => pi.IngredientId)
    const { data: existingIngredients } = await supabase
      .from('ingredients')
      .select('id')
      .in('id', ingredientIds)

    const validIds = new Set((existingIngredients ?? []).map((i: any) => i.id))
    const piRows = Ingredients
      .filter((pi: any) => validIds.has(pi.IngredientId))
      .map((pi: any) => ({
        id: generateId('PI'),
        plate_id: id,
        ingredient_id: pi.IngredientId,
        quantity: pi.Quantity ?? 1,
        unit: pi.Unit ?? 'unit',
      }))

    if (piRows.length > 0) {
      const { error: piError } = await supabase.from('plate_ingredients').insert(piRows)
      if (piError) {
        res.status(500).json({ error: piError.message })
        return
      }
    }
  }

  const { data, error } = await fetchPlateById(id)
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json(mapPlate(data))
})

// DELETE /api/plates/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string

  const { data, error } = await supabase
    .from('plates')
    .delete()
    .eq('id', id)
    .select('id')

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  if (!data || data.length === 0) {
    res.status(404).json({ error: 'Plate not found' })
    return
  }
  res.status(204).send()
})

export default router
