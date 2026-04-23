import Dishes from '../components/Dishes'
import { useApi } from '../hooks/useApi'
import type { Ingredient, Dish } from '../types'

const DishesPage = () => {
	const { data: ingredients } = useApi<Ingredient[]>('/api/ingredients')
	const { data: dishes, refetch: refetchDishes } = useApi<Dish[]>('/api/dishes')

	return (
		<Dishes
			dishesData={dishes ?? []}
			ingredientsData={ingredients ?? []}
			onRefetch={refetchDishes}
		/>
	)
}

export default DishesPage
