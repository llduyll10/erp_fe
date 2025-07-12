/**
 * Stock Movements Hook
 * Manages stock movements list with pagination, search, and filtering
 */

import { useGetStockMovements } from "@/services/warehouse";
import { type ColDef, type ICellRendererParams } from "ag-grid-community";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import type { StockMovement } from "@/models/warehouse.model";
import type { GetStockMovementsRequest } from "@/interfaces/warehouse.interface";
import { usePagination } from "../common/usePagination";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { StockMovementType, StockMovementReason } from "@/enums/warehouse.enum";

// Movement Type Cell Renderer
const MovementTypeCellRenderer = (params: ICellRendererParams) => {
	const { value } = params;
	if (!value) return "-";

	const colorMap: Record<string, string> = {
		[StockMovementType.IN]: "bg-green-100 text-green-800",
		[StockMovementType.OUT]: "bg-red-100 text-red-800",
	};

	const labelMap: Record<string, string> = {
		[StockMovementType.IN]: "Nhập kho",
		[StockMovementType.OUT]: "Xuất kho",
	};

	return (
		<Badge className={colorMap[value] || "bg-gray-100 text-gray-800"}>
			{labelMap[value] || value}
		</Badge>
	);
};

// Product Info Cell Renderer
const ProductInfoCellRenderer = (params: ICellRendererParams) => {
	const { data } = params;
	const variant = data?.variant;
	
	if (!variant) return "-";

	return (
		<div className="flex flex-col gap-1">
			<div className="font-medium text-sm">
				{variant.product?.name || "-"}
			</div>
			<div className="text-xs text-muted-foreground">
				{variant.sku} • {variant.size} • {variant.color}
			</div>
		</div>
	);
};

// Quantity Cell Renderer
const QuantityCellRenderer = (params: ICellRendererParams) => {
	const { value, data } = params;
	if (!value) return "-";

	const type = data?.type;
	const colorClass = type === StockMovementType.IN ? "text-green-600" : "text-red-600";
	const prefix = type === StockMovementType.IN ? "+" : "-";

	return (
		<div className={`font-medium ${colorClass}`}>
			{prefix}{Number(value).toLocaleString()}
		</div>
	);
};

// Order Link Cell Renderer
const OrderLinkCellRenderer = (params: ICellRendererParams) => {
	const { data } = params;
	const order = data?.order;
	
	if (!order) return "-";

	return (
		<div className="text-sm">
			<div className="font-medium">{order.order_number}</div>
			<div className="text-xs text-muted-foreground">{order.status}</div>
		</div>
	);
};

// User Cell Renderer
const UserCellRenderer = (params: ICellRendererParams) => {
	const { data } = params;
	const user = data?.created_by_user;
	
	return (
		<div className="text-sm">
			{user?.name || "-"}
		</div>
	);
};

// Date Cell Renderer
const DateCellRenderer = (params: ICellRendererParams) => {
	const { value } = params;
	if (!value) return "-";

	const date = new Date(value);
	return (
		<div className="text-sm text-gray-600">
			{date.toLocaleDateString("vi-VN")} {date.toLocaleTimeString("vi-VN", { 
				hour: '2-digit', 
				minute: '2-digit' 
			})}
		</div>
	);
};

const useStockMovements = () => {
	const { t } = useTranslation("common");
	const [searchParams, setSearchParams] = useState<
		Omit<GetStockMovementsRequest, "page" | "limit" | "offset">
	>({});

	const pagination = usePagination({
		initialPage: 1,
		initialLimit: 10,
	});

	// Prepare query parameters
	const queryParams: GetStockMovementsRequest = {
		page: pagination.paginationState.current_page,
		limit: pagination.paginationState.records_per_page,
		...searchParams,
	};

	const {
		data: stockMovementsResponse,
		isLoading: isGetStockMovementsPending,
		error,
		refetch,
	} = useGetStockMovements(queryParams);

	// Update pagination state when data changes
	useEffect(() => {
		if (stockMovementsResponse) {
			pagination.updatePagination({
				current_page: stockMovementsResponse.pagination?.current_page || 1,
				records_per_page:
					stockMovementsResponse.pagination?.records_per_page || 10,
				total_pages: stockMovementsResponse.pagination?.total_pages || 0,
				total_records: stockMovementsResponse.pagination?.total_records || 0,
			});
		}
	}, [stockMovementsResponse, pagination.updatePagination]);

	const colDefs: ColDef<StockMovement>[] = [
		{
			headerName: "Loại",
			field: "type",
			width: 100,
			cellRenderer: MovementTypeCellRenderer,
		},
		{
			headerName: "Sản phẩm",
			field: "variant",
			flex: 2,
			minWidth: 200,
			cellRenderer: ProductInfoCellRenderer,
		},
		{
			headerName: "Số lượng",
			field: "quantity",
			width: 120,
			cellRenderer: QuantityCellRenderer,
		},
		{
			headerName: "Lý do",
			field: "reason",
			flex: 1,
			minWidth: 150,
		},
		{
			headerName: "Đơn hàng",
			field: "order",
			width: 140,
			cellRenderer: OrderLinkCellRenderer,
		},
		{
			headerName: "Người thực hiện",
			field: "created_by_user",
			width: 140,
			cellRenderer: UserCellRenderer,
		},
		{
			headerName: "Thời gian",
			field: "created_at",
			width: 160,
			cellRenderer: DateCellRenderer,
		},
	];

	// Search and filter functions
	const setSearch = (search: string) => {
		setSearchParams((prev) => ({ ...prev, q: search }));
		pagination.setPage(1); // Reset to first page when searching
	};

	const setTypeFilter = (type: StockMovementType) => {
		setSearchParams((prev) => ({ ...prev, type }));
		pagination.setPage(1); // Reset to first page when filtering
	};

	const setReasonTypeFilter = (reason_type: StockMovementReason) => {
		setSearchParams((prev) => ({ ...prev, reason_type }));
		pagination.setPage(1); // Reset to first page when filtering
	};

	const setVariantFilter = (variant_id: string) => {
		setSearchParams((prev) => ({ ...prev, variant_id }));
		pagination.setPage(1); // Reset to first page when filtering
	};

	const setOrderFilter = (order_id: string) => {
		setSearchParams((prev) => ({ ...prev, order_id }));
		pagination.setPage(1); // Reset to first page when filtering
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
		stockMovements: stockMovementsResponse?.data || [],
		total: stockMovementsResponse?.pagination?.total_records || 0,
		isGetStockMovementsPending,
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
		setTypeFilter,
		setReasonTypeFilter,
		setVariantFilter,
		setOrderFilter,
		setSortBy,
		clearFilters,

		// Actions
		refetch,
	};
};

export default useStockMovements;