// Shared types mirroring the frontend types + extended fields

export interface IngredientRow {
  id: string
  name: string
  in_stock: boolean
  food_group: string | null
  unit_of_measure: string | null
  portion: number | null
  create_date: string
}

export interface DishRow {
  id: string
  name: string
  type: string
  create_date: string
}

export interface DishIngredientRow {
  id: string
  dish_id: string
  ingredient_id: string
  servings: number
}

export interface DishIngredientJoined extends DishIngredientRow {
  ingredient_name: string
  ingredient_in_stock: boolean
}
