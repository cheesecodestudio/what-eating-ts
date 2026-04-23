import { useEffect, useState } from "react";
import type { Dish } from "../types";
import { DishType } from "../enums/Enums";

type Button = {
	Type: DishType
	Name: string
	Disabled: boolean
}

const useRuleta = (dishesData: Dish[]) => {
	const [Buttons, setButtons] = useState<Button[]>([
		{ Type: DishType.Breakfast, Name: DishType.Breakfast, Disabled: false },
		{ Type: DishType.Meat, Name: DishType.Meat, Disabled: false },
		{ Type: DishType.NoMeat, Name: DishType.NoMeat, Disabled: false }
	])
	
	useEffect(() => {
		setButtons(Buttons.map(
			(button: Button) => {
				button.Disabled = dishesData.filter(dish => (dish.Type === button.Type ||
					[DishType.Every, DishType.FastFood].includes(dish.Type)) &&
					dish.CanMake).length < 1;
				return button;
			}))
	}, [dishesData])

	const RollButton = (button: Button) => {
		// let $audioClone = $('audio').clone()
		// $audioClone[0].play()
		let counter = 0;
		const dishesType = dishesData.filter(dish =>
			(dish.Type === button.Type ||
				[DishType.Every, DishType.FastFood].includes(dish.Type)) &&
				dish.CanMake);
		const maxIterations = dishesType.length * (Math.random() * 5);  // Pasará por la lista 5 veces o menos
		// const intervalTime = Global.interval_button_time;  // Velocidad de la animación
		const intervalTime = 150;  // Velocidad de la animación

		const interval = setInterval(() => {
			setButtons(Buttons.map(b => {
				if (b.Type === button.Type) {
					button.Name = dishesType[counter % dishesType.length].Name;
					return button;
				}

				return b;
			}));
			counter++;

			if (counter >= maxIterations) {
				clearInterval(interval);
				setButtons(Buttons.map(b => {
					if (b.Type === button.Type) {
						button.Name = dishesType[Math.floor(Math.random() * dishesType.length)].Name;
						return button;
					}

					return b;
				}));
				// $audioClone[0].pause()
				// $audioClone[0].currentTime = 0;
			}
		}, intervalTime);
	}

	const RollAll = () => {
		Buttons.forEach((button) => {
			RollButton(button);
		})
	}

	return {
		RollButton,
		Buttons,
		RollAll
	}
}

export default useRuleta