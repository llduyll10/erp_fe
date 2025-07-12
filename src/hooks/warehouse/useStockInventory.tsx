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
import { ImageIcon } from "lucide-react";

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

	return (
		<div className="flex items-center gap-3">
			<OptimizedImage
				fileKey={variant.file_key || variant.product?.file_key}
				alt={variant.variant_name}
				className="w-10 h-10 rounded-md object-cover"
				showLoading={false}
				fallbackComponent={<ImageIcon className="w-6 h-6 text-gray-400" />}
			/>
			<div className="flex flex-col gap-1">
				<div className="font-medium text-sm">
					{variant.product?.name || "-"}
				</div>
				<div className="text-xs text-muted-foreground">
					{variant.sku} • {variant.size} • {variant.color}
				</div>
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

	// Fetch stock inventory
	const {
		data: stockSummaryResponse,
		isLoading: isGetStockSummaryPending,
		error,
		refetch,
	} = useGetStockInventory();

	// Filter data based on search and stock level
	const filteredData = (stockSummaryResponse || []).filter((item: StockSummary) => {
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

	const colDefs: ColDef<StockSummary>[] = [
		{
			headerName: "Sản phẩm",
			field: "variant",
			flex: 2,
			minWidth: 300,
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
	const stats = {
		totalProducts: stockSummaryResponse?.length || 0,
		inStock: stockSummaryResponse?.filter(
			(item: StockSummary) => (item.current_stock || 0) > 10
		).length || 0,
		lowStock: stockSummaryResponse?.filter(
			(item: StockSummary) => (item.current_stock || 0) > 0 && (item.current_stock || 0) <= 10
		).length || 0,
		outOfStock: stockSummaryResponse?.filter(
			(item: StockSummary) => (item.current_stock || 0) === 0
		).length || 0,
	};

	return {
		// Data
		stockInventory: filteredData,
		isGetStockSummaryPending,
		error,
		colDefs,
		stats,

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