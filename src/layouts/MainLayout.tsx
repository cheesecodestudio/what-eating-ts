import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'

const MainLayout = () => {
	return (
		<div className="flex flex-col min-h-screen">
			<Header />
			<div className="flex flex-1">
				<Sidebar />
				<main className="flex-1 p-6 overflow-auto">
					<Outlet />
				</main>
			</div>
			<Footer />
		</div>
	)
}

export default MainLayout
