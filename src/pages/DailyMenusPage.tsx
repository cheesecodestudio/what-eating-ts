import { useEffect, useMemo, useState } from 'react'
import DailyMenus from '../components/DailyMenus'
import { useApi, apiPost } from '../hooks/useApi'
import type { DailyMenuDetail, DailyMenuSummary, Dish } from '../types'

const DailyMenusPage = () => {
	const { data: dishes } = useApi<Dish[]>('/api/dishes')
	const { data: dailyMenus, loading, error, refetch } = useApi<DailyMenuSummary[]>('/api/daily-menus')
	const [selectedDailyMenuId, setSelectedDailyMenuId] = useState('')

	useEffect(() => {
		if (!dailyMenus || dailyMenus.length === 0) {
			setSelectedDailyMenuId('')
			return
		}

		const selectedExists = dailyMenus.some(menu => menu.Id === selectedDailyMenuId)
		if (!selectedDailyMenuId || !selectedExists) {
			setSelectedDailyMenuId(dailyMenus[0].Id)
		}
	}, [dailyMenus, selectedDailyMenuId])

	const hasMenus = useMemo(() => (dailyMenus ?? []).length > 0, [dailyMenus])

	const createDailyMenu = async () => {
		try {
			const created = await apiPost<DailyMenuDetail>('/api/daily-menus', {})
			await refetch()
			setSelectedDailyMenuId(created.Id)
		} catch (err) {
			alert((err as Error).message)
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-3">
				<h1 className="text-2xl font-bold underline text-purple-700">Daily Menus</h1>
				<button
					type="button"
					onClick={createDailyMenu}
					className="bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg text-sm px-4 py-2"
				>
					New daily menu
				</button>
			</div>

			{loading && <p className="text-sm text-gray-500">Loading daily menus...</p>}
			{error && <p className="text-sm text-red-600">Error loading daily menus: {error}</p>}

			{!loading && !error && !hasMenus && (
				<div className="rounded-xl border border-dashed border-gray-300 p-6 bg-white text-gray-600">
					<p className="text-base font-medium">No daily menus yet.</p>
					<p className="text-sm mt-1">Create one and start assigning dishes by meal with the dropdown.</p>
				</div>
			)}

			{!loading && !error && hasMenus && selectedDailyMenuId && (
				<DailyMenus
					dishesData={dishes ?? []}
					dailyMenusData={dailyMenus ?? []}
					selectedDailyMenuId={selectedDailyMenuId}
					onSelectDailyMenu={setSelectedDailyMenuId}
					onRefetchDailyMenus={refetch}
				/>
			)}
		</div>
	)
}

export default DailyMenusPage
