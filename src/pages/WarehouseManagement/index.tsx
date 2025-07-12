import Table from "@/components/molecules/table";
import { cn } from "@/lib/utils";
import useWarehouseManagement from "@/hooks/warehouse/useWarehouseManagement";
import Loading from "@/components/layout/loading";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, Plus, Filter } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { WarehouseStatus, WarehouseType } from "@/enums/warehouse.enum";
import {
	WAREHOUSE_STATUS_OPTIONS,
	WAREHOUSE_TYPE_OPTIONS,
} from "@/constants/warehouse.constant";

export function WarehouseManagementPage() {
	const { t } = useTranslation("common");
	const {
		warehouseList,
		total,
		isGetWarehouseListPending,
		colDefs,
		pagination,
		setPage,
		setLimit,
		setSearch,
		setWarehouseTypeFilter,
		setStatusFilter,
		clearFilters,
		refetch,
	} = useWarehouseManagement();

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

	if (isGetWarehouseListPending && pagination.current_page === 1) {
		return <Loading />;
	}

	return (
		<div className="flex flex-col gap-6 p-8">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Quản lý kho</h1>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleRefresh}
						disabled={isGetWarehouseListPending}>
						<RefreshCw
							className={cn(
								"h-4 w-4 mr-2",
								isGetWarehouseListPending && "animate-spin"
							)}
						/>
						{t("actions.refresh")}
					</Button>
					<Button size="sm">
						<Plus className="h-4 w-4 mr-2" />
						Tạo kho mới
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
								placeholder="Tìm kiếm theo tên kho, mã kho..."
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
							<span className="text-sm font-medium">Loại kho:</span>
							<Select
								onValueChange={(value) =>
									setWarehouseTypeFilter(value as WarehouseType)
								}>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Chọn loại kho" />
								</SelectTrigger>
								<SelectContent>
									{WAREHOUSE_TYPE_OPTIONS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="flex items-center gap-2">
							<span className="text-sm font-medium">Trạng thái:</span>
							<Select
								onValueChange={(value) =>
									setStatusFilter(value as WarehouseStatus)
								}>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Chọn trạng thái" />
								</SelectTrigger>
								<SelectContent>
									{WAREHOUSE_STATUS_OPTIONS.map((option) => (
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

			{/* Table */}
			<div className="w-full">
				<div className="flex flex-col border border-none rounded-md">
					<Table
						className={cn(
							"mt-[12px] gray-highlight-table",
							!warehouseList?.length && "h-[150px]"
						)}
						rowData={warehouseList}
						columnDefs={colDefs}
						pagination={false}
						onSortChanged={() => {}}
						onFirstDataRendered={() => {}}
						isLoading={isGetWarehouseListPending}
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