import Table from "@/components/molecules/table";
import { cn } from "@/lib/utils";
import Loading from "@/components/layout/loading";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Search, RefreshCw, Plus } from "lucide-react";
import { useState } from "react";
import useOrderManagement from "@/hooks/order/useOrderManagement";
import { useNavigate } from "react-router-dom";
import {
	OrderStatus,
	FulfillmentStatus,
	PaymentStatus,
} from "@/enums/order.enum";
import { useTranslation } from "react-i18next";

export function OrderManagementPage() {
	const { t } = useTranslation("common");
	const navigate = useNavigate();

	const {
		orderList,
		total,
		isGetOrderListPending,
		colDefs,
		pagination,
		setPage,
		setLimit,
		setSearch,
		setStatusFilter,
		setFulfillmentStatusFilter,
		setPaymentStatusFilter,
		clearFilters,
		refetch,
	} = useOrderManagement();

	const [localSearch, setLocalSearch] = useState("");
	const [selectedStatus, setSelectedStatus] = useState<string>("");
	const [selectedFulfillmentStatus, setSelectedFulfillmentStatus] =
		useState<string>("");
	const [selectedPaymentStatus, setSelectedPaymentStatus] =
		useState<string>("");

	const handleSearch = () => {
		setSearch(localSearch);
	};

	const handleRefresh = () => {
		refetch();
	};

	const handleRowClick = (event: any) => {
		const rowData = event.data;
		if (!rowData) return;

		// Navigate to order detail page
		if (rowData.id) {
			navigate(`/dashboard/orders/detail/${rowData.id}`);
		}
	};

	const handleCreateOrder = () => {
		navigate("/dashboard/orders/create");
	};

	const handleStatusFilterChange = (status: string) => {
		setSelectedStatus(status);
		if (status === "all") {
			setStatusFilter("" as OrderStatus);
		} else {
			setStatusFilter(status as OrderStatus);
		}
	};

	const handleFulfillmentStatusFilterChange = (status: string) => {
		setSelectedFulfillmentStatus(status);
		if (status === "all") {
			setFulfillmentStatusFilter("" as FulfillmentStatus);
		} else {
			setFulfillmentStatusFilter(status as FulfillmentStatus);
		}
	};

	const handlePaymentStatusFilterChange = (status: string) => {
		setSelectedPaymentStatus(status);
		if (status === "all") {
			setPaymentStatusFilter("" as PaymentStatus);
		} else {
			setPaymentStatusFilter(status as PaymentStatus);
		}
	};

	const handleClearFilters = () => {
		clearFilters();
		setLocalSearch("");
		setSelectedStatus("");
		setSelectedFulfillmentStatus("");
		setSelectedPaymentStatus("");
	};

	if (isGetOrderListPending && pagination.current_page === 1) {
		return <Loading />;
	}

	return (
		<div className="flex flex-col gap-6 p-8">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">{t("modules.orders.title")}</h1>
				<div className="flex items-center gap-2">
					<Button onClick={handleCreateOrder}>
						<Plus className="h-4 w-4 mr-2" />
						{t("modules.orders.addOrder")}
					</Button>

					<Button
						variant="outline"
						size="sm"
						onClick={handleRefresh}
						disabled={isGetOrderListPending}>
						<RefreshCw
							className={cn(
								"h-4 w-4 mr-2",
								isGetOrderListPending && "animate-spin"
							)}
						/>
						{t("actions.refresh")}
					</Button>
				</div>
			</div>

			{/* Search and Filters */}
			<div className="flex flex-col gap-4 p-4 bg-muted/50 rounded-lg">
				{/* Search Bar */}
				<div className="flex items-center gap-2">
					<div className="relative flex-1 max-w-sm">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder={t("modules.orders.searchPlaceholder")}
							value={localSearch}
							onChange={(e) => setLocalSearch(e.target.value)}
							className="pl-10"
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleSearch();
								}
							}}
						/>
					</div>
					<Button onClick={handleSearch} size="sm">
						{t("actions.search")}
					</Button>
					<Button variant="outline" size="sm" onClick={handleClearFilters}>
						{t("actions.clear")}
					</Button>
				</div>

				{/* Filter Dropdowns */}
				<div className="flex items-center gap-4">
					{/* Order Status Filter */}
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium">Status:</span>
						<Select
							value={selectedStatus}
							onValueChange={handleStatusFilterChange}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder={t("modules.orders.allStatuses")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t("modules.orders.allStatuses")}</SelectItem>
								{Object.values(OrderStatus).map((status) => (
									<SelectItem key={status} value={status}>
										{status}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Fulfillment Status Filter */}
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium">
							Fulfillment:
						</span>
						<Select
							value={selectedFulfillmentStatus}
							onValueChange={handleFulfillmentStatusFilterChange}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder={t("modules.orders.allFulfillment")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t("modules.orders.allFulfillment")}</SelectItem>
								{Object.values(FulfillmentStatus).map((status) => (
									<SelectItem key={status} value={status}>
										{status}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Payment Status Filter */}
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium">Payment:</span>
						<Select
							value={selectedPaymentStatus}
							onValueChange={handlePaymentStatusFilterChange}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder={t("modules.orders.allPayment")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t("modules.orders.allPayment")}</SelectItem>
								{Object.values(PaymentStatus).map((status) => (
									<SelectItem key={status} value={status}>
										{status}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Results Count */}
				<div className="text-sm text-muted-foreground">
					{total} {t("modules.orders.ordersFound")}
				</div>
			</div>

			{/* Table */}
			<div className="w-full">
				<div className="flex flex-col border border-none rounded-md">
					<Table
						className={cn(
							"mt-[12px] gray-highlight-table",
							!orderList?.length && "h-[150px]"
						)}
						rowData={orderList}
						columnDefs={colDefs}
						pagination={false} // Disable AG Grid pagination, use custom
						onSortChanged={() => {}}
						onFirstDataRendered={() => {}}
						isLoading={isGetOrderListPending}
						popupParent={null}
						suppressRowHoverHighlight={false}
						noRowsOverlayClassName="top-[50px]"
						gridOptions={{
							headerHeight: 60,
							rowHeight: 72,
							suppressRowHoverHighlight: true,
							getRowId: (params) => params.data.id,
							onRowClicked: handleRowClick,
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
							// Add row hover effect
							getRowClass: () => {
								return "cursor-pointer hover:bg-gray-50";
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
