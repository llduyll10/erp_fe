import { ColDef } from "ag-grid-community";

type Option = {
	label: string;
	value: string;
};

type OrderDirection = "ASC" | "DESC";

type SearchParams = {
	q?: string;
};

type SortParams = {
	order_dir?: OrderDirection;
	order_column?: string;
};

type PaginationParams = {
	page?: number;
	limit?: number;
	search?: SearchParams;
	order_by?: SortParams[];
} & SearchParams;

type PaginationState = {
	current_page: number;
	records_per_page: number;
	total_pages: number;
	total_records: number;
	before_cursor?: string;
	after_cursor?: string;
};

type ApiListResponse<T> = {
	data: T[];
	pagination?: PaginationState;
};

type SortState = {
	columns: {
		column: string;
		direction: OrderDirection | undefined;
	}[];
};

interface CustomColDef extends ColDef {
	sortField?: string;
}

export type {
	Option,
	ApiListResponse,
	OrderDirection,
	PaginationParams,
	SearchParams,
	SortParams,
	SortState,
	CustomColDef,
	PaginationState,
};
