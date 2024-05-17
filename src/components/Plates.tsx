import { Dispatch, SetStateAction, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAdd, faPen, faSquareCheck, faSquareXmark, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons'
import { generarId, dateFormat } from '../utils/utils.ts'
import Pagination from './Pagination'
import type { Plate, Ingredient } from '../types'
import { PlateType } from '../enums/Enums.ts'

type PlatesProps = {
	platesData: Plate[]
	setPlatesData: Dispatch<SetStateAction<Plate[]>>
	ingredientsData: Ingredient[]
	CheckPlates: (plates: Plate[] | void) => void
}

const Plates = ({
	platesData,
	setPlatesData,
	ingredientsData,
	CheckPlates
}: PlatesProps) => {
	const [Id, setId] = useState('')
	const [Name, setName] = useState('')
	const [CreateDate, setCreateDate] = useState('')
	const [Type, setType] = useState(PlateType.Every)
	const [IngredientsInput, setIngredientsInput] = useState('')
	const [Ingredients, setIngredients] = useState<string[]>([])
	const [CurrentItems, setCurrentItems] = useState<Plate[]>([])

	const CODE_TO_ADDCHIP = 'Space';

	const isCreate = () => Id === '';

	const AddChipIngredient = (code: string) => {
		if (code === CODE_TO_ADDCHIP) {
			const ingredientExist: number = ingredientsData.findIndex(ingredient => ingredient.Name.toLowerCase() === IngredientsInput.trim().toLocaleLowerCase());
			if (ingredientExist >= 0) {
				const idExist: number = Ingredients.findIndex(id => id === ingredientsData[ingredientExist].Id);
				if(idExist < 0){
					setIngredients([...Ingredients, ingredientsData[ingredientExist].Id]);
					setIngredientsInput("");
				}
			}
		}
	}

	const RemoveChipIngredient = (id: Ingredient['Id']) => {
		setIngredients(Ingredients.filter(i => i !== id));
	}

	const HandleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		let plateExist = platesData.findIndex(plate => plate.Id === Id);

		let updatePlates = [...platesData];
		if (plateExist >= 0) {
			updatePlates[plateExist].Name = Name;
			updatePlates[plateExist].Type = Type;
			updatePlates[plateExist].Ingredients = Ingredients;
			setPlatesData(updatePlates);
		}
		else {
			let newPlate: Plate = {
				Id: `P-${generarId()}`,
				Name,
				CreateDate,
				Type,
				CanMake: false,
				Ingredients
			};
			updatePlates = [newPlate, ...platesData];
			setPlatesData(updatePlates);
		}
		CheckPlates(updatePlates);

		//clean inputs
		setId('');
		setName('');
		setCreateDate('');
		setType(PlateType.Every);
		setIngredients([]);
	}

	const FillInputs = (id: Plate['Id']) => {
		const plate = platesData.find(plate => plate.Id === id);
		if (plate !== undefined) {
			setId(plate.Id);
			setName(plate.Name);
			setCreateDate(plate.CreateDate);
			setType(plate.Type);
			setIngredients(plate.Ingredients);
		}
	}

	const RemovePlate = (id: Plate['Id']) => {
		const plate = platesData.find(plate => plate.Id === id);
		if (plate !== undefined) {
			const answer = confirm(`Would you like to remove "${plate.Name}" plate?`)
			if (answer) {
				const removePlate = platesData.filter(i => i.Id !== plate.Id);
				setPlatesData(removePlate);
			}
		}
	}

	return (
		<>
			<h1 className='text-2xl font-bold underline text-purple-700'>Plates</h1>
			<form onSubmit={HandleSubmit}>
				<table className='w-full text-lg text-left rtl:text-right text-gray-500'>
					<thead className='text-2xl text-gray-700 uppercase bg-gray-50  text-center'>
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
									{data.Ingredients.map(id => {
										const ingredient = ingredientsData.find(ingredientInfo => ingredientInfo.Id === id);
										return ingredient !== undefined ? (
											<span key={`${data.Id}-${ingredient.Id}`} className={`${ingredient.InStock ? "bg-green-100 text-green-800" : "bg-pink-100 text-pink-800"} text-sm font-medium me-2 px-2.5 py-0.5 rounded whitespace-nowrap my-1`}>{ingredient.Name}</span>
										) : (<></>)
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
									{Ingredients.length > 0 ? Ingredients.map(id => {
										const ingredient = ingredientsData.find(ingredientInfo => ingredientInfo.Id === id);
										return ingredient !== undefined ? (
											<span key={`formPlates-${ingredient.Id}`} className={`${ingredient.InStock ? "bg-green-100 text-green-800" : "bg-pink-100 text-pink-800"} text-sm font-medium me-2 px-2.5 py-0.5 rounded my-1`}>
												{ingredient.Name}
												<FontAwesomeIcon className='pl-1 cursor-pointer' onClick={() => RemoveChipIngredient(ingredient.Id)} icon={faXmark} />
											</span>
										) : (<></>)
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