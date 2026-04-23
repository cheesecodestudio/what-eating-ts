import { Dispatch, SetStateAction, useEffect, useState } from 'react';

const PAGE_SIZES = [8, 16, 24, 32] as const;
const DISPLAY_PAGES = 20;

type PaginationProps<T> = {
	Info: T[]
	setCurrentItems: Dispatch<SetStateAction<T[]>>
}

const Pagination = <T,>({ Info, setCurrentItems }: PaginationProps<T>) => {


	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState<number>(8);

	const pagesCount = Math.ceil(Info.length / pageSize);

	const changePage = (newPage: number) => {
		setCurrentPage(newPage);
	};

	const nextPage = () => {
		setCurrentPage((prevPageNumber) => Math.min(prevPageNumber + 1, pagesCount));
	};

	const prevPage = () => {
		setCurrentPage((prevPageNumber) => Math.max(prevPageNumber - 1, 1));
	};

	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = startIndex + pageSize;

	const getPaginationGroup = () => {
		let start = currentPage - Math.floor(DISPLAY_PAGES / 2);
		start = Math.max(start, 1);
		start = Math.min(start, Math.max(pagesCount - DISPLAY_PAGES + 1, 1));
		let totalGroups = Math.min(DISPLAY_PAGES, pagesCount);
		return new Array<number>(totalGroups).fill(0).map((_, idx) => start + idx);
	};

	const paginationGroup = getPaginationGroup();

	useEffect(() => {
		setCurrentPage(1);
	}, [pageSize]);

	useEffect(() => {
		setCurrentItems(Info.slice(startIndex, endIndex));
	}, [currentPage, Info, pageSize])

	return (
		<nav className="flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
			<div className="flex items-center gap-3 text-sm text-gray-500 mb-4 md:mb-0">
				<label htmlFor="page-size-select" className="whitespace-nowrap">Rows per page:</label>
				<select
					id="page-size-select"
					value={pageSize}
					onChange={e => setPageSize(Number(e.target.value))}
					className="border border-gray-300 rounded px-2 py-1 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500"
				>
					{PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
				</select>
				<span>Showing <span className="font-semibold text-gray-900">{pagesCount === 0 ? 0 : currentPage === 1 ? 1 : (currentPage - 1) * pageSize + 1}–{currentPage === pagesCount ? Info.length : Math.min(currentPage * pageSize, Info.length)}</span> of <span className="font-semibold text-gray-900">{Info.length}</span></span>
			</div>
			<ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
				<li>
					<button className='flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 disabled:text-gray-300' onClick={prevPage} disabled={currentPage === 1} aria-label={`Back to page ${currentPage - 1}`}>{'<'}</button>
				</li>
				{((paginationGroup.length != pagesCount) && currentPage - Math.floor(DISPLAY_PAGES / 2) > 1) && 
					<>
					<li>
						<button className='flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700' onClick={() => changePage(1)}>1</button>
					</li>
					<li>
						<span className='flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700'>...</span>
					</li>
					</>}
				{paginationGroup.map(pageNumber => (
					pageNumber <= pagesCount && (
						<button
							className={`flex items-center justify-center px-3 h-8 transition-all ease-in ${pageNumber === currentPage ? 'text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700' : 'leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700'}`}
							key={pageNumber}
							onClick={() => changePage(pageNumber)}
							disabled={pageNumber === currentPage}
							aria-label={`Page number ${pageNumber}`}
						>
							{pageNumber}
						</button>
					)
				))}
				{((paginationGroup.length != pagesCount) && currentPage + Math.floor(DISPLAY_PAGES / 2) <= pagesCount) &&
					<>
						<li>
							<span className='flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700'>...</span>
						</li>
						<li>
							<button className='flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700' onClick={() => changePage(pagesCount)}>{pagesCount}</button>
						</li>
					</>}
				<li>
					<button className='flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 disabled:text-gray-300' onClick={nextPage} disabled={currentPage === pagesCount} aria-label={`Continue to page ${currentPage + 1}`}>{'>'}</button>
				</li>
			</ul>
		</nav>
	);
};

export default Pagination;
