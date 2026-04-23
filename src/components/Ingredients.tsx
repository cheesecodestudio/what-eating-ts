import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAdd, faPen, faSquareCheck, faSquareXmark, faTrash } from '@fortawesome/free-solid-svg-icons'
import { dateFormat } from '../utils/utils.ts'
import { apiPost, apiPut, apiDelete } from '../hooks/useApi.ts'
import Pagination from './Pagination'
import type { Ingredient } from "../types"
import { FoodGroup, PortionUnit } from '../enums/Enums.ts'

type IngredientsProps = {
	ingredientsData: Ingredient[]
	onRefetch: () => void
}

const Ingredients = ({ ingredientsData, onRefetch }: IngredientsProps) => {
	const [Id, setId] = useState('')
	const [Name, setName] = useState('')
	const [CreateDate, setCreateDate] = useState('')
	const [InStock, setInStock] = useState(false)
	const [IngFoodGroup, setIngFoodGroup] = useState<FoodGroup | ''>('')
	const [PortionDescription, setPortionDescription] = useState('')
	const [IngPortionUnit, setIngPortionUnit] = useState<PortionUnit | ''>('')
	const [EquivalentServings, setEquivalentServings] = useState<number | ''>('')
	const [CurrentItems, setCurrentItems] = useState<Ingredient[]>([])

	const isCreate = () => Id === '';

	const clearForm = () => {
		setId('');
		setName('');
		setCreateDate('');
		setInStock(false);
		setIngFoodGroup('');
		setPortionDescription('');
		setIngPortionUnit('');
		setEquivalentServings('');
	}

	const HandleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		const payload = {
			Name,
			InStock,
			FoodGroup: IngFoodGroup || null,
			PortionDescription: PortionDescription || null,
			PortionUnit: IngPortionUnit || null,
			EquivalentServings: EquivalentServings === '' ? null : EquivalentServings,
		}
		try {
			if (isCreate()) {
				await apiPost<Ingredient>('/api/ingredients', payload)
			} else {
				await apiPut<Ingredient>(`/api/ingredients/${Id}`, payload)
			}
			onRefetch()
			clearForm()
		} catch (err) {
			alert((err as Error).message)
		}
	}

	const FillInputs = (id: Ingredient['Id']) => {
		const ingredient = ingredientsData.find(i => i.Id === id);
		if (ingredient) {
			setId(ingredient.Id);
			setName(ingredient.Name);
			setCreateDate(ingredient.CreateDate);
			setInStock(ingredient.InStock);
			setIngFoodGroup(ingredient.FoodGroup ?? '');
			setPortionDescription(ingredient.PortionDescription ?? '');
			setIngPortionUnit(ingredient.PortionUnit ?? '');
			setEquivalentServings(ingredient.EquivalentServings ?? '');
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

	return (
		<>
			<h1 className='text-2xl font-bold underline text-purple-700'>Ingredients</h1>
			<form onSubmit={HandleSubmit}>
				<table className='w-full text-lg text-left rtl:text-right text-gray-500'>
					<thead className='text-2xl text-gray-700 uppercase bg-gray-50 text-center'>
						<tr>
							<th scope="col" className="px-6 py-3">Name</th>
							<th scope="col" className="px-6 py-3">Date</th>
							<th scope="col" className="px-6 py-3">In Stock</th>
							<th scope="col" className="px-6 py-3">Food Group</th>
							<th scope="col" className="px-6 py-3">Portion</th>
							<th scope="col" className="px-6 py-3">Servings</th>
							<th scope="col" className="px-6 py-3">Actions</th>
						</tr>
					</thead>
					<tbody>
						{CurrentItems.length > 0 ? CurrentItems.map(data => (
							<tr key={data.Id} className="bg-white border-b text-center">
								<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
									{data.Name}
								</td>
								<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
									{dateFormat(data.CreateDate)}
								</td>
								<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
									{data.InStock ?
										<FontAwesomeIcon icon={faSquareCheck} className='text-green-800 px-2.5 py-0.5' size='2xl' /> :
										<FontAwesomeIcon icon={faSquareXmark} className='text-pink-800 px-2.5 py-0.5' size='2xl' />
									}
								</td>
								<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
									{data.FoodGroup ?? <span className="text-gray-400">—</span>}
								</td>
								<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
									{data.PortionDescription
										? `${data.PortionDescription}${data.PortionUnit ? ` (${data.PortionUnit})` : ''}`
										: <span className="text-gray-400">—</span>
									}
								</td>
								<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
									{data.EquivalentServings ?? <span className="text-gray-400">—</span>}
								</td>
								<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
									<button type="button" onClick={() => FillInputs(data.Id)} className="text-white bg-yellow-700 hover:bg-yellow-800 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-3 py-2.5 me-2 mb-2 focus:outline-none">
										<FontAwesomeIcon icon={faPen} />
									</button>
									<button type="button" onClick={() => RemoveIngredient(data.Id)} className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-2.5 me-2 mb-2 focus:outline-none">
										<FontAwesomeIcon icon={faTrash} />
									</button>
								</td>
							</tr>
						)) : (
							<tr key="message-ingredient" className="bg-white border-b text-center">
								<th scope="row" colSpan={7} className="px-6 py-4 font-bold text-2xl text-gray-900 whitespace-nowrap bg-emerald-100">
									No records
								</th>
							</tr>
						)}
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
									className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
									value={IngFoodGroup}
									onChange={e => setIngFoodGroup(e.target.value as FoodGroup | '')}
								>
									<option value="">— none —</option>
									{Object.values(FoodGroup).map(g => (
										<option key={g} value={g}>{g}</option>
									))}
								</select>
							</td>
							<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
								<input
									className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 mb-1"
									type="text"
									placeholder="half banana"
									value={PortionDescription}
									onChange={e => setPortionDescription(e.target.value)}
								/>
								<select
									className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
									value={IngPortionUnit}
									onChange={e => setIngPortionUnit(e.target.value as PortionUnit | '')}
								>
									<option value="">— unit —</option>
									{Object.values(PortionUnit).map(u => (
										<option key={u} value={u}>{u}</option>
									))}
								</select>
							</td>
							<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
								<input
									className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
									type="number"
									min="0"
									step="0.5"
									placeholder="1"
									value={EquivalentServings}
									onChange={e => setEquivalentServings(e.target.value === '' ? '' : Number(e.target.value))}
								/>
							</td>
							<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
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
			<Pagination<Ingredient> Info={ingredientsData} setCurrentItems={setCurrentItems}></Pagination>
		</>
	)
}

export default Ingredients