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
	FoodGroups?: FoodGroup[] | null
	UnitOfMeasure?: UnitOfMeasure | null
	Portion?: number | null
}

export type DailyMenuSummary = BaseInfo & {
	PrincipalSignature: string | null
	DishNames: string[]
}

export type DailyMenuMeal = {
	Id: string
	MealName: string
	SortOrder: number
	EntryId: string | null
	DishId: string | null
	DishName: string | null
	DishType: DishType | null
	CanMake: boolean
}

export type DailyMenuDetail = DailyMenuSummary & {
	Meals: DailyMenuMeal[]
}
