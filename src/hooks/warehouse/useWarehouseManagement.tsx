/**
 * Warehouse Management Hook
 * Manages warehouse list with pagination, search, and filtering
 */

import { useGetWarehouseList } from "@/services/warehouse";
import { type ColDef, type ICellRendererParams } from "ag-grid-community";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import type { Warehouse } from "@/models/warehouse.model";
import type { GetWarehouseListRequest } from "@/interfaces/warehouse.interface";
import { usePagination } from "../common/usePagination";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { WarehouseStatus, WarehouseType } from "@/enums/warehouse.enum";

// Warehouse Type Cell Renderer
const WarehouseTypeCellRenderer = (params: ICellRendererParams) => {
	const { value } = params;
	if (!value) return "-";

	const colorMap: Record<string, string> = {
		[WarehouseType.MAIN]: "bg-blue-100 text-blue-800",
		[WarehouseType.BRANCH]: "bg-green-100 text-green-800",
		[WarehouseType.TEMPORARY]: "bg-yellow-100 text-yellow-800",
		[WarehouseType.PRODUCTION]: "bg-purple-100 text-purple-800",
	};

	const labelMap: Record<string, string> = {
		[WarehouseType.MAIN]: "Kho chính",
		[WarehouseType.BRANCH]: "Kho chi nhánh",
		[WarehouseType.TEMPORARY]: "Kho tạm",
		[WarehouseType.PRODUCTION]: "Kho sản xuất",
	};

	return (
		<Badge className={colorMap[value] || "bg-gray-100 text-gray-800"}>
			{labelMap[value] || value}
		</Badge>
	);
};

// Warehouse Status Cell Renderer
const WarehouseStatusCellRenderer = (params: ICellRendererParams) => {
	const { value } = params;
	if (!value) return "-";

	const colorMap: Record<string, string> = {
		[WarehouseStatus.ACTIVE]: "bg-green-100 text-green-800",
		[WarehouseStatus.INACTIVE]: "bg-red-100 text-red-800",
		[WarehouseStatus.MAINTENANCE]: "bg-yellow-100 text-yellow-800",
	};

	const labelMap: Record<string, string> = {
		[WarehouseStatus.ACTIVE]: "Hoạt động",
		[WarehouseStatus.INACTIVE]: "Không hoạt động",
		[WarehouseStatus.MAINTENANCE]: "Bảo trì",
	};

	return (
		<Badge className={colorMap[value] || "bg-gray-100 text-gray-800"}>
			{labelMap[value] || value}
		</Badge>
	);
};

// Address Cell Renderer
const AddressCellRenderer = (params: ICellRendererParams) => {
	const { data } = params;
	const address = [
		data.street_address,
		data.ward,
		data.district,
		data.state_province,
		data.country,
	]
		.filter(Boolean)
		.join(", ");

	return <div className="text-sm">{address || "-"}</div>;
};

// Date Cell Renderer
const DateCellRenderer = (params: ICellRendererParams) => {
	const { value } = params;
	if (!value) return "-";

	const date = new Date(value);
	return (
		<div className="text-sm text-gray-600">
			{date.toLocaleDateString("vi-VN")}
		</div>
	);
};

const useWarehouseManagement = () => {
	const { t } = useTranslation("common");
	const [searchParams, setSearchParams] = useState<
		Omit<GetWarehouseListRequest, "page" | "limit" | "offset">
	>({});

	const pagination = usePagination({
		initialPage: 1,
		initialLimit: 10,
	});

	// Prepare query parameters
	const queryParams: GetWarehouseListRequest = {
		page: pagination.paginationState.current_page,
		limit: pagination.paginationState.records_per_page,
		...searchParams,
	};

	const {
		data: warehouseListResponse,
		isLoading: isGetWarehouseListPending,
		error,
		refetch,
	} = useGetWarehouseList(queryParams);

	// Update pagination state when data changes
	useEffect(() => {
		if (warehouseListResponse) {
			pagination.updatePagination({
				current_page: warehouseListResponse.pagination?.current_page || 1,
				records_per_page:
					warehouseListResponse.pagination?.records_per_page || 10,
				total_pages: warehouseListResponse.pagination?.total_pages || 0,
				total_records: warehouseListResponse.pagination?.total_records || 0,
			});
		}
	}, [warehouseListResponse, pagination.updatePagination]);

	const colDefs: ColDef<Warehouse>[] = [
		{
			headerName: "Mã kho",
			field: "warehouse_code",
			width: 120,
			pinned: "left",
		},
		{
			headerName: "Tên kho",
			field: "name",
			flex: 1,
			minWidth: 150,
		},
		{
			headerName: "Loại kho",
			field: "warehouse_type",
			width: 120,
			cellRenderer: WarehouseTypeCellRenderer,
		},
		{
			headerName: "Trạng thái",
			field: "status",
			width: 120,
			cellRenderer: WarehouseStatusCellRenderer,
		},
		{
			headerName: "Người quản lý",
			field: "manager.name",
			width: 150,
			valueGetter: (params) => params.data?.manager?.name || "-",
		},
		{
			headerName: "Địa chỉ",
			field: "street_address",
			flex: 2,
			minWidth: 250,
			cellRenderer: AddressCellRenderer,
		},
		{
			headerName: "Ngày tạo",
			field: "created_at",
			width: 120,
			cellRenderer: DateCellRenderer,
		},
		{
			headerName: "Cập nhật",
			field: "updated_at",
			width: 120,
			cellRenderer: DateCellRenderer,
		},
	];

	// Search and filter functions
	const setSearch = (search: string) => {
		setSearchParams((prev) => ({ ...prev, q: search }));
		pagination.setPage(1); // Reset to first page when searching
	};

	const setWarehouseTypeFilter = (warehouse_type: WarehouseType) => {
		setSearchParams((prev) => ({ ...prev, warehouse_type }));
		pagination.setPage(1); // Reset to first page when filtering
	};

	const setStatusFilter = (status: WarehouseStatus) => {
		setSearchParams((prev) => ({ ...prev, status }));
		pagination.setPage(1); // Reset to first page when filtering
	};

	const setManagerFilter = (manager_id: string) => {
		setSearchParams((prev) => ({ ...prev, manager_id }));
		pagination.setPage(1); // Reset to first page when filtering
	};

	const setSortBy = (sortBy: string, sortOrder: "asc" | "desc") => {
		setSearchParams((prev) => ({ ...prev, sortBy, sortOrder }));
	};

	const clearFilters = () => {
		setSearchParams({});
		pagination.setPage(1);
	};

	return {
		// Data
		warehouseList: warehouseListResponse?.data || [],
		total: warehouseListResponse?.pagination?.total_records || 0,
		isGetWarehouseListPending,
		error,
		colDefs,

		// Pagination
		pagination: pagination.paginationState,
		setPage: pagination.setPage,
		setLimit: pagination.setLimit,
		nextPage: pagination.nextPage,
		prevPage: pagination.prevPage,
		goToFirstPage: pagination.goToFirstPage,
		goToLastPage: pagination.goToLastPage,
		canGoNext: pagination.canGoNext,
		canGoPrev: pagination.canGoPrev,

		// Search and filters
		searchParams,
		setSearch,
		setWarehouseTypeFilter,
		setStatusFilter,
		setManagerFilter,
		setSortBy,
		clearFilters,

		// Actions
		refetch,
	};
};

export default useWarehouseManagement;