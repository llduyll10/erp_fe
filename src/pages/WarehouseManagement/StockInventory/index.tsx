import Table from "@/components/molecules/table";
import { cn } from "@/lib/utils";
import useStockInventory from "@/hooks/warehouse/useStockInventory";
import Loading from "@/components/layout/loading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
	Search, 
	RefreshCw, 
	Download, 
	Package, 
	AlertTriangle, 
	CheckCircle2,
	XCircle,
	BarChart3
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export function StockInventoryPage() {
	const { t } = useTranslation("common");
	const {
		stockInventory,
		isGetStockSummaryPending,
		colDefs,
		searchQuery,
		setSearchQuery,
		stockFilter,
		setStockFilter,
		stats,
		refetch,
	} = useStockInventory();

	const [localSearch, setLocalSearch] = useState("");

	const handleSearch = () => {
		setSearchQuery(localSearch);
	};

	const handleRefresh = () => {
		refetch();
	};

	const handleClearFilters = () => {
		setSearchQuery("");
		setLocalSearch("");
		setStockFilter("all");
	};

	const handleExport = () => {
		// TODO: Implement export functionality
		console.log("Export to Excel");
	};

	if (isGetStockSummaryPending) {
		return <Loading />;
	}

	return (
		<div className="flex flex-col gap-6 p-8">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<BarChart3 className="h-8 w-8 text-blue-600" />
					<div>
						<h1 className="text-2xl font-bold">Kiểm tra tồn kho</h1>
						<p className="text-sm text-muted-foreground">
							Theo dõi tình trạng tồn kho của tất cả sản phẩm
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleRefresh}
						disabled={isGetStockSummaryPending}>
						<RefreshCw
							className={cn(
								"h-4 w-4 mr-2",
								isGetStockSummaryPending && "animate-spin"
							)}
						/>
						{t("actions.refresh")}
					</Button>
					<Button variant="outline" size="sm" onClick={handleExport}>
						<Download className="h-4 w-4 mr-2" />
						Xuất Excel
					</Button>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Tổng sản phẩm
								</p>
								<p className="text-2xl font-bold">{stats.totalProducts}</p>
							</div>
							<Package className="h-8 w-8 text-blue-600" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Còn hàng
								</p>
								<p className="text-2xl font-bold text-green-600">
									{stats.inStock}
								</p>
							</div>
							<CheckCircle2 className="h-8 w-8 text-green-600" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Sắp hết hàng
								</p>
								<p className="text-2xl font-bold text-orange-600">
									{stats.lowStock}
								</p>
							</div>
							<AlertTriangle className="h-8 w-8 text-orange-600" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Hết hàng
								</p>
								<p className="text-2xl font-bold text-red-600">
									{stats.outOfStock}
								</p>
							</div>
							<XCircle className="h-8 w-8 text-red-600" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Search and Filters */}
			<div className="flex flex-col gap-4 p-4 bg-muted/50 rounded-lg">
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2 flex-1">
						<div className="relative flex-1 max-w-sm">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Tìm kiếm theo tên, SKU, size, màu..."
								value={localSearch}
								onChange={(e) => setLocalSearch(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleSearch()}
								className="pl-10"
							/>
						</div>
						<Button onClick={handleSearch} size="sm">
							{t("actions.search")}
						</Button>
					</div>

					<div className="flex items-center gap-2">
						<span className="text-sm font-medium">Trạng thái:</span>
						<Select
							value={stockFilter}
							onValueChange={(value: any) => setStockFilter(value)}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Chọn trạng thái" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tất cả</SelectItem>
								<SelectItem value="in_stock">Còn hàng</SelectItem>
								<SelectItem value="low_stock">Sắp hết</SelectItem>
								<SelectItem value="out_of_stock">Hết hàng</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<Button variant="outline" size="sm" onClick={handleClearFilters}>
						{t("actions.clear")}
					</Button>
				</div>
			</div>

			{/* Alert for low stock items */}
			{stats.lowStock > 0 && (
				<div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
					<AlertTriangle className="h-5 w-5 text-orange-600" />
					<div className="flex-1">
						<p className="text-sm font-medium text-orange-800">
							Cảnh báo tồn kho
						</p>
						<p className="text-sm text-orange-700">
							Có {stats.lowStock} sản phẩm đang ở mức tồn kho thấp cần được nhập
							thêm.
						</p>
					</div>
				</div>
			)}

			{/* Table */}
			<div className="w-full">
				<div className="flex flex-col border border-none rounded-md">
					<Table
						className={cn(
							"mt-[12px] gray-highlight-table",
							!stockInventory?.length && "h-[150px]"
						)}
						rowData={stockInventory}
						columnDefs={colDefs}
						pagination={false}
						onSortChanged={() => {}}
						onFirstDataRendered={() => {}}
						isLoading={isGetStockSummaryPending}
						popupParent={null}
						suppressRowHoverHighlight={false}
						noRowsOverlayClassName="top-[50px]"
						gridOptions={{
							headerHeight: 60,
							rowHeight: 72,
							suppressRowHoverHighlight: true,
							defaultColDef: {
								sortable: true,
								editable: false,
								resizable: true,
								headerClass: [
									"!text-lg",
									"text-text-default",
									"bg-background-grayDark",
									"text-left",
									"[&_.ag-header-cell-label]:justify-start",
									"[&_.ag-header-cell-label]:pl-[16px]",
								],
							},
						}}
						domLayout="autoHeight"
					/>
				</div>
			</div>
		</div>
	);
}