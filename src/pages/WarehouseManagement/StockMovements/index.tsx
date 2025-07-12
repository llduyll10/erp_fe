import Table from "@/components/molecules/table";
import { cn } from "@/lib/utils";
import useStockMovements from "@/hooks/warehouse/useStockMovements";
import Loading from "@/components/layout/loading";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, Filter, Download } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { StockMovementType, StockMovementReason } from "@/enums/warehouse.enum";
import {
	STOCK_MOVEMENT_TYPE_OPTIONS,
	STOCK_MOVEMENT_REASON_OPTIONS,
} from "@/constants/warehouse.constant";

export function StockMovementsPage() {
	const { t } = useTranslation("common");
	const {
		stockMovements,
		total,
		isGetStockMovementsPending,
		colDefs,
		pagination,
		setPage,
		setLimit,
		setSearch,
		setTypeFilter,
		setReasonTypeFilter,
		clearFilters,
		refetch,
	} = useStockMovements();

	const [localSearch, setLocalSearch] = useState("");
	const [showFilters, setShowFilters] = useState(false);

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

	if (isGetStockMovementsPending && pagination.current_page === 1) {
		return <Loading />;
	}

	return (
		<div className="flex flex-col gap-6 p-8">
			<div className="flex items-center justify-between">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-bold">Lịch sử xuất nhập kho</h1>
					<p className="text-sm text-muted-foreground">
						Theo dõi toàn bộ hoạt động xuất nhập kho
					</p>
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
					<Button variant="outline" size="sm">
						<Download className="h-4 w-4 mr-2" />
						Xuất Excel
					</Button>
				</div>
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
								className="pl-10"
							/>
						</div>
						<Button onClick={handleSearch} size="sm">
							{t("actions.search")}
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setShowFilters(!showFilters)}>
							<Filter className="h-4 w-4 mr-2" />
							Bộ lọc
						</Button>
						<Button variant="outline" size="sm" onClick={handleClearFilters}>
							{t("actions.clear")}
						</Button>
					</div>
				</div>

				{/* Advanced Filters */}
				{showFilters && (
					<div className="flex items-center gap-4 pt-4 border-t">
						<div className="flex items-center gap-2">
							<span className="text-sm font-medium">Loại giao dịch:</span>
							<Select
								onValueChange={(value) =>
									setTypeFilter(value as StockMovementType)
								}>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Chọn loại" />
								</SelectTrigger>
								<SelectContent>
									{STOCK_MOVEMENT_TYPE_OPTIONS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
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
									{STOCK_MOVEMENT_REASON_OPTIONS.map((option: { value: string; label: string }) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				)}
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 bg-green-500 rounded-full"></div>
						<span className="text-sm font-medium text-green-800">
							Nhập kho hôm nay
						</span>
					</div>
					<div className="mt-2 text-2xl font-bold text-green-900">
						{stockMovements
							.filter((m) => {
								if (!m.created_at) return false;
								const today = new Date().toDateString();
								const moveDate = new Date(m.created_at).toDateString();
								return moveDate === today && m.type === StockMovementType.IN;
							})
							.reduce((sum, m) => sum + (m.quantity || 0), 0)
							.toLocaleString()}
					</div>
				</div>

				<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 bg-red-500 rounded-full"></div>
						<span className="text-sm font-medium text-red-800">
							Xuất kho hôm nay
						</span>
					</div>
					<div className="mt-2 text-2xl font-bold text-red-900">
						{stockMovements
							.filter((m) => {
								if (!m.created_at) return false;
								const today = new Date().toDateString();
								const moveDate = new Date(m.created_at).toDateString();
								return moveDate === today && m.type === StockMovementType.OUT;
							})
							.reduce((sum, m) => sum + (m.quantity || 0), 0)
							.toLocaleString()}
					</div>
				</div>

				<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 bg-blue-500 rounded-full"></div>
						<span className="text-sm font-medium text-blue-800">
							Tổng giao dịch
						</span>
					</div>
					<div className="mt-2 text-2xl font-bold text-blue-900">
						{total.toLocaleString()}
					</div>
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
						gridOptions={{
							headerHeight: 60,
							rowHeight: 80,
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

			{/* Custom Pagination */}
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
		</div>
	);
}