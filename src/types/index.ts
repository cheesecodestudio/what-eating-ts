type BaseInfo = {
	Id: string
	Name: string
	CreateDate: string
}

export type Plate = BaseInfo & {
	Type: string
	CanMake: boolean
	Ingredients: Array<string>
}

export type Ingredient = BaseInfo & {
	InStock: boolean
}