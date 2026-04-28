import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import type { Ingredient } from '../types'
import { FoodGroup, UnitOfMeasure } from '../enums/Enums.ts'

interface IngredientServingsModalProps {
	ingredient: Ingredient
	onConfirm: (servings: number) => void
	onCancel: () => void
}

const CUP_FRACTIONS = [
	{ label: '1/8', value: 0.125 },
	{ label: '1/4', value: 0.25  },
	{ label: '1/3', value: 1/3   },
	{ label: '1/2', value: 0.5   },
	{ label: '2/3', value: 2/3   },
	{ label: '3/4', value: 0.75  },
	{ label: '1',   value: 1     },
	{ label: '1½',  value: 1.5   },
	{ label: '2',   value: 2     },
] as const

const formatPortion = (amount: number, uom: string): string => {
	if (uom === UnitOfMeasure.Cup) {
		const match = [...CUP_FRACTIONS].reduce((best, f) =>
			Math.abs(f.value - amount) < Math.abs(best.value - amount) ? f : best
		)
		return `${match.label} cup${amount > 1 ? 's' : ''}`
	}
	if (uom === UnitOfMeasure.Grams) return `${amount}g`
	if (uom === UnitOfMeasure.Ml)    return `${amount}ml`
	if (uom === UnitOfMeasure.Unit)  return `×${amount}`
	return String(amount)
}

const getIngredientFoodGroups = (ingredient: Ingredient): FoodGroup[] => {
	const fromArray = ingredient.FoodGroups ?? []
	if (fromArray.length > 0) {
		return [...new Set(fromArray)]
	}
	return ingredient.FoodGroup ? [ingredient.FoodGroup] : []
}

const IngredientServingsModal = ({ ingredient, onConfirm, onCancel }: IngredientServingsModalProps) => {
	const [servings, setServings] = useState(1)
	const foodGroups = getIngredientFoodGroups(ingredient)

	const hasPortion = ingredient.Portion != null && ingredient.UnitOfMeasure != null

	const perServingFormatted = hasPortion
		? formatPortion(ingredient.Portion!, ingredient.UnitOfMeasure!)
		: null

	const totalAmount = hasPortion
		? Number((servings * ingredient.Portion!).toFixed(2))
		: null

	const totalFormatted = totalAmount != null
		? formatPortion(totalAmount, ingredient.UnitOfMeasure!)
		: null

	const decrement = () => setServings(s => Math.max(0.5, Math.round((s - 0.5) * 10) / 10))
	const increment = () => setServings(s => Math.round((s + 0.5) * 10) / 10)

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			onMouseDown={e => { if (e.target === e.currentTarget) onCancel() }}
		>
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 relative">

				{/* Close */}
				<button
					type="button"
					onClick={onCancel}
					className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
					aria-label="Close"
				>
					<FontAwesomeIcon icon={faXmark} size="lg" />
				</button>

				{/* Header */}
				<p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Add ingredient</p>
				<h2 className="text-xl font-bold text-gray-900 pr-8">{ingredient.Name}</h2>
				<div className="flex flex-wrap gap-2 mt-2 mb-5">
					{foodGroups.map(group => (
						<span key={`${ingredient.Id}-${group}`} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
							{group}
						</span>
					))}
					<span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ingredient.InStock ? 'bg-green-100 text-green-700' : 'bg-pink-100 text-pink-700'}`}>
						{ingredient.InStock ? 'In stock' : 'No stock'}
					</span>
					{ingredient.UnitOfMeasure && (
						<span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
							{ingredient.UnitOfMeasure}
						</span>
					)}
				</div>

				{/* Per serving */}
				{perServingFormatted && (
					<div className="bg-gray-50 rounded-lg px-4 py-3 mb-5 text-sm text-gray-600">
						Per serving: <span className="font-semibold text-gray-900">{perServingFormatted}</span>
					</div>
				)}

				{/* Servings stepper */}
				<label className="block text-sm font-medium text-gray-700 mb-2">Servings</label>
				<div className="flex items-center gap-3 justify-center mb-4">
					<button
						type="button"
						onClick={decrement}
						className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xl flex items-center justify-center select-none"
					>
						−
					</button>
					<input
						type="number"
						min="0.5"
						step="0.5"
						value={servings}
						onChange={e => setServings(Math.max(0.5, Number(e.target.value)))}
						className="w-20 text-center border border-gray-300 rounded-lg p-2 text-lg font-semibold focus:ring-blue-500 focus:border-blue-500"
					/>
					<button
						type="button"
						onClick={increment}
						className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xl flex items-center justify-center select-none"
					>
						+
					</button>
				</div>

				{/* Live total conversion */}
				{totalFormatted && (
					<div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3 mb-5 text-sm text-purple-700 text-center">
						{servings} {servings === 1 ? 'serving' : 'servings'} ={' '}
						<span className="font-bold text-purple-900 text-base">{totalFormatted}</span>
					</div>
				)}

				{/* Actions */}
				<div className="flex gap-3 mt-2">
					<button
						type="button"
						onClick={onCancel}
						className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={() => onConfirm(servings)}
						className="flex-1 bg-purple-700 text-white rounded-lg py-2.5 font-medium hover:bg-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-300"
					>
						Add to dish
					</button>
				</div>

			</div>
		</div>
	)
}

export default IngredientServingsModal
