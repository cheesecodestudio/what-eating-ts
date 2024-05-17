import useRuleta from "../hooks/useRuleta"
import type { Plate } from "../types"

type RuletaProps = {
	platesData: Plate[]
}

const Ruleta = ({ platesData }: RuletaProps) => {
	const { RollButton, Buttons, RollAll } = useRuleta(platesData);
	return (
		<>
			<h1 className='text-2xl font-bold underline text-purple-700'>Ruleta</h1>
			<div>
				<button
					id="rollAll"
					className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 disabled:cursor-not-allowed disabled:bg-blue-100"
					onClick={RollAll}
				>
					Roll
				</button>
			</div>
			<div id="meals" className="flex flex-col items-center w-4/6 m-auto">
				{Buttons.map(button => (
					<div key={button.Type} className="flex flex-col w-full text-center">
						{button.Type}
						<button
							type="button"
							className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 disabled:cursor-not-allowed disabled:bg-blue-100"
							onClick={() => RollButton(button)}
							disabled={button.Disabled}
						>
							{button.Name}
						</button>
					</div>
				))}
			</div>
			<div>
				<button id="save">Save</button>
			</div>
		</>
	)
}

export default Ruleta