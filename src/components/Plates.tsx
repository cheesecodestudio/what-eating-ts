import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAdd, faPen, faSquareCheck, faSquareXmark, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons'
import { dateFormat } from '../utils/utils.ts'
import { apiPost, apiPut, apiDelete } from '../hooks/useApi.ts'
import Pagination from './Pagination'
import type { Plate, Ingredient, PlateIngredient } from '../types'
import { PlateType } from '../enums/Enums.ts'

type PlatesProps = {
	platesData: Plate[]
	ingredientsData: Ingredient[]
	onRefetch: () => void
}

const Plates = ({ platesData, ingredientsData, onRefetch }: PlatesProps) => {
	const [Id, setId] = useState('')
	const [Name, setName] = useState('')
	const [CreateDate, setCreateDate] = useState('')
	const [Type, setType] = useState(PlateType.Every)
	const [IngredientsInput, setIngredientsInput] = useState('')
	const [Ingredients, setIngredients] = useState<PlateIngredient[]>([])
	const [CurrentItems, setCurrentItems] = useState<Plate[]>([])

	const CODE_TO_ADDCHIP = 'Space';

	const isCreate = () => Id === '';

	const clearForm = () => {
		setId('');
		setName('');
		setCreateDate('');
		setType(PlateType.Every);
		setIngredients([]);
	}

	const AddChipIngredient = (code: string) => {
		if (code === CODE_TO_ADDCHIP) {
			const found = ingredientsData.find(i => i.Name.toLowerCase() === IngredientsInput.trim().toLowerCase());
			if (found) {
				const alreadyAdded = Ingredients.some(pi => pi.IngredientId === found.Id);
				if (!alreadyAdded) {
					setIngredients([...Ingredients, { IngredientId: found.Id, Quantity: 1, Unit: 'unit' }]);
					setIngredientsInput('');
				}
			}
		}
	}

	const RemoveChipIngredient = (ingredientId: string) => {
		setIngredients(Ingredients.filter(pi => pi.IngredientId !== ingredientId));
	}

	const HandleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		const payload = { Name, Type, Ingredients }
		try {
			if (isCreate()) {
				await apiPost<Plate>('/api/plates', payload)
			} else {
				await apiPut<Plate>(`/api/plates/${Id}`, payload)
			}
			onRefetch()
			clearForm()
		} catch (err) {
			alert((err as Error).message)
		}
	}

	const FillInputs = (id: Plate['Id']) => {
		const plate = platesData.find(p => p.Id === id);
		if (plate) {
			setId(plate.Id);
			setName(plate.Name);
			setCreateDate(plate.CreateDate);
			setType(plate.Type);
			setIngredients(plate.Ingredients);
		}
	}

	const RemovePlate = async (id: Plate['Id']) => {
		const plate = platesData.find(p => p.Id === id);
		if (plate) {
			const answer = confirm(`Would you like to remove "${plate.Name}" plate?`)
			if (answer) {
				try {
					await apiDelete(`/api/plates/${id}`)
					onRefetch()
				} catch (err) {
					alert((err as Error).message)
				}
			}
		}
	}

	return (
		<>
			<h1 className='text-2xl font-bold underline text-purple-700'>Plates</h1>
			<form onSubmit={HandleSubmit}>
				<table className='w-full text-lg text-left rtl:text-right text-gray-500'>
					<thead className='text-2xl text-gray-700 uppercase bg-gray-50 text-center'>
						<tr>
							<th scope="col" className="px-6 py-3">Name</th>
							<th scope="col" className="px-6 py-3">Date</th>
							<th scope="col" className="px-6 py-3">Type</th>
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
									{data.Ingredients.map(pi => {
										const ingredient = ingredientsData.find(i => i.Id === pi.IngredientId);
										return ingredient !== undefined ? (
											<span key={`${data.Id}-${ingredient.Id}`} className={`${ingredient.InStock ? "bg-green-100 text-green-800" : "bg-pink-100 text-pink-800"} text-sm font-medium me-2 px-2.5 py-0.5 rounded whitespace-nowrap my-1`}>{ingredient.Name}</span>
										) : null
									})}
								</th>
								<th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
									<button type="button" onClick={() => FillInputs(data.Id)} className="text-white bg-yellow-700 hover:bg-yellow-800 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-3 py-2.5 me-2 mb-2 focus:outline-none">
										<FontAwesomeIcon icon={faPen} />
									</button>
									<button type="button" onClick={() => RemovePlate(data.Id)} className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-2.5 me-2 mb-2 focus:outline-none">
										<FontAwesomeIcon icon={faTrash} />
									</button>
								</th>
							</tr>
						)) : (
							<tr key="message-plate" className="bg-white border-b text-center">
								<th scope="row" colSpan={6} className="px-6 py-4 font-bold text-2xl text-gray-900 whitespace-nowrap bg-emerald-100">
									No records
								</th>
							</tr>
						)}
						<tr key={'formPlates'} className="bg-white border-b  text-center">
							<td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
								<input
									className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
									id="name-field"
									name='Name'
									type="text"
									placeholder="Burrito with Fries"
									value={Name}
									onChange={e => setName(e.target.value)}
									required
								/>
							</td>
							<td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
								<input
									className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
									id="name-field"
									name='CreateDate'
									type="date"
									value={CreateDate}
									onChange={e => setCreateDate(e.target.value)}
									disabled={!isCreate()}
									required
								/>
							</td>
							<td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
								<select name="Type" id="plate-type" value={Type} onChange={e => setType(e.target.value as PlateType)}>
									<option value={PlateType.Every}>{PlateType.Every}</option>
									<option value={PlateType.Breakfast}>{PlateType.Breakfast}</option>
									<option value={PlateType.Meat}>{PlateType.Meat}</option>
									<option value={PlateType.NoMeat}>{PlateType.NoMeat}</option>
									<option value={PlateType.FastFood}>{PlateType.FastFood}</option>
								</select>
							</td>
							<td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
							</td>
							<td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
								<div className='flex items-start flex-wrap'>
									{Ingredients.length > 0 ? Ingredients.map(pi => {
										const ingredient = ingredientsData.find(i => i.Id === pi.IngredientId);
										return ingredient !== undefined ? (
											<span key={`formPlates-${ingredient.Id}`} className={`${ingredient.InStock ? "bg-green-100 text-green-800" : "bg-pink-100 text-pink-800"} text-sm font-medium me-2 px-2.5 py-0.5 rounded my-1`}>
												{ingredient.Name}
												<FontAwesomeIcon className='pl-1 cursor-pointer' onClick={() => RemoveChipIngredient(ingredient.Id)} icon={faXmark} />
											</span>
										) : null
									}) : (
										<span key="sample" className="bg-fuchsia-100 text-fuchsia-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded">ingredient...</span>
									)}
								</div>
								<input
									className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 m-1"
									id="name-field"
									name='Name'
									type="text"
									placeholder="Onion"
									value={IngredientsInput}
									onChange={e => setIngredientsInput(e.target.value)}
									onKeyUp={e => AddChipIngredient(e.code)}
								/>
							</td>
							<td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
								<button
									type="submit"
									className={`text-white ${isCreate() ? "bg-green-700 hover:bg-green-800 focus:ring-green-300" : "bg-yellow-700 hover:bg-yellow-800 focus:ring-yellow-300"} focus:ring-4  font-medium rounded-lg text-sm px-3 py-2.5 me-2 mb-2 focus:outline-none`}
								>
									<FontAwesomeIcon icon={isCreate() ? faAdd : faPen} />
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</form>
			<Pagination<Plate> Info={platesData} setCurrentItems={setCurrentItems}></Pagination>
		</>
	)
}

export default Plates