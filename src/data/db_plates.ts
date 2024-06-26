import type { Plate } from "../types"
import { PlateType } from '../enums/Enums.ts'

export const platesDb: Plate[] = [
	{ "Id": "dish_001", "Name": "Chicken Parmesan", "CreateDate": "2023-10-05", "Type": PlateType.Meat, "CanMake": true, "Ingredients": ["id_007", "id_028", "id_023", "id_002", "id_014", "id_018"] },
	{ "Id": "dish_007", "Name": "Beef Stew", "CreateDate": "2022-03-26", "Type": PlateType.Meat, "CanMake": true, "Ingredients": ["id_023", "id_010", "id_021"] },
	{ "Id": "dish_009", "Name": "Cauliflower Tacos", "CreateDate": "2022-10-14", "Type": PlateType.NoMeat, "CanMake": false, "Ingredients": ["id_014", "id_016", "id_018", "id_002", "id_005"] },
	{ "Id": "dish_011", "Name": "Mixed Salad", "CreateDate": "2023-07-30", "Type": PlateType.Every, "CanMake": false, "Ingredients": ["id_017", "id_023", "id_009", "id_014", "id_019"] },
	{ "Id": "dish_013", "Name": "Fruit Salad", "CreateDate": "2021-02-13", "Type": PlateType.Every, "CanMake": true, "Ingredients": ["id_004", "id_018", "id_006", "id_013"] },
	{ "Id": "dish_014", "Name": "Roast Vegetables", "CreateDate": "2022-07-20", "Type": PlateType.Every, "CanMake": true, "Ingredients": ["id_027", "id_020", "id_005", "id_012"] },
	{ "Id": "dish_015", "Name": "Pancakes", "CreateDate": "2022-01-03", "Type": PlateType.Breakfast, "CanMake": false, "Ingredients": ["id_029", "id_007", "id_016", "id_004"] },
	{ "Id": "dish_016", "Name": "Breakfast Burrito", "CreateDate": "2022-09-19", "Type": PlateType.Breakfast, "CanMake": true, "Ingredients": ["id_015", "id_008", "id_011", "id_021"] },
	{ "Id": "dish_017", "Name": "Chicken Soup", "CreateDate": "2021-11-21", "Type": PlateType.Every, "CanMake": true, "Ingredients": ["id_029", "id_004", "id_008", "id_019"] },
	{ "Id": "dish_018", "Name": "Turkey Sandwich", "CreateDate": "2023-03-03", "Type": PlateType.Meat, "CanMake": true, "Ingredients": ["id_028", "id_002", "id_006", "id_025"] },
	{ "Id": "dish_021", "Name": "Granola Bowl", "CreateDate": "2022-04-10", "Type": PlateType.Breakfast, "CanMake": true, "Ingredients": ["id_021", "id_028", "id_026", "id_029"] },
	{ "Id": "dish_022", "Name": "Lamb Curry", "CreateDate": "2023-07-16", "Type": PlateType.Meat, "CanMake": false, "Ingredients": ["id_017", "id_007", "id_024", "id_020"] },
	{ "Id": "dish_023", "Name": "Vegan Burger", "CreateDate": "2022-08-01", "Type": PlateType.NoMeat, "CanMake": true, "Ingredients": ["id_029", "id_004", "id_028", "id_026", "id_000"] },
	{ "Id": "dish_024", "Name": "Hot Dog", "CreateDate": "2023-05-24", "Type": PlateType.FastFood, "CanMake": true, "Ingredients": ["id_008", "id_022", "id_003", "id_023", "id_027"] },
	{ "Id": "dish_025", "Name": "Taco", "CreateDate": "2023-01-14", "Type": PlateType.FastFood, "CanMake": false, "Ingredients": ["id_016", "id_028", "id_008", "id_026"] },
	{ "Id": "dish_002", "Name": "Grilled Steak", "CreateDate": "2022-06-19", "Type": PlateType.Meat, "CanMake": true, "Ingredients": ["id_009", "id_025", "id_003", "id_013"] },
	{ "Id": "dish_003", "Name": "Tofu Salad", "CreateDate": "2021-09-27", "Type": PlateType.NoMeat, "CanMake": false, "Ingredients": ["id_008", "id_019", "id_028", "id_017"] },
	{ "Id": "dish_004", "Name": "Grilled Steak", "CreateDate": "2021-04-29", "Type": PlateType.Meat, "CanMake": false, "Ingredients": ["id_014", "id_005", "id_018", "id_007", "id_026", "id_017"] },
	{ "Id": "dish_005", "Name": "Fried Chicken", "CreateDate": "2021-12-29", "Type": PlateType.FastFood, "CanMake": true, "Ingredients": ["id_021", "id_028", "id_004", "id_014"] },
	{ "Id": "dish_006", "Name": "Beef Stew", "CreateDate": "2021-01-28", "Type": PlateType.Meat, "CanMake": false, "Ingredients": ["id_005", "id_012", "id_009", "id_027", "id_017", "id_002"] },
	{ "Id": "dish_008", "Name": "Tofu Salad", "CreateDate": "2023-01-12", "Type": PlateType.NoMeat, "CanMake": true, "Ingredients": ["id_013", "id_026", "id_020", "id_018", "id_008"] },
	{ "Id": "dish_010", "Name": "Grilled Steak", "CreateDate": "2023-01-30", "Type": PlateType.Meat, "CanMake": true, "Ingredients": ["id_002", "id_028", "id_013", "id_008", "id_020", "id_012"] },
	{ "Id": "dish_012", "Name": "Hot Dog", "CreateDate": "2021-10-14", "Type": PlateType.FastFood, "CanMake": true, "Ingredients": ["id_004", "id_012", "id_024", "id_018"] },
	{ "Id": "dish_019", "Name": "Pasta Primavera", "CreateDate": "2021-10-21", "Type": PlateType.NoMeat, "CanMake": true, "Ingredients": ["id_025", "id_019", "id_022"] },
	{ "Id": "dish_020", "Name": "Fried Chicken", "CreateDate": "2022-12-27", "Type": PlateType.FastFood, "CanMake": true, "Ingredients": ["id_006", "id_026", "id_007", "id_014", "id_013"] },
	{ "Id": "dish_026", "Name": "Fish and Chips", "CreateDate": "2023-05-20", "Type": PlateType.FastFood, "CanMake": true, "Ingredients": ["id_013", "id_007", "id_025"] },
	{ "Id": "dish_027", "Name": "Mushroom Risotto", "CreateDate": "2023-05-12", "Type": PlateType.NoMeat, "CanMake": false, "Ingredients": ["id_017", "id_025", "id_029"] },
	{ "Id": "dish_028", "Name": "French Toast", "CreateDate": "2023-05-24", "Type": PlateType.Breakfast, "CanMake": false, "Ingredients": ["id_024", "id_018", "id_017", "id_019", "id_025", "id_003"] },
	{ "Id": "dish_029", "Name": "Vegetable Stir Fry", "CreateDate": "2021-09-30", "Type": PlateType.NoMeat, "CanMake": true, "Ingredients": ["id_009", "id_027", "id_014", "id_001", "id_004", "id_012"] }
]

