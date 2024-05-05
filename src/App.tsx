import { useState, useEffect } from 'react'
import { ingredientsDb } from './data/db_ingredients'
import { platesDb } from './data/db_plates'
import Header from './components/Header'
import Plates from './components/Plates'
import Ingredients from './components/Ingredients'
import Footer from './components/Footer'
import type { Ingredient, Plate } from "./types"

function App() {
	const [ingredientsData, setIngredientsData] = useState(ingredientsDb);
	const [platesData, setPlatesData] = useState(platesDb);

	const CheckPlates = (plates: Plate[] | void) => {
		if (!plates)
			plates = [...platesData];
		plates.forEach(CheckIngredients);
		setPlatesData(plates);
	}

	const CheckIngredients = (plate: Plate) => {
		plate.CanMake = plate.Ingredients.every((id: string) => {
			const ingredient = ingredientsData.find((ingredient: Ingredient) => ingredient.Id === id);			
			return ingredient !== undefined ? ingredient.InStock : false;
		});
	};

	const RemoveIngredientFromPlates = (ingredientId: string) => {
		const updatePlates = [...platesData];
		updatePlates.forEach(plate => {
			plate.Ingredients = plate.Ingredients.filter(id => id !== ingredientId);
		});

		setPlatesData(updatePlates);
	}

	useEffect(() => {
		platesDb.forEach(CheckIngredients);
		setPlatesData(platesDb);
	}, []);

	return (
		<>
			<Header></Header>
			<main className="container mx-auto px-4">
				<Plates platesData={platesData} setPlatesData={setPlatesData} ingredientsData={ingredientsData} CheckPlates={CheckPlates}></Plates>
				<Ingredients ingredientsData={ingredientsData} setIngredientsData={setIngredientsData} CheckPlates={CheckPlates} RemoveIngredientFromPlates={RemoveIngredientFromPlates}></Ingredients>
			</main>
			<Footer></Footer>
		</>
	)
}

export default App