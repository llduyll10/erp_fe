import { PaginationState } from "@/interfaces/common.interface";
import { useState, useCallback } from "react";

interface UsePaginationProps {
	initialPage?: number;
	initialLimit?: number;
}

export const usePagination = ({
	initialPage = 1,
	initialLimit = 10,
}: UsePaginationProps = {}) => {
	const [paginationState, setPaginationState] = useState<PaginationState>({
		current_page: initialPage,
		records_per_page: initialLimit,
		total_pages: 0,
		total_records: 0,
	});

	const updatePagination = useCallback((newState: Partial<PaginationState>) => {
		setPaginationState((prev) => ({
			...prev,
			...newState,
		}));
	}, []);

	const setPage = useCallback(
		(page: number) => {
			updatePagination({ current_page: page });
		},
		[updatePagination]
	);

	const setLimit = useCallback(
		(limit: number) => {
			updatePagination({ current_page: 1, records_per_page: limit }); // Reset to first page when changing limit
		},
		[updatePagination]
	);

	const nextPage = useCallback(() => {
		if (paginationState.current_page < paginationState.total_pages) {
			setPage(paginationState.current_page + 1);
		}
	}, [paginationState.current_page, paginationState.total_pages, setPage]);

	const prevPage = useCallback(() => {
		if (paginationState.current_page > 1) {
			setPage(paginationState.current_page - 1);
		}
	}, [paginationState.current_page, setPage]);

	const goToFirstPage = useCallback(() => {
		setPage(1);
	}, [setPage]);

	const goToLastPage = useCallback(() => {
		setPage(paginationState.total_pages);
	}, [paginationState.total_pages, setPage]);

	const getOffset = useCallback(() => {
		return (
			(paginationState.current_page - 1) * paginationState.records_per_page
		);
	}, [paginationState.current_page, paginationState.records_per_page]);

	return {
		paginationState,
		updatePagination,
		setPage,
		setLimit,
		nextPage,
		prevPage,
		goToFirstPage,
		goToLastPage,
		getOffset,
		canGoNext: paginationState.current_page < paginationState.total_pages,
		canGoPrev: paginationState.current_page > 1,
	};
};
