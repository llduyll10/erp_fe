import Table from "@/components/molecules/table";
import { cn } from "@/lib/utils";
import Loading from "@/components/layout/loading";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, Plus } from "lucide-react";
import { useState } from "react";
import useVariantTable from "@/hooks/product/useVariantTable";
import { useParams } from "react-router-dom";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	ProductColor,
	ProductGender,
	ProductSize,
	ProductUnit,
} from "@/enums/product.enum";
import { VariantModal } from "../VariantModal";

interface VariantTableProps {
	onAddVariant?: () => void;
	onEditVariant?: (variantId: string) => void;
}

export function VariantTable({
	onAddVariant,
	onEditVariant,
}: VariantTableProps) {
	const { id: productId } = useParams();

	const {
		variantList,
		total,
		isGetVariantListPending,
		colDefs,
		pagination,
		setPage,
		setLimit,
		setSearch,
		setColorFilter,
		setSizeFilter,
		setGenderFilter,
		setStatusFilter,
		clearFilters,
		refetch,
	} = useVariantTable(productId);

	const [localSearch, setLocalSearch] = useState("");
	const [selectedColor, setSelectedColor] = useState<string>("");
	const [selectedSize, setSelectedSize] = useState<string>("");
	const [selectedGender, setSelectedGender] = useState<string>("");

	const handleSearch = () => {
		setSearch(localSearch);
	};

	const handleRefresh = () => {
		refetch();
	};

	const handleClearFilters = () => {
		clearFilters();
		setLocalSearch("");
		setSelectedColor("");
		setSelectedSize("");
		setSelectedGender("");
	};

	const handleColorFilter = (color: string) => {
		setSelectedColor(color);
		if (color) {
			setColorFilter(color as ProductColor);
		}
	};

	const handleSizeFilter = (size: string) => {
		setSelectedSize(size);
		if (size) {
			setSizeFilter(size as ProductSize);
		}
	};

	const handleGenderFilter = (gender: string) => {
		setSelectedGender(gender);
		if (gender) {
			setGenderFilter(gender as ProductGender);
		}
	};

	if (isGetVariantListPending && pagination.current_page === 1) {
		return <Loading />;
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">Product Variants</h2>
				<div className="flex items-center gap-2">
					<VariantModal onSuccess={refetch} />
					<Button
						variant="outline"
						size="sm"
						onClick={handleRefresh}
						disabled={isGetVariantListPending}>
						<RefreshCw
							className={cn(
								"h-4 w-4 mr-2",
								isGetVariantListPending && "animate-spin"
							)}
						/>
						Refresh
					</Button>
				</div>
			</div>

			{/* Search and Filters */}
			<div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
				<div className="flex items-center gap-2 flex-1">
					<div className="relative flex-1 max-w-sm">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by SKU or variant info"
							value={localSearch}
							onChange={(e) => setLocalSearch(e.target.value)}
							className="pl-10"
						/>
					</div>
					<Button onClick={handleSearch} size="sm">
						Search
					</Button>

					<Button variant="outline" size="sm" onClick={handleClearFilters}>
						Clear
					</Button>
				</div>

				{/* Status */}
				<div className="text-sm text-muted-foreground">{total} variants</div>
			</div>

			{/* Table */}
			<div className="w-full">
				<div className="flex flex-col border border-none rounded-md">
					<Table
						className={cn(
							"mt-[12px] gray-highlight-table",
							!variantList?.length && "h-[150px]"
						)}
						rowData={variantList}
						columnDefs={colDefs}
						pagination={false}
						onSortChanged={() => {}}
						onFirstDataRendered={() => {}}
						isLoading={isGetVariantListPending}
						popupParent={null}
						suppressRowHoverHighlight={false}
						noRowsOverlayClassName="top-[50px]"
						gridOptions={{
							headerHeight: 60,
							rowHeight: 52,
							suppressRowHoverHighlight: false,
							getRowId: (params) => params.data.id,
							onRowClicked: (event) => {
								if (onEditVariant && event.data) {
									onEditVariant(event.data.id);
								}
							},
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
