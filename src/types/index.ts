import { PlateType, FoodGroup, PortionUnit } from "../enums/Enums"

type BaseInfo = {
	Id: string
	Name: string
	CreateDate: string
}

export type PlateIngredient = {
	IngredientId: string
	Quantity: number
	Unit: string
}

export type Plate = BaseInfo & {
	Type: PlateType
	CanMake: boolean
	Ingredients: PlateIngredient[]
}

export type Ingredient = BaseInfo & {
	InStock: boolean
	FoodGroup?: FoodGroup | null
	PortionDescription?: string | null
	PortionUnit?: PortionUnit | null
	EquivalentServings?: number | null
}
