import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faAdd, faPen, faTrash, faMagnifyingGlass, faCheese, faWheatAwn, faDrumstickBite, faCarrot, faAppleWhole, faDroplet, faCandyCane, faSort, faSortUp, faSortDown, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons'
import { dateFormat } from '../utils/utils.ts'
import { apiPost, apiPut, apiDelete } from '../hooks/useApi.ts'
import Pagination from './Pagination'
import type { Ingredient } from "../types"
import { FoodGroup, UnitOfMeasure } from '../enums/Enums.ts'

type IngredientsProps = {
	ingredientsData: Ingredient[]
	onRefetch: () => void
}

const foodGroupMeta: Record<FoodGroup, { icon: IconDefinition; color: string }> = {
	[FoodGroup.Dairy]:     { icon: faCheese,        color: 'text-yellow-400' },
	[FoodGroup.Grain]:     { icon: faWheatAwn,       color: 'text-amber-600'  },
	[FoodGroup.Protein]:   { icon: faDrumstickBite,  color: 'text-red-500'    },
	[FoodGroup.Vegetable]: { icon: faCarrot,         color: 'text-orange-500' },
	[FoodGroup.Fruit]:     { icon: faAppleWhole,     color: 'text-green-600'  },
	[FoodGroup.Fat]:       { icon: faDroplet,        color: 'text-yellow-600' },
	[FoodGroup.Sugar]:     { icon: faCandyCane,      color: 'text-pink-500'   },
}

const CUP_FRACTIONS = [
	{ label: '1/8',  value: 0.125     },
	{ label: '1/4',  value: 0.25      },
	{ label: '1/3',  value: 1/3       },
	{ label: '1/2',  value: 0.5       },
	{ label: '2/3',  value: 2/3       },
	{ label: '3/4',  value: 0.75      },
	{ label: '1',    value: 1         },
	{ label: '1½',   value: 1.5       },
	{ label: '2',    value: 2         },
] as const

const formatPortion = (portion: number, uom: string): string => {
	if (uom === UnitOfMeasure.Cup) {
		const match = [...CUP_FRACTIONS].reduce((best, f) =>
			Math.abs(f.value - portion) < Math.abs(best.value - portion) ? f : best
		)
		return `${match.label} cup`
	}
	if (uom === UnitOfMeasure.Grams)      return `${portion}g`
	if (uom === UnitOfMeasure.Ml)         return `${portion}ml`
	if (uom === UnitOfMeasure.Unit)       return `×${portion}`
	if (uom === UnitOfMeasure.Tablespoon) return `${portion} tbsp`
	if (uom === UnitOfMeasure.Teaspoon)   return `${portion} tsp`
	return String(portion)
}

const getIngredientFoodGroups = (ingredient: Ingredient): FoodGroup[] => {
	const fromArray = ingredient.FoodGroups ?? []
	if (fromArray.length > 0) {
		return [...new Set(fromArray)]
	}
	return ingredient.FoodGroup ? [ingredient.FoodGroup] : []
}

const Ingredients = ({ ingredientsData, onRefetch }: IngredientsProps) => {
	const [Id, setId] = useState('')
	const [Name, setName] = useState('')
	const [CreateDate, setCreateDate] = useState('')
	const [InStock, setInStock] = useState(false)
	const [IngFoodGroup, setIngFoodGroup] = useState<FoodGroup | ''>('')
	const [IngSecondaryFoodGroup, setIngSecondaryFoodGroup] = useState<FoodGroup | ''>('')
	const [IngUnitOfMeasure, setIngUnitOfMeasure] = useState<UnitOfMeasure | ''>('')
	const [CurrentItems, setCurrentItems] = useState<Ingredient[]>([])
	const [Search, setSearch] = useState('')
	const [Portion, setPortion] = useState<number | ''>('')
	const [sortCol, setSortCol] = useState<'Name' | 'CreateDate' | 'InStock'>('Name')
	const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
	const [showFormRow, setShowFormRow] = useState(false)
	const [editingIngredientId, setEditingIngredientId] = useState<Ingredient['Id'] | null>(null)

	const OpenCreateForm = () => {
		clearForm()
		setEditingIngredientId(null)
		setShowFormRow(true)
	}

	const filteredData = useMemo(
		() => ingredientsData.filter(i =>
			i.Name.toLowerCase().includes(Search.toLowerCase())
		),
		[ingredientsData, Search]
	)

	const sortedData = useMemo(
		() => [...filteredData].sort((a, b) => {
			const dir = sortDir === 'asc' ? 1 : -1
			switch (sortCol) {
				case 'Name':       return a.Name.localeCompare(b.Name) * dir
				case 'CreateDate': return a.CreateDate.localeCompare(b.CreateDate) * dir
				case 'InStock':    return (Number(a.InStock) - Number(b.InStock)) * dir
				default:           return 0
			}
		}),
		[filteredData, sortCol, sortDir]
	)

	const isCreate = () => Id === '';

	const clearForm = () => {
		setId('');
		setName('');
		setCreateDate('');
		setInStock(false);
		setIngFoodGroup('');
		setIngSecondaryFoodGroup('');
		setIngUnitOfMeasure('');
		setPortion('');
	}

	const buildPayload = () => {
		const foodGroups = [...new Set([IngFoodGroup, IngSecondaryFoodGroup].filter((g): g is FoodGroup => g !== ''))]
		return {
			Name,
			InStock,
			FoodGroup: IngFoodGroup || foodGroups[0] || null,
			FoodGroups: foodGroups.length > 0 ? foodGroups : null,
			UnitOfMeasure: IngUnitOfMeasure || null,
			Portion: Portion === '' ? null : Portion,
		}
	}

	const HandleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		const payload = buildPayload()
		try {
			await apiPost<Ingredient>('/api/ingredients', payload)
			onRefetch()
			clearForm()
			setShowFormRow(false)
		} catch (err) {
			alert((err as Error).message)
		}
	}

	const FillInputs = (id: Ingredient['Id']) => {
		const ingredient = ingredientsData.find(i => i.Id === id);
		if (ingredient) {
			const groups = getIngredientFoodGroups(ingredient)
			const primary = ingredient.FoodGroup ?? groups[0] ?? ''
			const secondary = groups.find(g => g !== primary) ?? ''

			setId(ingredient.Id);
			setName(ingredient.Name);
			setCreateDate(ingredient.CreateDate);
			setInStock(ingredient.InStock);
			setIngFoodGroup(primary);
			setIngSecondaryFoodGroup(secondary);
			setIngUnitOfMeasure(ingredient.UnitOfMeasure ?? '');
			setPortion(ingredient.Portion ?? '');
			setShowFormRow(false)
			setEditingIngredientId(ingredient.Id)
		}
	}

	const SaveInlineEdit = async () => {
		if (!editingIngredientId) return
		const payload = buildPayload()
		try {
			await apiPut<Ingredient>(`/api/ingredients/${editingIngredientId}`, payload)
			onRefetch()
			clearForm()
			setEditingIngredientId(null)
		} catch (err) {
			alert((err as Error).message)
		}
	}

	const RemoveIngredient = async (id: Ingredient['Id']) => {
		const ingredient = ingredientsData.find(i => i.Id === id);
		if (ingredient) {
			const answer = confirm(`Would you like to remove "${ingredient.Name}" ingredient?`)
			if (answer) {
				try {
					await apiDelete(`/api/ingredients/${id}`)
					onRefetch()
				} catch (err) {
					alert((err as Error).message)
				}
			}
		}
	}

	const ToggleInStock = async (ingredient: Ingredient) => {
		const foodGroups = getIngredientFoodGroups(ingredient)
		try {
			await apiPut<Ingredient>(`/api/ingredients/${ingredient.Id}`, {
				Name: ingredient.Name,
				InStock: !ingredient.InStock,
				FoodGroup: ingredient.FoodGroup ?? foodGroups[0] ?? null,
				FoodGroups: foodGroups.length > 0 ? foodGroups : null,
				UnitOfMeasure: ingredient.UnitOfMeasure ?? null,
				Portion: ingredient.Portion ?? null,
			})
			onRefetch()
		} catch (err) {
			alert((err as Error).message)
		}
	}

	const isAnotherIngredientBeingEdited = (id: Ingredient['Id']) =>
		editingIngredientId !== null && editingIngredientId !== id
	const isInlineEditing = editingIngredientId !== null

	const handleSort = (col: 'Name' | 'CreateDate' | 'InStock') => {
		if (col === sortCol) {
			setSortDir(d => d === 'asc' ? 'desc' : 'asc')
		} else {
			setSortCol(col)
			setSortDir('asc')
		}
	}

	const SortIndicator = ({ col }: { col: 'Name' | 'CreateDate' | 'InStock' }) => (
		<FontAwesomeIcon
			icon={sortCol !== col ? faSort : sortDir === 'asc' ? faSortUp : faSortDown}
			className={`ml-1 text-xs ${sortCol === col ? 'text-blue-600' : 'text-gray-400'}`}
		/>
	)

	return (
		<>
			<h1 className='text-2xl font-bold underline text-purple-700'>Ingredients</h1>
			<div className="my-3">
				<button
					type="button"
					onClick={OpenCreateForm}
					disabled={isInlineEditing}
					className={`text-white font-medium rounded-lg text-sm px-4 py-2 focus:outline-none ${isInlineEditing ? 'bg-gray-400 cursor-not-allowed opacity-60' : 'bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300'}`}
				>
					<FontAwesomeIcon icon={faAdd} className="mr-2" />
					New ingredient
				</button>
			</div>
			<div className="relative max-w-sm my-3">
				<span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
					<FontAwesomeIcon icon={faMagnifyingGlass} />
				</span>
				<input
					type="text"
					placeholder="Search ingredient..."
					value={Search}
					onChange={e => setSearch(e.target.value)}
					className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-9 p-2"
				/>
			</div>
			<form onSubmit={HandleSubmit}>
				<table className='w-full text-lg text-left rtl:text-right text-gray-500'>
					<thead className='text-2xl text-gray-700 uppercase bg-gray-50 text-center'>
						<tr>
						<th scope="col" className="px-6 py-3 cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort('Name')}>Name <SortIndicator col="Name" /></th>
						<th scope="col" className="px-6 py-3 cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort('CreateDate')}>Date <SortIndicator col="CreateDate" /></th>
						<th scope="col" className="px-6 py-3 cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort('InStock')}>In Stock <SortIndicator col="InStock" /></th>
						<th scope="col" className="px-6 py-3">Food Group</th>
						<th scope="col" className="px-6 py-3">Unit of Measure</th>
						<th scope="col" className="px-6 py-3">Portion</th>
							<th scope="col" className="px-6 py-3">Actions</th>
						</tr>
					</thead>
					<tbody>
						{showFormRow && (
							<tr key={'formIngredient'} className="bg-white border-b text-center">
								<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
									<input
										className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
										name='Name'
										type="text"
										placeholder="Banana"
										value={Name}
										onChange={e => setName(e.target.value)}
										required
									/>
								</td>
								<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
									<input
										className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
										name='CreateDate'
										type="date"
										value={CreateDate}
										onChange={e => setCreateDate(e.target.value)}
										disabled={!isCreate()}
									/>
								</td>
								<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
									<input
										id="in-stock-checkbox"
										type="checkbox"
										className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
										name='InStock'
										checked={InStock}
										onChange={e => setInStock(e.target.checked)}
									/>
									<label htmlFor="in-stock-checkbox" className="ms-2 font-medium text-gray-900">In Stock</label>
								</td>
								<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
									<select
										className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 mb-1"
										value={IngFoodGroup}
										onChange={e => {
											const nextPrimary = e.target.value as FoodGroup | ''
											setIngFoodGroup(nextPrimary)
											if (nextPrimary !== '' && IngSecondaryFoodGroup === nextPrimary) {
												setIngSecondaryFoodGroup('')
											}
										}}
									>
										<option value="">Primary group</option>
										{Object.values(FoodGroup).map(g => (
											<option key={g} value={g}>{g}</option>
										))}
									</select>
									<select
										className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
										value={IngSecondaryFoodGroup}
										onChange={e => setIngSecondaryFoodGroup(e.target.value as FoodGroup | '')}
									>
										<option value="">Also counts as...</option>
										{Object.values(FoodGroup).map(g => (
											<option key={`secondary-${g}`} value={g} disabled={g === IngFoodGroup}>{g}</option>
										))}
									</select>
								</td>
								<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
									<select
										className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
										value={IngUnitOfMeasure}
									onChange={e => {
										setIngUnitOfMeasure(e.target.value as UnitOfMeasure | '')
										setPortion('')
									}}
								>
									<option value="">— none —</option>
									{Object.values(UnitOfMeasure).map(u => (
										<option key={u} value={u}>{u}</option>
									))}
								</select>
							</td>
							<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
								{IngUnitOfMeasure === UnitOfMeasure.Cup
									? <select
										className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
										value={Portion}
										onChange={e => setPortion(e.target.value === '' ? '' : Number(e.target.value))}>
										<option value="">— none —</option>
										{CUP_FRACTIONS.map(f => (
											<option key={f.label} value={f.value}>{f.label} cup</option>
										))}
										</select>
									: <input
										className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
										type="number"
										min="0"
										step="0.5"
										placeholder={IngUnitOfMeasure === UnitOfMeasure.Grams ? '30' : IngUnitOfMeasure === UnitOfMeasure.Ml ? '250' : '1'}
										value={Portion}
										onChange={e => setPortion(e.target.value === '' ? '' : Number(e.target.value))} />
								}
								</td>
								<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
									<button
										type="submit"
										className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-3 py-2.5 me-2 mb-2 focus:outline-none"
									>
										<FontAwesomeIcon icon={faCheck} />
									</button>
									<button
										type="button"
										onClick={() => {
											clearForm()
											setShowFormRow(false)
											setEditingIngredientId(null)
										}}
										className="text-white bg-gray-400 hover:bg-gray-500 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-3 py-2.5 mb-2 focus:outline-none"
									>
										<FontAwesomeIcon icon={faXmark} />
									</button>
								</td>
							</tr>
						)}
						{CurrentItems.length > 0 ? CurrentItems.map(data => (
							<tr key={data.Id} className={`${editingIngredientId === data.Id ? 'bg-amber-50' : 'bg-white'} border-b text-center`}>
								{editingIngredientId === data.Id ? (
									<>
										<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
											<input
												className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
												type="text"
												value={Name}
												onChange={e => setName(e.target.value)}
												required
											/>
										</td>
										<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
											<input
												className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
												type="date"
												value={CreateDate}
												disabled
											/>
										</td>
										<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
											<input
												type="checkbox"
												className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
												checked={InStock}
												onChange={e => setInStock(e.target.checked)}
											/>
										</td>
										<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
											<select
												className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 mb-1"
												value={IngFoodGroup}
												onChange={e => {
													const nextPrimary = e.target.value as FoodGroup | ''
													setIngFoodGroup(nextPrimary)
													if (nextPrimary !== '' && IngSecondaryFoodGroup === nextPrimary) {
														setIngSecondaryFoodGroup('')
													}
												}}
											>
												<option value="">Primary group</option>
												{Object.values(FoodGroup).map(g => (
													<option key={g} value={g}>{g}</option>
												))}
											</select>
											<select
												className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
												value={IngSecondaryFoodGroup}
												onChange={e => setIngSecondaryFoodGroup(e.target.value as FoodGroup | '')}
											>
												<option value="">Also counts as...</option>
												{Object.values(FoodGroup).map(g => (
													<option key={`secondary-${g}`} value={g} disabled={g === IngFoodGroup}>{g}</option>
												))}
											</select>
										</td>
										<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
											<select
												className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
												value={IngUnitOfMeasure}
												onChange={e => {
													setIngUnitOfMeasure(e.target.value as UnitOfMeasure | '')
													setPortion('')
												}}
											>
												<option value="">— none —</option>
												{Object.values(UnitOfMeasure).map(u => (
													<option key={u} value={u}>{u}</option>
												))}
											</select>
										</td>
										<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
											{IngUnitOfMeasure === UnitOfMeasure.Cup
												? <select
													className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
													value={Portion}
													onChange={e => setPortion(e.target.value === '' ? '' : Number(e.target.value))}>
													<option value="">— none —</option>
													{CUP_FRACTIONS.map(f => (
														<option key={f.label} value={f.value}>{f.label} cup</option>
													))}
												</select>
												: <input
													className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
													type="number"
													min="0"
													step="0.5"
													placeholder={IngUnitOfMeasure === UnitOfMeasure.Grams ? '30' : IngUnitOfMeasure === UnitOfMeasure.Ml ? '250' : '1'}
													value={Portion}
													onChange={e => setPortion(e.target.value === '' ? '' : Number(e.target.value))} />
											}
										</td>
										<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
											<button type="button" onClick={SaveInlineEdit} className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-3 py-2.5 me-2 mb-2 focus:outline-none">
												<FontAwesomeIcon icon={faCheck} />
											</button>
											<button
												type="button"
												onClick={() => {
													clearForm()
													setEditingIngredientId(null)
												}}
												className="text-white bg-gray-400 hover:bg-gray-500 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-3 py-2.5 mb-2 focus:outline-none"
											>
												<FontAwesomeIcon icon={faXmark} />
											</button>
										</td>
									</>
								) : (
									<>
								<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
									{data.Name}
								</td>
								<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
									{dateFormat(data.CreateDate)}
								</td>
								<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
								<input
									type="checkbox"
									className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
									checked={data.InStock}
									onChange={() => ToggleInStock(data)}
									aria-label={`Toggle in stock for ${data.Name}`}
								/>
								</td>
								<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
								{getIngredientFoodGroups(data).length > 0
									? <div className="flex items-center justify-center gap-2">
										{getIngredientFoodGroups(data).map(group => (
											<FontAwesomeIcon
												key={`${data.Id}-${group}`}
												icon={foodGroupMeta[group].icon}
												className={foodGroupMeta[group].color}
												title={group}
												size="xl"
											/>
										))}
									</div>
									: <span className="text-gray-400">—</span>
								}
								</td>
								<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
									{data.UnitOfMeasure ?? <span className="text-gray-400">—</span>}
							</td>
							<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
								{data.Portion != null && data.UnitOfMeasure
									? formatPortion(data.Portion, data.UnitOfMeasure)
									: <span className="text-gray-400">—</span>
								}
							</td>
							<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
									<button
										type="button"
										onClick={() => FillInputs(data.Id)}
										disabled={isAnotherIngredientBeingEdited(data.Id)}
										className={`text-white font-medium rounded-lg text-sm px-3 py-2.5 me-2 mb-2 focus:outline-none ${isAnotherIngredientBeingEdited(data.Id) ? 'bg-gray-400 cursor-not-allowed opacity-60' : 'bg-yellow-700 hover:bg-yellow-800 focus:ring-4 focus:ring-yellow-300'}`}
									>
										<FontAwesomeIcon icon={faPen} />
									</button>
									<button type="button" onClick={() => RemoveIngredient(data.Id)} className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-2.5 me-2 mb-2 focus:outline-none">
										<FontAwesomeIcon icon={faTrash} />
									</button>
								</td>
									</>
								)}
							</tr>
						)) : (
							<tr key="message-ingredient" className="bg-white border-b text-center">
								<th scope="row" colSpan={7} className="px-6 py-4 font-bold text-2xl text-gray-900 whitespace-nowrap bg-emerald-100">
									No records
								</th>
							</tr>
						)}
					</tbody>
				</table>
			</form>
			<Pagination<Ingredient> Info={sortedData} setCurrentItems={setCurrentItems}></Pagination>
		</>
	)
}

export default Ingredients
