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
import { Search, RefreshCw, Plus, Filter } from "lucide-react";
import { useState } from "react";
import useCustomerManagement from "@/hooks/customer/useCustomerManagement";
import { useNavigate } from "react-router-dom";
import {
	CustomerGroup,
	CustomerStatus,
	CustomerType,
	CustomerSource,
} from "@/enums/customer.enum";

export function CustomerManagementPage() {
	const navigate = useNavigate();

	const {
		customerList,
		total,
		isGetCustomerListPending,
		colDefs,
		pagination,
		setPage,
		setLimit,
		setSearch,
		clearFilters,
		refetch,
	} = useCustomerManagement();

	const [localSearch, setLocalSearch] = useState("");

	const handleSearch = () => {
		setSearch(localSearch);
	};

	const handleRefresh = () => {
		refetch();
	};

	const handleRowClick = (event: any) => {
		const rowData = event.data;
		if (!rowData) return;

		// Navigate to customer detail page
		if (rowData.id) {
			navigate(`/dashboard/customers/detail/${rowData.id}`);
		}
	};

	const handleCreateCustomer = () => {
		navigate("/dashboard/customers/create");
	};

	if (isGetCustomerListPending && pagination.current_page === 1) {
		return <Loading />;
	}

	return (
		<div className="flex flex-col gap-6 p-8">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Customer Management</h1>
				<div className="flex items-center gap-2">
					<Button onClick={handleCreateCustomer}>
						<Plus className="h-4 w-4 mr-2" />
						Add Customer
					</Button>

					<Button
						variant="outline"
						size="sm"
						onClick={handleRefresh}
						disabled={isGetCustomerListPending}>
						<RefreshCw
							className={cn(
								"h-4 w-4 mr-2",
								isGetCustomerListPending && "animate-spin"
							)}
						/>
						Refresh
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
							placeholder="Search by name, email, phone..."
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
						Search
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							clearFilters();
							setLocalSearch("");
						}}>
						Clear
					</Button>
				</div>

				{/* Results Count */}
				<div className="text-sm text-muted-foreground">
					{total} customer{total !== 1 ? "s" : ""} found
				</div>
			</div>

			{/* Table */}
			<div className="w-full">
				<div className="flex flex-col border border-none rounded-md">
					<Table
						className={cn(
							"mt-[12px] gray-highlight-table",
							!customerList?.length && "h-[150px]"
						)}
						rowData={customerList}
						columnDefs={colDefs}
						pagination={false} // Disable AG Grid pagination, use custom
						onSortChanged={() => {}}
						onFirstDataRendered={() => {}}
						isLoading={isGetCustomerListPending}
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
