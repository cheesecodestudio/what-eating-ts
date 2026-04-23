import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import IngredientsPage from './pages/IngredientsPage'
import DishesPage from './pages/DishesPage'
import ComingSoon from './components/ComingSoon'

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<MainLayout />}>
					<Route index element={<Navigate to="/ingredients" replace />} />
					<Route path="/ingredients" element={<IngredientsPage />} />
					<Route path="/dishes" element={<DishesPage />} />
					<Route path="/daily-menus" element={<ComingSoon title="Daily Menus" />} />
					<Route path="/weekly-plans" element={<ComingSoon title="Weekly Plans" />} />
					<Route path="/monthly-plan" element={<ComingSoon title="Monthly Plan" />} />
					<Route path="/shopping-list" element={<ComingSoon title="Shopping List" />} />
					<Route path="/nutrition-goals" element={<ComingSoon title="Nutrition Goals" />} />
				</Route>
			</Routes>
		</BrowserRouter>
	)
}

export default App
