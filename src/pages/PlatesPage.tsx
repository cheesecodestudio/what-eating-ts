import Plates from '../components/Plates'
import { useApi } from '../hooks/useApi'
import type { Ingredient, Plate } from '../types'

const PlatesPage = () => {
	const { data: ingredients } = useApi<Ingredient[]>('/api/ingredients')
	const { data: plates, refetch: refetchPlates } = useApi<Plate[]>('/api/plates')

	return (
		<Plates
			platesData={plates ?? []}
			ingredientsData={ingredients ?? []}
			onRefetch={refetchPlates}
		/>
	)
}

export default PlatesPage
