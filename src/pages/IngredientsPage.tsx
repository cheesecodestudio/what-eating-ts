import Ingredients from '../components/Ingredients'
import { useApi } from '../hooks/useApi'
import type { Ingredient } from '../types'

const IngredientsPage = () => {
	const { data, refetch } = useApi<Ingredient[]>('/api/ingredients')

	const handleChange = () => {
		refetch()
	}

	return <Ingredients ingredientsData={data ?? []} onRefetch={handleChange} />
}

export default IngredientsPage
