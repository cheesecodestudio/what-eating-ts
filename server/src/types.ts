// Shared types mirroring the frontend types + extended fields

export interface IngredientRow {
  id: string
  name: string
  in_stock: number
  food_group: string | null
  portion_description: string | null
  portion_unit: string | null
  equivalent_servings: number | null
  create_date: string
}

export interface PlateRow {
  id: string
  name: string
  type: string
  create_date: string
}

export interface PlateIngredientRow {
  id: string
  plate_id: string
  ingredient_id: string
  quantity: number
  unit: string
}

export interface PlateIngredientJoined extends PlateIngredientRow {
  ingredient_name: string
  ingredient_in_stock: number
}
