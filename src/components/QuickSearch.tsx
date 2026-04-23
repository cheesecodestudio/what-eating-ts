import { useEffect, useRef, useState } from 'react'

interface ExtraPropConfig<T> {
	value: keyof T
	format: (value: unknown) => string
	styles: string | ((value: unknown) => string)
}

interface QuickSearchProps<T> {
	items: T[]
	keyProp: keyof T
	propsToSearch: (keyof T)[]
	mainProp: keyof T
	extraProps?: ExtraPropConfig<T>[]
	onSelect: (item: T) => void
	placeholder?: string
	maxResults?: number
	value: string
	onChange: (text: string) => void
	disabled?: boolean
}

/** Normalizes and checks if haystack contains needle (accent/case-insensitive). */
const matchText = (haystack: string, needle: string): boolean => {
	const normalize = (s: string) =>
		s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
	return normalize(haystack).includes(normalize(needle))
}

/** Relevance score — lower is better. */
const scoreMatch = (text: string, query: string): number => {
	const n = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
	const q = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
	if (!q) return Infinity
	if (n === q) return 0
	if (n.startsWith(q)) return 1
	if (q.split(' ').every(w => n.includes(w))) return 2
	if (n.includes(q)) return 3
	return Infinity
}

/** Wraps matching substring in a yellow highlight span. */
function Highlight({ text, query }: { text: string; query: string }) {
	if (!query.trim()) return <>{text}</>
	const q = query.trim()
	const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
	const parts = text.split(regex)
	return (
		<>
			{parts.map((part, i) =>
				part.toLowerCase() === q.toLowerCase()
					? <span key={i} className="bg-yellow-200 font-bold">{part}</span>
					: part
			)}
		</>
	)
}

function QuickSearch<T>({
	items,
	keyProp,
	propsToSearch,
	mainProp,
	extraProps,
	onSelect,
	placeholder = 'Search...',
	maxResults = 10,
	value,
	onChange,
	disabled = false,
}: QuickSearchProps<T>) {
	const [show, setShow] = useState(false)
	const [selected, setSelected] = useState(-1)
	const inputRef = useRef<HTMLInputElement>(null)
	const listRef = useRef<HTMLDivElement>(null)

	const filtered = (value.trim().length > 0
		? items
			.filter(item => propsToSearch.some(prop => matchText(String(item[prop] ?? ''), value)))
			.sort((a, b) => scoreMatch(String(a[mainProp]), value) - scoreMatch(String(b[mainProp]), value))
		: items
	).slice(0, maxResults)

	// Auto-select first result when list changes
	useEffect(() => {
		setSelected(show && filtered.length > 0 ? 0 : -1)
	}, [show, filtered.length])

	// Close on outside click
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (
				listRef.current && !listRef.current.contains(e.target as Node) &&
				inputRef.current && !inputRef.current.contains(e.target as Node)
			) {
				setShow(false)
				setSelected(-1)
			}
		}
		document.addEventListener('mousedown', handler)
		return () => document.removeEventListener('mousedown', handler)
	}, [])

	const handleSelect = (item: T) => {
		if (disabled) return
		onSelect(item)
		onChange('')
		setShow(false)
		setSelected(-1)
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!show || filtered.length === 0) return
		if (e.key === 'ArrowDown') {
			e.preventDefault()
			setSelected(prev => (prev < filtered.length - 1 ? prev + 1 : 0))
		} else if (e.key === 'ArrowUp') {
			e.preventDefault()
			setSelected(prev => (prev > 0 ? prev - 1 : filtered.length - 1))
		} else if (e.key === 'Enter' && !disabled) {
			e.preventDefault()
			if (selected >= 0 && selected < filtered.length) handleSelect(filtered[selected])
		} else if (e.key === 'Escape') {
			setShow(false)
			setSelected(-1)
		}
	}

	return (
		<div className="relative w-full">
			<input
				ref={inputRef}
				type="text"
				placeholder={placeholder}
				value={value}
				disabled={disabled}
				autoComplete="off"
				className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
				onFocus={() => setShow(true)}
				onChange={e => { onChange(e.target.value); setShow(true) }}
				onKeyDown={handleKeyDown}
			/>
			{show && !disabled && (
				<div
					ref={listRef}
					className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-52 overflow-y-auto"
				>
					{filtered.length === 0 ? (
						<div className="px-3 py-2 text-sm text-gray-500">No results</div>
					) : (
						filtered.map((item, idx) => {
							const mainText = String(item[mainProp])
							return (
								<div
									key={String(item[keyProp] ?? idx)}
									className={`px-3 py-2 flex justify-between items-center cursor-pointer ${selected === idx ? 'bg-blue-50' : 'hover:bg-blue-50'}`}
									onClick={() => handleSelect(item)}
									onMouseEnter={() => setSelected(idx)}
								>
									<div>
										<span className="text-sm text-gray-900">
											<Highlight text={mainText} query={value} />
										</span>
										{extraProps && extraProps.length > 0 && (
											<div className="text-xs text-gray-500 mt-0.5 flex gap-1 flex-wrap">
												{extraProps.map((cfg, i) => {
													const raw = item[cfg.value]
													if (raw == null) return null
													const formatted = cfg.format(raw)
													const cls = typeof cfg.styles === 'function' ? cfg.styles(raw) : cfg.styles
													return (
														<span key={i} className={cls}>
															{i > 0 && <span className="text-gray-300 mr-1">|</span>}
															<Highlight text={formatted} query={value} />
														</span>
													)
												})}
											</div>
										)}
									</div>
									<button
										type="button"
										tabIndex={-1}
										className="ml-2 text-xs text-blue-600 hover:underline shrink-0"
										onClick={e => { e.stopPropagation(); handleSelect(item) }}
									>
										Select
									</button>
								</div>
							)
						})
					)}
				</div>
			)}
		</div>
	)
}

export default QuickSearch
