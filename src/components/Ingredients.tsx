import { Dispatch, SetStateAction, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAdd, faPen, faSquareCheck, faSquareXmark, faTrash } from '@fortawesome/free-solid-svg-icons'
import { generarId, dateFormat } from '../utils/utils.ts'
import Pagination from './Pagination'
import type { Ingredient, Plate } from "../types"

type IngredientsProps = {
	ingredientsData: Ingredient[]
	setIngredientsData: Dispatch<SetStateAction<Ingredient[]>>
	CheckPlates: (plates: Plate[] | void) => void
	RemoveIngredientFromPlates: (ingredientId: string) => void
}

const Ingredients = ({
	ingredientsData,
	setIngredientsData,
	CheckPlates,
	RemoveIngredientFromPlates
}: IngredientsProps) => {
	const [Id, setId] = useState('')
	const [Name, setName] = useState('')
	const [CreateDate, setCreateDate] = useState('')
	const [InStock, setInStock] = useState(false)
	const [CurrentItems, setCurrentItems] = useState<Ingredient[]>([])

	const isCreate = () => Id === '';

	const HandleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		let ingredientExist = ingredientsData.findIndex(ingredient => ingredient.Id === Id);

		if (ingredientExist >= 0) {
			const updateIngredients = [...ingredientsData];
			updateIngredients[ingredientExist].Name = Name;
			updateIngredients[ingredientExist].InStock = InStock;
			setIngredientsData(updateIngredients);
		}
		else {
			let newIngredient = {
				Id: `I-${generarId()}`,
				Name,
				CreateDate,
				InStock
			};
			setIngredientsData([newIngredient, ...ingredientsData]);
		}
		
		CheckPlates();

		//clean inputs
		setId('');
		setName('');
		setCreateDate('');
		setInStock(false);
	}

	const FillInputs = (id:Ingredient['Id']) => {
		const ingredient = ingredientsData.find(ingredient => ingredient.Id === id);
		if(ingredient !== undefined){
			setId(ingredient.Id);
			setName(ingredient.Name);
			setCreateDate(ingredient.CreateDate);
			setInStock(ingredient.InStock);
		}
	}

	const RemoveIngredient = (id: Ingredient['Id']) => {
		const ingredient = ingredientsData.find(ingredient => ingredient.Id === id);
		if(ingredient !== undefined){
			const answer = confirm(`Would you like to remove "${ingredient.Name}" ingredient?`)
			if (answer) {
				const removeIngredient = ingredientsData.filter(i => i.Id !== ingredient.Id);
				setIngredientsData(removeIngredient);

				RemoveIngredientFromPlates(ingredient.Id);
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
							<th scope="col" className="px-6 py-3">Actions</th>
						</tr>
					</thead>
					<tbody>
						{CurrentItems.length > 0 ? CurrentItems.map(data => (
							<tr key={data.Id} className="bg-white border-b text-center">
								<td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
									{data.Name}
								</td>
								<td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
									{dateFormat(data.CreateDate)}
								</td>
								<td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
									{data.InStock ?
										<FontAwesomeIcon icon={faSquareCheck} className='text-green-800 px-2.5 py-0.5' size='2xl' /> :
										<FontAwesomeIcon icon={faSquareXmark} className='text-pink-800 px-2.5 py-0.5' size='2xl' />
									}
								</td>
								<td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
									<button type="button" onClick={() => FillInputs(data.Id)} className="text-white bg-yellow-700 hover:bg-yellow-800 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-3 py-2.5 me-2 mb-2 focus:outline-none">
										<FontAwesomeIcon icon={faPen} />
									</button>
									<button type="button" onClick={() => RemoveIngredient(data.Id)} className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-2.5 me-2 mb-2 focus:outline-none">
										<FontAwesomeIcon icon={faTrash} />
									</button>
								</td>
							</tr>
						)) : (
							<tr key="message-plate" className="bg-white border-b text-center">
								<th scope="row" colSpan={4} className="px-6 py-4 font-bold text-2xl text-gray-900 whitespace-nowrap bg-emerald-100">
									No records
								</th>
							</tr>
						)}
						<tr key={'formIngredient'} className="bg-white border-b  text-center">
							<td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
								<input
									className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
									id="name-field"
									name='Name'
									type="text"
									placeholder="Banana"
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
								<input
									id="in-stock-checkbox"
									type="checkbox" value=""
									className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
									name='InStock'
									checked={InStock}
									onChange={e => setInStock(e.target.checked)}
								/>
								<label htmlFor="in-stock-checkbox" className="ms-2 font-medium text-gray-900">In Stock</label>
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
			<Pagination<Ingredient> Info={ingredientsData} setCurrentItems={setCurrentItems}></Pagination>
		</>
	)
}

export default Ingredients