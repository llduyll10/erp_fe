import Table from "@/components/molecules/table";
import { cn } from "@/lib/utils";
import Loading from "@/components/layout/loading";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import useProductManagement from "@/hooks/product/useProductManagement";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function ProductManagementPage() {
	const { t } = useTranslation("common");
	const navigate = useNavigate();

	const {
		productList,
		tableRows,
		total,
		isGetProductListPending,
		colDefs,
		pagination,
		setPage,
		setLimit,
		setSearch,
		clearFilters,
		refetch,
		expandAll,
		collapseAll,
		expandedProducts,
	} = useProductManagement();

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

		// Don't navigate if it's a product row with variants (expand/collapse functionality)
		if (rowData.rowType === "product" && rowData.rawProduct?.variants?.length) {
			return;
		}

		// Navigate to product detail page
		const productId =
			rowData.rowType === "product" ?
				rowData.rawProduct?.id
			:	rowData.product_id;

		if (productId) {
			navigate(`/dashboard/products/detail/${productId}`);
		}
	};

	if (isGetProductListPending && pagination.current_page === 1) {
		return <Loading />;
	}

	return (
		<div className="flex flex-col gap-6 p-8">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">{t("modules.products.title")}</h1>
				<div className="flex items-center gap-2">
					{/* Tree Controls */}
					<Button
						variant="outline"
						size="sm"
						onClick={expandAll}
						disabled={isGetProductListPending}>
						<ChevronDown className="h-4 w-4 mr-2" />
						{t("modules.products.expandAll")}
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={collapseAll}
						disabled={isGetProductListPending}>
						<ChevronRight className="h-4 w-4 mr-2" />
						{t("modules.products.collapseAll")}
					</Button>

					<Button
						variant="outline"
						size="sm"
						onClick={handleRefresh}
						disabled={isGetProductListPending}>
						<RefreshCw
							className={cn(
								"h-4 w-4 mr-2",
								isGetProductListPending && "animate-spin"
							)}
						/>
						{t("actions.refresh")}
					</Button>
				</div>
			</div>

			{/* Search and Filters */}
			<div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
				<div className="flex items-center gap-2 flex-1">
					<div className="relative flex-1 max-w-sm">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder={t("modules.products.searchPlaceholder")}
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

				{/* Tree Status */}
				<div className="text-sm text-muted-foreground">
					{productList.length} {t("modules.products.productsFound")} • {expandedProducts.size} {t("modules.products.expanded")}
				</div>
			</div>

			{/* Table */}
			<div className="w-full">
				<div className="flex flex-col border border-none rounded-md">
					<Table
						className={cn(
							"mt-[12px] gray-highlight-table",
							!tableRows?.length && "h-[150px]"
						)}
						rowData={tableRows}
						columnDefs={colDefs}
						pagination={false} // Disable AG Grid pagination, use custom
						onSortChanged={() => {}}
						onFirstDataRendered={() => {}}
						isLoading={isGetProductListPending}
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
								sortable: false, // Disable sorting for tree structure
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
							// Add row styling based on type
							getRowClass: (params) => {
								if (params.data.rowType === "variant") {
									return "bg-gray-50";
								}
								return "";
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
