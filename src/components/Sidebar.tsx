import { NavLink } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faCarrot,
	faUtensils,
	faCalendarDay,
	faCalendarWeek,
	faCalendar,
	faCartShopping,
	faBullseye,
} from '@fortawesome/free-solid-svg-icons'

const links = [
	{ to: '/ingredients', label: 'Ingredients', icon: faCarrot },
	{ to: '/plates', label: 'Plates', icon: faUtensils },
	{ to: '/daily-menus', label: 'Daily Menus', icon: faCalendarDay },
	{ to: '/weekly-plans', label: 'Weekly Plans', icon: faCalendarWeek },
	{ to: '/monthly-plan', label: 'Monthly Plan', icon: faCalendar },
	{ to: '/shopping-list', label: 'Shopping List', icon: faCartShopping },
	{ to: '/nutrition-goals', label: 'Nutrition Goals', icon: faBullseye },
]

const Sidebar = () => {
	return (
		<aside className="w-56 min-h-screen bg-gray-900 text-white flex flex-col pt-6 shrink-0">
			<p className="px-6 pb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Menu</p>
			<nav className="flex flex-col gap-1 px-2">
				{links.map(({ to, label, icon }) => (
					<NavLink
						key={to}
						to={to}
						className={({ isActive }) =>
							`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
								isActive
									? 'bg-purple-700 text-white'
									: 'text-gray-300 hover:bg-gray-800 hover:text-white'
							}`
						}
					>
						<FontAwesomeIcon icon={icon} className="w-4" />
						{label}
					</NavLink>
				))}
			</nav>
		</aside>
	)
}

export default Sidebar
