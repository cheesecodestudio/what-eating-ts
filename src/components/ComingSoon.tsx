const ComingSoon = ({ title }: { title: string }) => (
	<div className="flex flex-col items-center justify-center h-64 text-gray-400">
		<p className="text-4xl mb-4">🚧</p>
		<h2 className="text-2xl font-bold text-gray-700">{title}</h2>
		<p className="mt-2 text-sm">Coming soon</p>
	</div>
)

export default ComingSoon
