import { useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faPlus, faFloppyDisk, faXmark, faGripVertical } from '@fortawesome/free-solid-svg-icons'
import { apiDelete, apiPost, apiPut, useApi } from '../hooks/useApi'
import { DishType } from '../enums/Enums'
import type { DailyMenuDetail, DailyMenuMeal, DailyMenuSummary, Dish } from '../types'

type DailyMenusProps = {
	dishesData: Dish[]
	dailyMenusData: DailyMenuSummary[]
	selectedDailyMenuId: string
	onSelectDailyMenu: (id: string) => void
	onRefetchDailyMenus: () => Promise<void>
}

const DailyMenus = ({
	dishesData,
	dailyMenusData,
	selectedDailyMenuId,
	onSelectDailyMenu,
	onRefetchDailyMenus,
}: DailyMenusProps) => {
	const mealOptions = ['Desayuno', 'Almuerzo', 'Cena', 'Merienda', 'Snack']
	const otherMealOption = '__other__'
	const { data: selectedDailyMenu, loading, error, refetch } = useApi<DailyMenuDetail>(`/api/daily-menus/${selectedDailyMenuId}`)
	const [newMealName, setNewMealName] = useState('')
	const [customMealName, setCustomMealName] = useState('')
	const [menuNameInput, setMenuNameInput] = useState('')
	const [dishSearch, setDishSearch] = useState('')
	const [dishTypeFilter, setDishTypeFilter] = useState<'All' | DishType>('All')

	const signatureToIds = useMemo(() => {
		return dailyMenusData.reduce<Record<string, string[]>>((acc, menu) => {
			if (!menu.PrincipalSignature) return acc
			if (!acc[menu.PrincipalSignature]) acc[menu.PrincipalSignature] = []
			acc[menu.PrincipalSignature].push(menu.Id)
			return acc
		}, {})
	}, [dailyMenusData])

	const duplicateCandidates = useMemo(() => {
		if (!selectedDailyMenu?.PrincipalSignature) return []
		return (signatureToIds[selectedDailyMenu.PrincipalSignature] ?? []).filter(id => id !== selectedDailyMenu.Id)
	}, [selectedDailyMenu, signatureToIds])

	const dishesSorted = useMemo(() => {
		return [...dishesData].sort((a, b) => a.Name.localeCompare(b.Name))
	}, [dishesData])

	const dishesColumnData = useMemo(() => {
		return dishesSorted
			.filter(dish => dish.Name.toLowerCase().includes(dishSearch.toLowerCase()))
			.filter(dish => dishTypeFilter === 'All' || dish.Type === dishTypeFilter)
	}, [dishesSorted, dishSearch, dishTypeFilter])

	const mutateAndRefresh = async (fn: () => Promise<void>) => {
		await fn()
		await onRefetchDailyMenus()
		await refetch()
	}

	const sortedMeals = useMemo(() => {
		return selectedDailyMenu?.Meals.slice().sort((a, b) => a.SortOrder - b.SortOrder) ?? []
	}, [selectedDailyMenu])

	const addMeal = async () => {
		const mealNameToCreate = newMealName === otherMealOption ? customMealName.trim() : newMealName.trim()
		if (!mealNameToCreate) return
		const maxSort = selectedDailyMenu?.Meals.reduce((max, meal) => Math.max(max, meal.SortOrder), 0) ?? 0
		try {
			await mutateAndRefresh(async () => {
				await apiPost(`/api/daily-menus/${selectedDailyMenuId}/meals`, {
					MealName: mealNameToCreate,
					SortOrder: maxSort + 1,
				})
			})
			setNewMealName('')
			setCustomMealName('')
		} catch (err) {
			alert((err as Error).message)
		}
	}

	const removeDailyMenu = async (id: string) => {
		const target = dailyMenusData.find(menu => menu.Id === id)
		if (!target) return
		const answer = confirm(`Would you like to remove "${target.Name}"?`)
		if (!answer) return

		try {
			await apiDelete(`/api/daily-menus/${id}`)
			await onRefetchDailyMenus()
			const fallback = dailyMenusData.filter(menu => menu.Id !== id)[0]
			if (fallback) onSelectDailyMenu(fallback.Id)
		} catch (err) {
			alert((err as Error).message)
		}
	}

	const updateMeal = async (mealId: string, payload: { MealName?: string; SortOrder?: number }) => {
		try {
			await mutateAndRefresh(async () => {
				await apiPut(`/api/daily-menus/${selectedDailyMenuId}/meals/${mealId}`, payload)
			})
		} catch (err) {
			alert((err as Error).message)
		}
	}

	const removeMeal = async (mealId: string) => {
		try {
			await mutateAndRefresh(async () => {
				await apiDelete(`/api/daily-menus/${selectedDailyMenuId}/meals/${mealId}`)
			})
		} catch (err) {
			alert((err as Error).message)
		}
	}

	const assignDishToMeal = async (mealId: string, dishId: string | null) => {
		try {
			await mutateAndRefresh(async () => {
				await apiPut(`/api/daily-menus/${selectedDailyMenuId}/meals/${mealId}/dish`, { DishId: dishId })
			})
		} catch (err) {
			alert((err as Error).message)
		}
	}

	const handleDrop = async (mealId: string, event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault()
		if (event.dataTransfer.getData('application/x-meal-id')) return
		const dishId = event.dataTransfer.getData('application/x-dish-id') || event.dataTransfer.getData('text/plain')
		if (!dishId) return
		await assignDishToMeal(mealId, dishId)
	}

	const reorderMeals = async (draggedMealId: string, targetMealId: string) => {
		if (draggedMealId === targetMealId) return

		const sourceIndex = sortedMeals.findIndex(meal => meal.Id === draggedMealId)
		const targetIndex = sortedMeals.findIndex(meal => meal.Id === targetMealId)
		if (sourceIndex < 0 || targetIndex < 0) return

		const nextOrder = sortedMeals.slice()
		const [draggedMeal] = nextOrder.splice(sourceIndex, 1)
		nextOrder.splice(targetIndex, 0, draggedMeal)

		const updates = nextOrder
			.map((meal, index) => ({ mealId: meal.Id, sortOrder: index + 1, currentSortOrder: meal.SortOrder }))
			.filter(update => update.sortOrder !== update.currentSortOrder)

		if (updates.length === 0) return

		try {
			await mutateAndRefresh(async () => {
				await Promise.all(
					updates.map(update =>
						apiPut(`/api/daily-menus/${selectedDailyMenuId}/meals/${update.mealId}`, {
							SortOrder: update.sortOrder,
						}),
					),
				)
			})
		} catch (err) {
			alert((err as Error).message)
		}
	}

	const renameDailyMenu = async () => {
		if (!menuNameInput.trim()) return
		try {
			await mutateAndRefresh(async () => {
				await apiPut(`/api/daily-menus/${selectedDailyMenuId}`, { Name: menuNameInput })
			})
		} catch (err) {
			alert((err as Error).message)
		}
	}

	useEffect(() => {
		if (!selectedDailyMenu) return
		setMenuNameInput(selectedDailyMenu.Name)
	}, [selectedDailyMenu])

	if (loading) {
		return <p className="text-sm text-gray-500">Loading selected daily menu...</p>
	}

	if (error || !selectedDailyMenu) {
		return <p className="text-sm text-red-600">Error loading daily menu: {error ?? 'Unknown error'}</p>
	}

	return (
		<div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-4">
			<section className="bg-white border border-gray-200 rounded-xl p-3">
				<p className="text-xs font-semibold uppercase text-gray-500 mb-2">Daily menus</p>
				<div className="space-y-2 max-h-[70vh] overflow-auto pr-1">
					{dailyMenusData.map(menu => (
						<div
							key={menu.Id}
							className={`rounded-lg border p-2 cursor-pointer ${menu.Id === selectedDailyMenuId ? 'border-purple-600 bg-purple-50' : 'border-gray-200 bg-white'}`}
							onClick={() => onSelectDailyMenu(menu.Id)}
						>
							<div className="flex items-start justify-between gap-2">
								<div>
									<p className="text-sm font-semibold text-gray-900">{menu.Name}</p>
									<div className="mt-2 flex flex-wrap gap-1">
										{menu.DishNames.length === 0 && (
											<span className="text-xs text-gray-400">No dishes yet</span>
										)}
										{menu.DishNames.map(dishName => (
											<span key={`${menu.Id}-${dishName}`} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
												{dishName}
											</span>
										))}
									</div>
								</div>
								<button
									type="button"
									onClick={e => {
										e.stopPropagation()
										void removeDailyMenu(menu.Id)
									}}
									className="text-red-600 hover:text-red-700"
									title="Delete daily menu"
								>
									<FontAwesomeIcon icon={faTrash} />
								</button>
							</div>
						</div>
					))}
				</div>
			</section>

			<section className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
				<div className="flex items-start justify-between gap-3">
					<div className="w-full grid grid-cols-[1fr_auto] gap-2">
						<input
							type="text"
							value={menuNameInput}
							onChange={e => setMenuNameInput(e.target.value)}
							placeholder="Daily menu name"
							className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
						/>
						<button
							type="button"
							onClick={renameDailyMenu}
							className="text-blue-700 hover:text-blue-800 px-2"
							title="Save menu name"
						>
							<FontAwesomeIcon icon={faFloppyDisk} />
						</button>
					</div>
				</div>
				<p className="text-xs text-gray-500">Arrastra tarjetas para cambiar el orden. Tambien puedes arrastrar platillos a cada comida.</p>

				{duplicateCandidates.length > 0 && (
					<div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
						This daily menu matches the same breakfast/lunch/dinner signature as another template.
						<button
							type="button"
							onClick={() => onSelectDailyMenu(duplicateCandidates[0])}
							className="ml-2 underline font-medium"
						>
							Open existing
						</button>
					</div>
				)}

				<div className={`grid gap-2 ${newMealName === otherMealOption ? 'grid-cols-[1fr_1fr_auto]' : 'grid-cols-[1fr_auto]'}`}>
					<select
						value={newMealName}
						onChange={e => setNewMealName(e.target.value)}
						className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
					>
						<option value="">Selecciona una comida...</option>
						{mealOptions.map(option => (
							<option key={option} value={option}>{option}</option>
						))}
						<option value={otherMealOption}>Otro...</option>
					</select>
					{newMealName === otherMealOption && (
						<input
							type="text"
							value={customMealName}
							onChange={e => setCustomMealName(e.target.value)}
							placeholder="Escribe nombre personalizado"
							className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
						/>
					)}
					<button
						type="button"
						onClick={addMeal}
						className="bg-green-700 hover:bg-green-800 text-white rounded-lg px-3"
						title="Add meal"
					>
						<FontAwesomeIcon icon={faPlus} />
					</button>
				</div>

				<div className="space-y-2">
					{selectedDailyMenu.Meals.length === 0 && (
						<div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
							No meals yet. Add one above and start ordering by drag and drop.
						</div>
					)}

					{sortedMeals.map(meal => (
							<MealRow
								key={meal.Id}
								meal={meal}
								onUpdateMeal={updateMeal}
								onRemoveMeal={removeMeal}
								onDropDish={event => handleDrop(meal.Id, event)}
								onClearDish={() => assignDishToMeal(meal.Id, null)}
								onReorderMeal={draggedMealId => reorderMeals(draggedMealId, meal.Id)}
							/>
						))}
				</div>
			</section>

			<section className="bg-white border border-gray-200 rounded-xl p-3 space-y-3 lg:sticky lg:top-4 h-fit">
				<p className="text-xs font-semibold uppercase text-gray-500">Platillos</p>
				<input
					type="text"
					value={dishSearch}
					onChange={e => setDishSearch(e.target.value)}
					placeholder="Buscar por nombre..."
					className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 w-full"
				/>
				<select
					value={dishTypeFilter}
					onChange={e => setDishTypeFilter(e.target.value as 'All' | DishType)}
					className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 w-full"
				>
					<option value="All">Todos los tipos</option>
					{Object.values(DishType).map(type => (
						<option key={type} value={type}>{type}</option>
					))}
				</select>
				<div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
					{dishesColumnData.length === 0 && (
						<p className="text-xs text-gray-400">No hay platillos con esos filtros.</p>
					)}
					{dishesColumnData.map(dish => (
						<div
							key={dish.Id}
							draggable
							onDragStart={event => {
								event.dataTransfer.setData('application/x-dish-id', dish.Id)
								event.dataTransfer.setData('text/plain', dish.Id)
							}}
							className="rounded-lg border border-gray-200 p-2 bg-white cursor-grab active:cursor-grabbing"
						>
							<p className="text-sm font-semibold text-gray-900">{dish.Name}</p>
							<div className="mt-1 flex items-center gap-2 text-xs">
								<span className={`px-2 py-0.5 rounded-full ${dish.CanMake ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
									{dish.CanMake ? 'CanMake' : 'Missing stock'}
								</span>
								<span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{dish.Type}</span>
							</div>
						</div>
					))}
				</div>
			</section>
		</div>
	)
}

type MealRowProps = {
	meal: DailyMenuMeal
	onUpdateMeal: (mealId: string, payload: { MealName?: string; SortOrder?: number }) => Promise<void>
	onRemoveMeal: (mealId: string) => Promise<void>
	onDropDish: (event: React.DragEvent<HTMLDivElement>) => Promise<void>
	onClearDish: () => Promise<void>
	onReorderMeal: (draggedMealId: string) => Promise<void>
}

const MealRow = ({ meal, onUpdateMeal, onRemoveMeal, onDropDish, onClearDish, onReorderMeal }: MealRowProps) => {
	const [mealName, setMealName] = useState(meal.MealName)

	return (
		<div
			className="rounded-lg border border-gray-200 p-3 space-y-2"
			onDragOver={event => {
				event.preventDefault()
			}}
			onDrop={event => {
				event.preventDefault()
				const draggedMealId = event.dataTransfer.getData('application/x-meal-id')
				if (!draggedMealId) return
				void onReorderMeal(draggedMealId)
			}}
		>
			<div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 items-center">
				<div
					draggable
					onDragStart={event => {
						event.dataTransfer.effectAllowed = 'move'
						event.dataTransfer.setData('application/x-meal-id', meal.Id)
					}}
					className="text-gray-500 hover:text-gray-700 cursor-grab active:cursor-grabbing px-1"
					title="Drag to reorder"
				>
					<FontAwesomeIcon icon={faGripVertical} />
				</div>
				<input
					type="text"
					value={mealName}
					onChange={e => setMealName(e.target.value)}
					className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
				/>
				<button
					type="button"
					onClick={() => onUpdateMeal(meal.Id, { MealName: mealName })}
					className="text-blue-700 hover:text-blue-800"
					title="Save meal"
				>
					<FontAwesomeIcon icon={faFloppyDisk} />
				</button>
				<button
					type="button"
					onClick={() => onRemoveMeal(meal.Id)}
					className="text-red-600 hover:text-red-700"
					title="Delete meal"
				>
					<FontAwesomeIcon icon={faTrash} />
				</button>
			</div>

			<div
				onDragOver={event => {
					event.preventDefault()
					event.stopPropagation()
				}}
				onDrop={event => {
					event.stopPropagation()
					void onDropDish(event)
				}}
				className={`rounded-lg border-2 border-dashed p-3 ${meal.DishId ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'}`}
			>
				{meal.DishId ? (
					<div className="flex items-center justify-between gap-2">
						<div>
							<p className="text-sm font-semibold text-gray-900">{meal.DishName}</p>
							<div className="mt-1 flex items-center gap-2 text-xs">
								<span className={`px-2 py-0.5 rounded-full ${meal.CanMake ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
									{meal.CanMake ? 'CanMake' : 'Missing stock'}
								</span>
								{meal.DishType && <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{meal.DishType}</span>}
							</div>
						</div>
						<button
							type="button"
							onClick={() => {
								void onClearDish()
							}}
							className="text-gray-500 hover:text-gray-700"
							title="Clear dish"
						>
							<FontAwesomeIcon icon={faXmark} />
						</button>
					</div>
				) : (
					<p className="text-sm text-gray-500">Drop dish here</p>
				)}
			</div>
		</div>
	)
}

export default DailyMenus
