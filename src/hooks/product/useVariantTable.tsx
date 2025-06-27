import { type ColDef, type ICellRendererParams } from "ag-grid-community";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { usePagination } from "@/hooks/common/usePagination";
import { useGetVariantList } from "@/services/product";
import { ProductVariant } from "@/models/product-variant.model";
import { GetVariantListRequest } from "@/interfaces/product.interface";
import {
	ProductColor,
	ProductGender,
	ProductSize,
	ProductUnit,
} from "@/enums/product.enum";
import { Image } from "@/components/ui/image";
import { ImageIcon } from "lucide-react";

const useVariantTable = (productId?: string) => {
	const [searchParams, setSearchParams] = useState<
		Omit<GetVariantListRequest, "page" | "limit" | "offset">
	>({});

	const pagination = usePagination({
		initialPage: 1,
		initialLimit: 20,
	});

	// Prepare query parameters
	const queryParams: GetVariantListRequest = {
		page: pagination.paginationState.current_page,
		limit: pagination.paginationState.records_per_page,
		product_id: productId,
		...searchParams,
	};

	const {
		data: variantListResponse,
		isLoading: isGetVariantListPending,
		error,
		refetch,
	} = useGetVariantList(queryParams);

	// Update pagination state when data changes
	useEffect(() => {
		if (variantListResponse) {
			pagination.updatePagination({
				current_page: variantListResponse.pagination?.current_page || 1,
				records_per_page:
					variantListResponse.pagination?.records_per_page || 20,
				total_pages: variantListResponse.pagination?.total_pages || 0,
				total_records: variantListResponse.pagination?.total_records || 0,
			});
		}
	}, [variantListResponse, pagination.updatePagination]);

	const colDefs: ColDef<ProductVariant>[] = [
		{
			headerName: "Image",
			field: "file_key",
			width: 80,
			cellRenderer: (params: ICellRendererParams) => {
				return (
					<div className="flex items-center justify-center h-full">
						{params.data.file_key ?
							<Image
								fileKey={params.data.file_key}
								alt="Variant Image"
								className="w-10 h-10 rounded-md object-cover"
							/>
						:	<div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
								<ImageIcon className="w-6 h-6 text-gray-400" />
							</div>
						}
					</div>
				);
			},
			sortable: false,
			resizable: false,
		},
		{
			headerName: "SKU",
			field: "sku",
			flex: 1,
		},
		{
			headerName: "Size",
			field: "size",
			width: 100,
			valueFormatter: (params) => params.value || "-",
		},
		{
			headerName: "Color",
			field: "color",
			width: 100,
			valueFormatter: (params) => params.value || "-",
		},
		{
			headerName: "Gender",
			field: "gender",
			width: 100,
			valueFormatter: (params) => params.value || "-",
		},
		{
			headerName: "Price",
			field: "price",
			width: 120,
			valueFormatter: (params) =>
				params.value ? `$${params.value.toFixed(2)}` : "$0.00",
		},
		{
			headerName: "Cost",
			field: "cost",
			width: 120,
			valueFormatter: (params) =>
				params.value ? `$${params.value.toFixed(2)}` : "$0.00",
		},
		{
			headerName: "Unit",
			field: "unit",
			width: 100,
		},
		{
			headerName: "Quantity",
			field: "quantity",
			width: 100,
			valueFormatter: (params) => params.value || 0,
		},
		{
			headerName: "Status",
			field: "status",
			width: 120,
		},
		{
			headerName: "Created At",
			field: "created_at",
			width: 150,
			cellRenderer: (params: ICellRendererParams) =>
				params.data.created_at ?
					dayjs(params.data.created_at).format("DD/MM/YYYY HH:mm")
				:	"",
		},
		{
			headerName: "Updated At",
			field: "updated_at",
			width: 150,
			cellRenderer: (params: ICellRendererParams) =>
				params.data.updated_at ?
					dayjs(params.data.updated_at).format("DD/MM/YYYY HH:mm")
				:	"",
		},
	];

	// Search and filter functions
	const setSearch = (search: string) => {
		setSearchParams((prev) => ({ ...prev, q: search }));
		pagination.setPage(1); // Reset to first page when searching
	};

	const setColorFilter = (color: ProductColor) => {
		setSearchParams((prev) => ({ ...prev, color }));
		pagination.setPage(1);
	};

	const setSizeFilter = (size: ProductSize) => {
		setSearchParams((prev) => ({ ...prev, size }));
		pagination.setPage(1);
	};

	const setGenderFilter = (gender: ProductGender) => {
		setSearchParams((prev) => ({ ...prev, gender }));
		pagination.setPage(1);
	};

	const setUnitFilter = (unit: ProductUnit) => {
		setSearchParams((prev) => ({ ...prev, unit }));
		pagination.setPage(1);
	};

	const setStatusFilter = (status: string) => {
		setSearchParams((prev) => ({ ...prev, status }));
		pagination.setPage(1);
	};

	const setSortBy = (sortBy: string, sortOrder: "asc" | "desc") => {
		setSearchParams((prev) => ({ ...prev, sortBy, sortOrder }));
	};

	const clearFilters = () => {
		setSearchParams({});
		pagination.setPage(1);
	};

	return {
		// Data
		variantList: variantListResponse?.data || [],
		total: variantListResponse?.pagination?.total_records || 0,
		isGetVariantListPending,
		error,
		colDefs,

		// Pagination
		pagination: pagination.paginationState,
		setPage: pagination.setPage,
		setLimit: pagination.setLimit,
		nextPage: pagination.nextPage,
		prevPage: pagination.prevPage,
		goToFirstPage: pagination.goToFirstPage,
		goToLastPage: pagination.goToLastPage,
		canGoNext: pagination.canGoNext,
		canGoPrev: pagination.canGoPrev,

		// Search and filters
		searchParams,
		setSearch,
		setColorFilter,
		setSizeFilter,
		setGenderFilter,
		setUnitFilter,
		setStatusFilter,
		setSortBy,
		clearFilters,

		// Actions
		refetch,
	};
};

export default useVariantTable;
