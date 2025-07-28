/**
 * Stock Out History Hook
 * Manages stock out movements list with pagination, search, and filtering
 */

import { useGetStockMovements } from "@/services/warehouse";
import { type ColDef, type ICellRendererParams } from "ag-grid-community";
import { useEffect, useState } from "react";
import type { StockMovement } from "@/models/warehouse.model";
import type { GetStockMovementsRequest } from "@/interfaces/warehouse.interface";
import { usePagination } from "../common/usePagination";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { StockMovementType, StockMovementReason } from "@/enums/warehouse.enum";
import { OptimizedImage } from "@/components/molecules/optimized-image";
import { ImageIcon, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

// Product Info Cell Renderer (same as Stock In)
const ProductInfoCellRenderer = (params: ICellRendererParams) => {
	const { data } = params;
	const variant = data?.variant;

	if (!variant) return "-";

	const imageKey = variant.file_key || 
					 variant.product_file_key || 
					 variant.product?.file_key;

	return (
		<div className="flex items-center gap-3">
			<div className="flex-shrink-0">
				<OptimizedImage
					fileKey={imageKey}
					alt={variant.variant_name || variant.display_name || variant.product?.name}
					className="w-10 h-10 rounded-md object-cover border border-gray-200"
					showLoading={false}
					fallbackComponent={
						<div className="w-10 h-10 rounded-md border border-gray-200 flex items-center justify-center bg-gray-50">
							<ImageIcon className="w-5 h-5 text-gray-400" />
						</div>
					}
				/>
			</div>
			<div className="flex flex-col gap-1">
				<div className="font-medium text-sm">
					{variant.product?.name || variant.product_name || "-"}
				</div>
				<div className="text-xs text-muted-foreground">
					<span className="font-mono">{variant.sku}</span>
					{variant.size && <span> • {variant.size}</span>}
					{variant.color && <span> • {variant.color}</span>}
				</div>
			</div>
		</div>
	);
};

// Quantity Cell Renderer for Stock Out
const QuantityCellRenderer = (params: ICellRendererParams) => {
	const { value } = params;
	if (!value) return "-";

	return (
		<div className="font-medium text-red-600">
			-{Number(value).toLocaleString()}
		</div>
	);
};

// Reason Cell Renderer
const ReasonCellRenderer = (params: ICellRendererParams) => {
	const { data } = params;
	const reasonType = data?.reason_type;
	const reason = data?.reason;

	const reasonLabels: Record<string, string> = {
		[StockMovementReason.SALES_ORDER]: "Bán hàng",
		[StockMovementReason.PRODUCTION_MATERIAL]: "Nguyên liệu SX",
		[StockMovementReason.DAMAGED_GOODS]: "Hàng hỏng",
		[StockMovementReason.INVENTORY_ADJUSTMENT_OUT]: "Điều chỉnh -",
		[StockMovementReason.TRANSFER_OUT]: "Chuyển kho ra",
		[StockMovementReason.SAMPLE_GOODS]: "Hàng mẫu",
		[StockMovementReason.OTHER]: "Khác",
	};

	return (
		<div className="flex flex-col gap-1">
			{reasonType && (
				<Badge variant="outline" className="w-fit text-xs">
					{reasonLabels[reasonType] || reasonType}
				</Badge>
			)}
			{reason && (
				<div className="text-xs text-muted-foreground">
					{reason}
				</div>
			)}
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
			<div className="font-medium text-blue-600 cursor-pointer hover:underline">
				{order.order_number}
			</div>
			<div className="text-xs text-muted-foreground">
				{order.status}
			</div>
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
		<div className="text-sm">
			<div>{date.toLocaleDateString("vi-VN")}</div>
			<div className="text-xs text-muted-foreground">
				{date.toLocaleTimeString("vi-VN", { 
					hour: '2-digit', 
					minute: '2-digit' 
				})}
			</div>
		</div>
	);
};

// Actions Cell Renderer
const ActionsCellRenderer = (params: ICellRendererParams) => {
	const { data } = params;

	const handleViewDetail = () => {
		if (params.context?.onViewDetail) {
			params.context.onViewDetail(data);
		}
	};

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={handleViewDetail}
			className="h-8 w-8 p-0"
		>
			<Eye className="h-4 w-4" />
		</Button>
	);
};

const useStockOutHistory = () => {
	const { t } = useTranslation("common");
	const [searchParams, setSearchParams] = useState<
		Omit<GetStockMovementsRequest, "page" | "limit" | "offset">
	>({
		type: StockMovementType.OUT, // Only show stock out movements
	});

	const pagination = usePagination({
		initialPage: 1,
		initialLimit: 20,
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
					stockMovementsResponse.pagination?.records_per_page || 20,
				total_pages: stockMovementsResponse.pagination?.total_pages || 0,
				total_records: stockMovementsResponse.pagination?.total_records || 0,
			});
		}
	}, [stockMovementsResponse, pagination.updatePagination]);

	const colDefs: ColDef<StockMovement>[] = [
		{
			headerName: "Sản phẩm",
			field: "variant",
			flex: 2,
			minWidth: 250,
			cellRenderer: ProductInfoCellRenderer,
		},
		{
			headerName: "Số lượng",
			field: "quantity",
			width: 120,
			cellRenderer: QuantityCellRenderer,
		},
		{
			headerName: "Lý do xuất",
			field: "reason_type",
			flex: 1,
			minWidth: 150,
			cellRenderer: ReasonCellRenderer,
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
			width: 120,
			cellRenderer: DateCellRenderer,
		},
		{
			headerName: "Thao tác",
			width: 80,
			cellRenderer: ActionsCellRenderer,
			sortable: false,
			pinned: "right",
		},
	];

	// Search and filter functions
	const setSearch = (search: string) => {
		setSearchParams((prev) => ({ ...prev, q: search }));
		pagination.setPage(1);
	};

	const setReasonTypeFilter = (reason_type: StockMovementReason) => {
		setSearchParams((prev) => ({ ...prev, reason_type }));
		pagination.setPage(1);
	};

	const setVariantFilter = (variant_id: string) => {
		setSearchParams((prev) => ({ ...prev, variant_id }));
		pagination.setPage(1);
	};

	const setOrderFilter = (order_id: string) => {
		setSearchParams((prev) => ({ ...prev, order_id }));
		pagination.setPage(1);
	};

	const setSortBy = (sortBy: string, sortOrder: "asc" | "desc") => {
		setSearchParams((prev) => ({ ...prev, sortBy, sortOrder }));
	};

	const clearFilters = () => {
		setSearchParams({ type: StockMovementType.OUT });
		pagination.setPage(1);
	};

	// Calculate total quantity for today
	const todayTotal = (() => {
		const today = new Date().toDateString();
		const movements = stockMovementsResponse?.data || [];
		
		return movements
			.filter(m => {
				if (!m.created_at) return false;
				const moveDate = new Date(m.created_at).toDateString();
				return moveDate === today;
			})
			.reduce((sum, m) => sum + (m.quantity || 0), 0);
	})();

	return {
		// Data
		stockMovements: stockMovementsResponse?.data || [],
		total: stockMovementsResponse?.pagination?.total_records || 0,
		todayTotal,
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
		setReasonTypeFilter,
		setVariantFilter,
		setOrderFilter,
		setSortBy,
		clearFilters,

		// Actions
		refetch,
	};
};

export default useStockOutHistory;