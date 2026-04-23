import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAdd, faPen, faSquareCheck, faSquareXmark, faTrash, faXmark, faSort, faSortUp, faSortDown, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { dateFormat } from '../utils/utils.ts'
import { apiPost, apiPut, apiDelete } from '../hooks/useApi.ts'
import Pagination from './Pagination'
import QuickSearch from './QuickSearch'
import IngredientServingsModal from './IngredientServingsModal'
import type { Dish, Ingredient, DishIngredient } from '../types'
import { DishType } from '../enums/Enums.ts'

type DishesProps = {
	dishesData: Dish[]
	ingredientsData: Ingredient[]
	onRefetch: () => void
}

const Dishes = ({ dishesData, ingredientsData, onRefetch }: DishesProps) => {
	const [Id, setId] = useState('')
	const [Name, setName] = useState('')
	const [CreateDate, setCreateDate] = useState('')
	const [Type, setType] = useState(DishType.Every)
	const [IngredientsInput, setIngredientsInput] = useState('')
	const [Ingredients, setIngredients] = useState<DishIngredient[]>([])
	const [CurrentItems, setCurrentItems] = useState<Dish[]>([])
	const [Search, setSearch] = useState('')
	const [sortCol, setSortCol] = useState<'Name' | 'CreateDate' | 'Type'>('Name')
	const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
	const [pendingIngredient, setPendingIngredient] = useState<Ingredient | null>(null)

	const OpenIngredientModal = (ingredient: Ingredient) => {
		setIngredientsInput('')
		setPendingIngredient(ingredient)
	}

	const ConfirmIngredient = (servings: number) => {
		if (pendingIngredient && !Ingredients.some(di => di.IngredientId === pendingIngredient.Id)) {
			setIngredients([...Ingredients, { IngredientId: pendingIngredient.Id, Servings: servings }])
		}
		setPendingIngredient(null)
	}

	const isCreate = () => Id === '';

	const clearForm = () => {
		setId('');
		setName('');
		setCreateDate('');
		setType(DishType.Every);
		setIngredients([]);
	}

	const UpdateServings = (ingredientId: string, servings: number) => {
		setIngredients(Ingredients.map(di =>
			di.IngredientId === ingredientId ? { ...di, Servings: servings } : di
		));
	}

	const RemoveChipIngredient = (ingredientId: string) => {
		setIngredients(Ingredients.filter(di => di.IngredientId !== ingredientId));
	}

	const HandleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		const payload = { Name, Type, Ingredients }
		try {
			if (isCreate()) {
				await apiPost<Dish>('/api/dishes', payload)
			} else {
				await apiPut<Dish>(`/api/dishes/${Id}`, payload)
			}
			onRefetch()
			clearForm()
		} catch (err) {
			alert((err as Error).message)
		}
	}

	const FillInputs = (id: Dish['Id']) => {
		const dish = dishesData.find(d => d.Id === id);
		if (dish) {
			setId(dish.Id);
			setName(dish.Name);
			setCreateDate(dish.CreateDate);
			setType(dish.Type);
			setIngredients(dish.Ingredients);
		}
	}

	const RemoveDish = async (id: Dish['Id']) => {
		const dish = dishesData.find(d => d.Id === id);
		if (dish) {
			const answer = confirm(`Would you like to remove "${dish.Name}" dish?`)
			if (answer) {
				try {
					await apiDelete(`/api/dishes/${id}`)
					onRefetch()
				} catch (err) {
					alert((err as Error).message)
				}
			}
		}
	}

	const filteredData = useMemo(
		() => dishesData.filter(d => d.Name.toLowerCase().includes(Search.toLowerCase())),
		[dishesData, Search]
	)

	const sortedData = useMemo(
		() => [...filteredData].sort((a, b) => {
			const dir = sortDir === 'asc' ? 1 : -1
			switch (sortCol) {
				case 'Name':       return a.Name.localeCompare(b.Name) * dir
				case 'CreateDate': return a.CreateDate.localeCompare(b.CreateDate) * dir
				case 'Type':       return a.Type.localeCompare(b.Type) * dir
				default:           return 0
			}
		}),
		[filteredData, sortCol, sortDir]
	)

	const handleSort = (col: 'Name' | 'CreateDate' | 'Type') => {
		if (col === sortCol) {
			setSortDir(d => d === 'asc' ? 'desc' : 'asc')
		} else {
			setSortCol(col)
			setSortDir('asc')
		}
	}

	const SortIndicator = ({ col }: { col: 'Name' | 'CreateDate' | 'Type' }) => (
		<FontAwesomeIcon
			icon={sortCol !== col ? faSort : sortDir === 'asc' ? faSortUp : faSortDown}
			className={`ml-1 text-xs ${sortCol === col ? 'text-blue-600' : 'text-gray-400'}`}
		/>
	)

	return (
		<>
			<h1 className='text-2xl font-bold underline text-purple-700'>Dishes</h1>
			<div className="relative max-w-sm my-3">
				<span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
					<FontAwesomeIcon icon={faMagnifyingGlass} />
				</span>
				<input
					type="text"
					placeholder="Search dish..."
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
						<th scope="col" className="px-6 py-3 cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort('Type')}>Type <SortIndicator col="Type" /></th>
							<th scope="col" className="px-6 py-3">Can you make?</th>
							<th scope="col" className="px-6 py-3">Ingredients</th>
							<th scope="col" className="px-6 py-3">Actions</th>
						</tr>
					</thead>
					<tbody>
						{CurrentItems.length > 0 ? CurrentItems.map(data => (
							<tr key={data.Id} className="bg-white border-b text-center">
								<th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
									{data.Name}
								</th>
								<th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
									{dateFormat(data.CreateDate)}
								</th>
								<th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
									{data.Type}
								</th>
								<th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
									{data.CanMake ?
										<FontAwesomeIcon icon={faSquareCheck} className='text-green-800 px-2.5 py-0.5' size='2xl' /> :
										<FontAwesomeIcon icon={faSquareXmark} className='text-pink-800 px-2.5 py-0.5' size='2xl' />
									}
								</th>
								<th scope="row" className="px-6 py-4 font-medium text-gray-900 flex flex-wrap">
									{data.Ingredients.map(di => {
										const ingredient = ingredientsData.find(i => i.Id === di.IngredientId);
										return ingredient !== undefined ? (
											<span key={`${data.Id}-${ingredient.Id}`} className={`${ingredient.InStock ? "bg-green-100 text-green-800" : "bg-pink-100 text-pink-800"} text-sm font-medium me-2 px-2.5 py-0.5 rounded whitespace-nowrap my-1`}>
												{ingredient.Name}
												<span className="ml-1 text-xs opacity-70">×{di.Servings}</span>
											</span>
										) : null
									})}
								</th>
								<th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
									<button type="button" onClick={() => FillInputs(data.Id)} className="text-white bg-yellow-700 hover:bg-yellow-800 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-3 py-2.5 me-2 mb-2 focus:outline-none">
										<FontAwesomeIcon icon={faPen} />
									</button>
									<button type="button" onClick={() => RemoveDish(data.Id)} className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-2.5 me-2 mb-2 focus:outline-none">
										<FontAwesomeIcon icon={faTrash} />
									</button>
								</th>
							</tr>
						)) : (
							<tr key="message-dish" className="bg-white border-b text-center">
								<th scope="row" colSpan={6} className="px-6 py-4 font-bold text-2xl text-gray-900 whitespace-nowrap bg-emerald-100">
									No records
								</th>
							</tr>
						)}
						<tr key={'formDishes'} className="bg-white border-b text-center">
							<td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
								<input
									className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
									name='Name'
									type="text"
									placeholder="Burrito"
									value={Name}
									onChange={e => setName(e.target.value)}
									required
								/>
							</td>
							<td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
								<input
									className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
									name='CreateDate'
									type="date"
									value={CreateDate}
									onChange={e => setCreateDate(e.target.value)}
									disabled={!isCreate()}
									required
								/>
							</td>
							<td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
								<select
									name="Type"
									value={Type}
									onChange={e => setType(e.target.value as DishType)}
									className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
								>
									{Object.values(DishType).map(t => (
										<option key={t} value={t}>{t}</option>
									))}
								</select>
							</td>
							<td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
							</td>
							<td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
								<div className='flex items-start flex-wrap gap-1 mb-1'>
									{Ingredients.length > 0 ? Ingredients.map(di => {
										const ingredient = ingredientsData.find(i => i.Id === di.IngredientId);
										return ingredient !== undefined ? (
											<span key={`formDishes-${ingredient.Id}`} className={`${ingredient.InStock ? "bg-green-100 text-green-800" : "bg-pink-100 text-pink-800"} flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded`}>
												{ingredient.Name}
												<input
													type="number"
													min="0.5"
													step="0.5"
													value={di.Servings}
													onChange={e => UpdateServings(ingredient.Id, Number(e.target.value))}
													className="w-10 text-center bg-white border border-current rounded text-xs px-1"
													title="Servings"
												/>
												<FontAwesomeIcon className='cursor-pointer' onClick={() => RemoveChipIngredient(ingredient.Id)} icon={faXmark} />
											</span>
										) : null
									}) : (
										<span className="bg-fuchsia-100 text-fuchsia-800 text-sm font-medium px-2.5 py-0.5 rounded">ingredient...</span>
									)}
								</div>
								<QuickSearch<Ingredient>
									items={ingredientsData.filter(i => !Ingredients.some(di => di.IngredientId === i.Id))}
									keyProp="Id"
									propsToSearch={['Name']}
									mainProp="Name"
									extraProps={[{
										value: 'InStock',
										format: (v) => v ? 'In stock' : 'No stock',
										styles: (v) => v ? 'text-green-600 font-medium' : 'text-pink-500 font-medium',
									}]}
									placeholder="Search ingredient..."
									maxResults={8}
									value={IngredientsInput}
									onChange={setIngredientsInput}
									onSelect={OpenIngredientModal}
								/>
							</td>
							<td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
								<button
									type="submit"
									className={`text-white ${isCreate() ? "bg-green-700 hover:bg-green-800 focus:ring-green-300" : "bg-yellow-700 hover:bg-yellow-800 focus:ring-yellow-300"} focus:ring-4 font-medium rounded-lg text-sm px-3 py-2.5 me-2 mb-2 focus:outline-none`}
								>
									<FontAwesomeIcon icon={isCreate() ? faAdd : faPen} />
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</form>
			<Pagination<Dish> Info={sortedData} setCurrentItems={setCurrentItems}></Pagination>
		{pendingIngredient && (
			<IngredientServingsModal
				ingredient={pendingIngredient}
				onConfirm={ConfirmIngredient}
				onCancel={() => setPendingIngredient(null)}
			/>
		)}
		</>
	)
}

export default Dishes
