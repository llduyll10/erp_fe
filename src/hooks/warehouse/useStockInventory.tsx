/**
 * Stock Inventory Hook
 * Manages stock inventory list with search and filtering
 */

import { useGetStockInventory } from "@/services/warehouse";
import { type ColDef, type ICellRendererParams } from "ag-grid-community";
import { useEffect, useState } from "react";
import type { StockSummary } from "@/models/warehouse.model";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/molecules/optimized-image";
import { ImageIcon, Package } from "lucide-react";
import { usePagination } from "../common/usePagination";

// Stock Level Cell Renderer
const StockLevelCellRenderer = (params: ICellRendererParams) => {
	const { value } = params;
	if (value === null || value === undefined) return "-";

	const stockLevel = Number(value);
	let badgeClass = "";
	let label = "";

	if (stockLevel === 0) {
		badgeClass = "bg-red-100 text-red-800";
		label = "Hết hàng";
	} else if (stockLevel < 10) {
		badgeClass = "bg-orange-100 text-orange-800";
		label = "Sắp hết";
	} else if (stockLevel < 50) {
		badgeClass = "bg-yellow-100 text-yellow-800";
		label = "Tồn kho thấp";
	} else {
		badgeClass = "bg-green-100 text-green-800";
		label = "Còn hàng";
	}

	return (
		<div className="flex items-center gap-2">
			<span className="font-medium">{stockLevel.toLocaleString()}</span>
			<Badge className={cn("text-xs", badgeClass)}>{label}</Badge>
		</div>
	);
};

// Product Info Cell Renderer
const ProductInfoCellRenderer = (params: ICellRendererParams) => {
	const { data } = params;
	const variant = data?.variant;

	if (!variant) return "-";

	// Priority order for image: variant.file_key > variant.product_file_key > variant.product.file_key
	const imageKey = variant.file_key || 
					 variant.product_file_key || 
					 variant.product?.file_key;

	// Debug log to see data structure (remove in production)
	if (process.env.NODE_ENV === 'development') {
		console.log('Variant data:', variant);
		console.log('Image key:', imageKey);
	}

	return (
		<div className="flex items-center gap-3">
			<div className="flex-shrink-0">
				<OptimizedImage
					fileKey={imageKey}
					alt={variant.variant_name || variant.display_name || variant.product?.name}
					className="w-12 h-12 rounded-md object-cover border border-gray-200"
					showLoading={true}
					fallbackComponent={
						<div className="w-12 h-12 rounded-md border border-gray-200 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
							<Package className="w-6 h-6 text-gray-400" />
						</div>
					}
				/>
			</div>
			<div className="flex flex-col gap-1 min-w-0 flex-1">
				<div className="font-medium text-sm text-gray-900 truncate">
					{variant.product?.name || variant.product_name || "-"}
				</div>
				<div className="text-xs text-muted-foreground">
					<span className="font-mono">{variant.sku}</span>
					{variant.size && <span> • {variant.size}</span>}
					{variant.color && <span> • {variant.color}</span>}
					{variant.gender && <span> • {variant.gender}</span>}
				</div>
				{variant.variant_name && (
					<div className="text-xs text-blue-600 truncate">
						{variant.variant_name}
					</div>
				)}
			</div>
		</div>
	);
};

// Movement Summary Cell Renderer
const MovementSummaryCellRenderer = (params: ICellRendererParams) => {
	const { data } = params;
	const stockIn = data?.total_stock_in || 0;
	const stockOut = data?.total_stock_out || 0;

	return (
		<div className="flex items-center gap-4 text-sm">
			<div className="flex items-center gap-1">
				<span className="text-green-600">+{stockIn.toLocaleString()}</span>
			</div>
			<div className="flex items-center gap-1">
				<span className="text-red-600">-{stockOut.toLocaleString()}</span>
			</div>
		</div>
	);
};

// Unit Cell Renderer
const UnitCellRenderer = (params: ICellRendererParams) => {
	const { data } = params;
	const unit = data?.variant?.unit;

	const unitLabels: Record<string, string> = {
		PIECE: "Cái",
		SET: "Bộ",
		PAIR: "Đôi",
		KG: "Kg",
		METER: "Mét",
		BOX: "Hộp",
	};

	return <span className="text-sm">{unitLabels[unit] || unit || "-"}</span>;
};

// Category Cell Renderer
const CategoryCellRenderer = (params: ICellRendererParams) => {
	const { data } = params;
	const category = data?.variant?.product?.category;

	return (
		<span className="text-sm text-muted-foreground">
			{category?.name || "-"}
		</span>
	);
};

const useStockInventory = () => {
	const { t } = useTranslation("common");
	const [searchQuery, setSearchQuery] = useState("");
	const [stockFilter, setStockFilter] = useState<
		"all" | "in_stock" | "low_stock" | "out_of_stock"
	>("all");

	const pagination = usePagination({
		initialPage: 1,
		initialLimit: 50,
	});

	// Fetch stock inventory
	const {
		data: stockSummaryResponse,
		isLoading: isGetStockSummaryPending,
		error,
		refetch,
	} = useGetStockInventory();

	// Filter data based on search and stock level
	const filteredData = (stockSummaryResponse?.data || stockSummaryResponse || []).filter((item: StockSummary) => {
		// Search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			const variant = item.variant;
			if (!variant) return false;

			const searchFields = [
				variant.sku,
				variant.variant_name,
				variant.product?.name,
				variant.size,
				variant.color,
			]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();

			if (!searchFields.includes(query)) return false;
		}

		// Stock level filter
		const currentStock = item.current_stock || 0;
		switch (stockFilter) {
			case "in_stock":
				return currentStock > 10;
			case "low_stock":
				return currentStock > 0 && currentStock <= 10;
			case "out_of_stock":
				return currentStock === 0;
			default:
				return true;
		}
	});

	// Apply pagination to filtered data
	const startIndex = (pagination.paginationState.current_page - 1) * pagination.paginationState.records_per_page;
	const endIndex = startIndex + pagination.paginationState.records_per_page;
	const paginatedData = filteredData.slice(startIndex, endIndex);

	// Update pagination when filter changes
	useEffect(() => {
		const totalPages = Math.ceil(filteredData.length / pagination.paginationState.records_per_page);
		pagination.updatePagination({
			...pagination.paginationState,
			total_pages: totalPages,
			total_records: filteredData.length,
		});
	}, [filteredData.length, pagination.paginationState.records_per_page]);

	const colDefs: ColDef<StockSummary>[] = [
		{
			headerName: "Sản phẩm",
			field: "variant",
			flex: 3,
			minWidth: 350,
			cellRenderer: ProductInfoCellRenderer,
		},
		{
			headerName: "Danh mục",
			field: "variant.product.category",
			width: 150,
			cellRenderer: CategoryCellRenderer,
		},
		{
			headerName: "Tồn kho hiện tại",
			field: "current_stock",
			width: 150,
			cellRenderer: StockLevelCellRenderer,
		},
		{
			headerName: "Đơn vị",
			field: "variant.unit",
			width: 100,
			cellRenderer: UnitCellRenderer,
		},
		{
			headerName: "Tổng nhập/xuất",
			field: "total_stock_in",
			width: 150,
			cellRenderer: MovementSummaryCellRenderer,
		},
	];

	// Summary statistics
	const stockData = stockSummaryResponse?.data || stockSummaryResponse || [];
	const stats = {
		totalProducts: stockData.length || 0,
		inStock: stockData.filter(
			(item: StockSummary) => (item.current_stock || 0) > 10
		).length || 0,
		lowStock: stockData.filter(
			(item: StockSummary) => (item.current_stock || 0) > 0 && (item.current_stock || 0) <= 10
		).length || 0,
		outOfStock: stockData.filter(
			(item: StockSummary) => (item.current_stock || 0) === 0
		).length || 0,
	};

	return {
		// Data
		stockInventory: paginatedData,
		total: filteredData.length,
		isGetStockSummaryPending,
		error,
		colDefs,
		stats,

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
		searchQuery,
		setSearchQuery,
		stockFilter,
		setStockFilter,

		// Actions
		refetch,
	};
};

export default useStockInventory;