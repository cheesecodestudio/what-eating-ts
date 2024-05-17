import { PlateType } from "../enums/Enums"

type BaseInfo = {
	Id: string
	Name: string
	CreateDate: string
}

export type Plate = BaseInfo & {
	Type: PlateType
	CanMake: boolean
	Ingredients: Array<string>
}

export type Ingredient = BaseInfo & {
	InStock: boolean
}