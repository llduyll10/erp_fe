import Table from "@/components/molecules/table";
import { cn } from "@/lib/utils";
import useStockInHistory from "@/hooks/warehouse/useStockInHistory";
import Loading from "@/components/layout/loading";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Search,
	RefreshCw,
	Download,
	ArrowDown,
	TrendingUp,
	Calendar,
	Package,
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
import { StockMovementReason } from "@/enums/warehouse.enum";
import { STOCK_IN_REASON_OPTIONS } from "@/constants/warehouse.constant";
import { StockMovementDetailModal } from "@/components/molecules/stock-movement-detail-modal";
import type { StockMovement } from "@/models/warehouse.model";

export function StockInHistoryPage() {
	const { t } = useTranslation("common");
	const [selectedMovement, setSelectedMovement] =
		useState<StockMovement | null>(null);
	const [showDetailModal, setShowDetailModal] = useState(false);

	const {
		stockMovements,
		total,
		todayTotal,
		isGetStockMovementsPending,
		colDefs,
		pagination,
		setPage,
		setLimit,
		setSearch,
		setReasonTypeFilter,
		clearFilters,
		refetch,
	} = useStockInHistory();

	const [localSearch, setLocalSearch] = useState("");

	const handleSearch = () => {
		setSearch(localSearch);
	};

	const handleRefresh = () => {
		refetch();
	};

	const handleClearFilters = () => {
		clearFilters();
		setLocalSearch("");
	};

	const handleExport = () => {
		// TODO: Implement export functionality
		console.log("Export to Excel");
	};

	const handleViewDetail = (movement: StockMovement) => {
		setSelectedMovement(movement);
		setShowDetailModal(true);
	};

	// Add context for AG Grid to handle view detail
	const gridContext = {
		onViewDetail: handleViewDetail,
	};

	if (isGetStockMovementsPending && pagination.current_page === 1) {
		return <Loading />;
	}

	return (
		<div className="flex flex-col gap-6 p-8">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<ArrowDown className="h-8 w-8 text-green-600" />
					<div>
						<h1 className="text-2xl font-bold">Lịch sử nhập kho</h1>
						<p className="text-sm text-muted-foreground">
							Theo dõi toàn bộ hoạt động nhập kho vào hệ thống
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleRefresh}
						disabled={isGetStockMovementsPending}>
						<RefreshCw
							className={cn(
								"h-4 w-4 mr-2",
								isGetStockMovementsPending && "animate-spin"
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
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Tổng giao dịch nhập
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">
							{total.toLocaleString()}
						</div>
						<p className="text-xs text-muted-foreground">
							Tất cả giao dịch nhập kho
						</p>
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
								placeholder="Tìm kiếm theo sản phẩm, lý do..."
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
						<span className="text-sm font-medium">Lý do:</span>
						<Select
							onValueChange={(value) =>
								setReasonTypeFilter(value as StockMovementReason)
							}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Chọn lý do" />
							</SelectTrigger>
							<SelectContent>
								{STOCK_IN_REASON_OPTIONS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<Button variant="outline" size="sm" onClick={handleClearFilters}>
						{t("actions.clear")}
					</Button>
				</div>
			</div>

			{/* Table */}
			<div className="w-full">
				<div className="flex flex-col border border-none rounded-md">
					<Table
						className={cn(
							"mt-[12px] gray-highlight-table",
							!stockMovements?.length && "h-[150px]"
						)}
						rowData={stockMovements}
						columnDefs={colDefs}
						pagination={false}
						onSortChanged={() => {}}
						onFirstDataRendered={() => {}}
						isLoading={isGetStockMovementsPending}
						popupParent={null}
						suppressRowHoverHighlight={false}
						noRowsOverlayClassName="top-[50px]"
						context={gridContext}
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

			{/* Pagination */}
			{total > 0 && (
				<Pagination
					currentPage={pagination.current_page}
					totalPages={pagination.total_pages}
					totalItems={total}
					pageSize={pagination.records_per_page}
					onPageChange={setPage}
					onPageSizeChange={setLimit}
					className="mt-4"
				/>
			)}

			{/* Detail Modal */}
			<StockMovementDetailModal
				isOpen={showDetailModal}
				onClose={() => setShowDetailModal(false)}
				movement={selectedMovement}
			/>
		</div>
	);
}
