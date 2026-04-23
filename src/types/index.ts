import { DishType, FoodGroup, UnitOfMeasure } from "../enums/Enums"

type BaseInfo = {
	Id: string
	Name: string
	CreateDate: string
}

export type DishIngredient = {
	IngredientId: string
	Servings: number
}

export type Dish = BaseInfo & {
	Type: DishType
	CanMake: boolean
	Ingredients: DishIngredient[]
}

export type Ingredient = BaseInfo & {
	InStock: boolean
	FoodGroup?: FoodGroup | null
	UnitOfMeasure?: UnitOfMeasure | null
	Portion?: number | null
}
