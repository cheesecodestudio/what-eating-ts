import { useEffect, useState } from "react";
import type { Plate } from "../types";
import { PlateType } from "../enums/Enums";

type Button = {
	Type: PlateType
	Name: string
	Disabled: boolean
}

const useRuleta = (platesData: Plate[]) => {
	const [Buttons, setButtons] = useState<Button[]>([
		{ Type: PlateType.Breakfast, Name: PlateType.Breakfast, Disabled: false },
		{ Type: PlateType.Meat, Name: PlateType.Meat, Disabled: false },
		{ Type: PlateType.NoMeat, Name: PlateType.NoMeat, Disabled: false }
	])
	
	useEffect(() => {
		setButtons(Buttons.map(
			(button: Button) => {
				button.Disabled = platesData.filter(plate => (plate.Type === button.Type ||
					[PlateType.Every, PlateType.FastFood].includes(plate.Type)) &&
					plate.CanMake).length < 1;
				return button;
			}))
	}, [platesData])

	const RollButton = (button: Button) => {
		// let $audioClone = $('audio').clone()
		// $audioClone[0].play()
		let counter = 0;
		const platesType = platesData.filter(plate =>
			(plate.Type === button.Type ||
				[PlateType.Every, PlateType.FastFood].includes(plate.Type)) &&
			plate.CanMake);
		const maxIterations = platesType.length * (Math.random() * 5);  // Pasará por la lista 5 veces o menos
		// const intervalTime = Global.interval_button_time;  // Velocidad de la animación
		const intervalTime = 150;  // Velocidad de la animación

		const interval = setInterval(() => {
			setButtons(Buttons.map(b => {
				if (b.Type === button.Type) {
					button.Name = platesType[counter % platesType.length].Name;
					return button;
				}

				return b;
			}));
			counter++;

			if (counter >= maxIterations) {
				clearInterval(interval);
				setButtons(Buttons.map(b => {
					if (b.Type === button.Type) {
						button.Name = platesType[Math.floor(Math.random() * platesType.length)].Name;
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