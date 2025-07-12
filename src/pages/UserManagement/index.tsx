import Table from "@/components/molecules/table";
import { cn } from "@/lib/utils";
import { AddUserModal } from "./AddUserModal";
import useUserManagement from "@/hooks/user/useUserManagement";
import Loading from "@/components/layout/loading";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function UserManagementPage() {
	const { t } = useTranslation("common");
	const {
		userList,
		total,
		isGetUserListPending,
		colDefs,
		pagination,
		setPage,
		setLimit,
		setSearch,
		clearFilters,
		refetch,
	} = useUserManagement();

	const [localSearch, setLocalSearch] = useState("");

	const handleSearch = () => {
		setSearch(localSearch);
	};

	const handleRefresh = () => {
		refetch();
	};

	if (isGetUserListPending && pagination.current_page === 1) {
		return <Loading />;
	}

	return (
		<div className="flex flex-col gap-6 p-8">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">{t("modules.users.title")}</h1>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleRefresh}
						disabled={isGetUserListPending}>
						<RefreshCw
							className={cn(
								"h-4 w-4 mr-2",
								isGetUserListPending && "animate-spin"
							)}
						/>
						{t("actions.refresh")}
					</Button>
					<AddUserModal />
				</div>
			</div>

			{/* Search and Filters */}
			<div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
				<div className="flex items-center gap-2 flex-1">
					<div className="relative flex-1 max-w-sm">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder={t("modules.users.searchPlaceholder")}
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
						onClick={() => {
							clearFilters();
							setLocalSearch("");
						}}>
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
							!userList?.length && "h-[150px]"
						)}
						rowData={userList}
						columnDefs={colDefs}
						pagination={false} // Disable AG Grid pagination, use custom
						onSortChanged={() => {}}
						onFirstDataRendered={() => {}}
						isLoading={isGetUserListPending}
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
