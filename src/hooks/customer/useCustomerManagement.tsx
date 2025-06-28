import { type ColDef } from "ag-grid-community";
import { useEffect, useState, useCallback } from "react";
import { usePagination } from "@/hooks/common/usePagination";
import { useGetCustomerList } from "@/services/customer";
import { Customer } from "@/models/customer.model";
import { GetCustomerListRequest } from "@/interfaces/customer.interface";
import { Badge } from "@/components/ui/badge";
import {
	CustomerGroup,
	CustomerStatus,
	CustomerType,
	CustomerSource,
} from "@/enums/customer.enum";

// Customer Group Cell Renderer
const CustomerGroupCellRenderer = (params: any) => {
	const { value } = params;
	if (!value) return "-";

	const colorMap: Record<string, string> = {
		[CustomerGroup.INTERNAL]: "bg-blue-100 text-blue-800",
		[CustomerGroup.EXTERNAL]: "bg-green-100 text-green-800",
		[CustomerGroup.PARTNER]: "bg-purple-100 text-purple-800",
		[CustomerGroup.OTHER]: "bg-gray-100 text-gray-800",
	};

	return (
		<Badge className={colorMap[value] || "bg-gray-100 text-gray-800"}>
			{value.toUpperCase()}
		</Badge>
	);
};

// Customer Status Cell Renderer
const CustomerStatusCellRenderer = (params: any) => {
	const { value } = params;
	if (!value) return "-";

	const colorMap: Record<string, string> = {
		[CustomerStatus.ACTIVE]: "bg-green-100 text-green-800",
		[CustomerStatus.INACTIVE]: "bg-red-100 text-red-800",
	};

	return (
		<Badge className={colorMap[value] || "bg-gray-100 text-gray-800"}>
			{value.toUpperCase()}
		</Badge>
	);
};

// Customer Type Cell Renderer
const CustomerTypeCellRenderer = (params: any) => {
	const { value } = params;
	if (!value) return "-";

	const colorMap: Record<string, string> = {
		[CustomerType.NEW]: "bg-blue-100 text-blue-800",
		[CustomerType.OLD]: "bg-gray-100 text-gray-800",
		[CustomerType.VIP]: "bg-yellow-100 text-yellow-800",
		[CustomerType.GOLD]: "bg-yellow-100 text-yellow-800",
		[CustomerType.SILVER]: "bg-gray-100 text-gray-800",
		[CustomerType.BRONZE]: "bg-orange-100 text-orange-800",
		[CustomerType.OTHER]: "bg-gray-100 text-gray-800",
	};

	return (
		<Badge className={colorMap[value] || "bg-gray-100 text-gray-800"}>
			{value.toUpperCase()}
		</Badge>
	);
};

// Address Cell Renderer
const AddressCellRenderer = (params: any) => {
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
const DateCellRenderer = (params: any) => {
	const { value } = params;
	if (!value) return "-";

	const date = new Date(value);
	return (
		<div className="text-sm text-gray-600">
			{date.toLocaleDateString("vi-VN")}
		</div>
	);
};

const useCustomerManagement = () => {
	const [searchParams, setSearchParams] = useState<
		Omit<GetCustomerListRequest, "page" | "limit" | "offset">
	>({});

	const pagination = usePagination({
		initialPage: 1,
		initialLimit: 10,
	});

	// Prepare query parameters
	const queryParams: GetCustomerListRequest = {
		page: pagination.paginationState.current_page,
		limit: pagination.paginationState.records_per_page,
		...searchParams,
	};

	const {
		data: customerListResponse,
		isLoading: isGetCustomerListPending,
		error,
		refetch,
	} = useGetCustomerList(queryParams);

	// Update pagination state when data changes
	useEffect(() => {
		if (customerListResponse) {
			pagination.updatePagination({
				current_page: customerListResponse.pagination?.current_page || 1,
				records_per_page:
					customerListResponse.pagination?.records_per_page || 10,
				total_pages: customerListResponse.pagination?.total_pages || 0,
				total_records: customerListResponse.pagination?.total_records || 0,
			});
		}
	}, [customerListResponse, pagination.updatePagination]);

	const colDefs: ColDef<Customer>[] = [
		{
			headerName: "Customer Code",
			field: "customer_code",
			width: 120,
			pinned: "left",
		},
		{
			headerName: "Name",
			field: "name",
			flex: 1,
			minWidth: 150,
		},
		{
			headerName: "Email",
			field: "email",
			flex: 1,
			minWidth: 200,
		},
		{
			headerName: "Phone",
			field: "phone_number",
			width: 130,
		},
		{
			headerName: "Group",
			field: "customer_group",
			width: 100,
			cellRenderer: CustomerGroupCellRenderer,
		},
		{
			headerName: "Type",
			field: "customer_type",
			width: 100,
			cellRenderer: CustomerTypeCellRenderer,
		},
		{
			headerName: "Status",
			field: "status",
			width: 100,
			cellRenderer: CustomerStatusCellRenderer,
		},
		{
			headerName: "Address",
			field: "street_address",
			flex: 2,
			minWidth: 250,
			cellRenderer: AddressCellRenderer,
		},
		{
			headerName: "Created At",
			field: "created_at",
			width: 120,
			cellRenderer: DateCellRenderer,
		},
		{
			headerName: "Updated At",
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

	const setGroupFilter = (customer_group: CustomerGroup) => {
		setSearchParams((prev) => ({ ...prev, customer_group }));
		pagination.setPage(1); // Reset to first page when filtering
	};

	const setTypeFilter = (customer_type: CustomerType) => {
		setSearchParams((prev) => ({ ...prev, customer_type }));
		pagination.setPage(1); // Reset to first page when filtering
	};

	const setStatusFilter = (status: CustomerStatus) => {
		setSearchParams((prev) => ({ ...prev, status }));
		pagination.setPage(1); // Reset to first page when filtering
	};

	const setSourceFilter = (customer_source: CustomerSource) => {
		setSearchParams((prev) => ({ ...prev, customer_source }));
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
		customerList: customerListResponse?.data || [],
		total: customerListResponse?.pagination?.total_records || 0,
		isGetCustomerListPending,
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
		setGroupFilter,
		setTypeFilter,
		setStatusFilter,
		setSourceFilter,
		setSortBy,
		clearFilters,

		// Actions
		refetch,
	};
};

export default useCustomerManagement;
