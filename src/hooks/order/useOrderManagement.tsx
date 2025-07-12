import { type ColDef } from "ag-grid-community";
import { useEffect, useState } from "react";
import { usePagination } from "@/hooks/common/usePagination";
import { useGetOrderList } from "@/services/order";
import { Order } from "@/models/order.model";
import { GetOrderListRequest } from "@/interfaces/order.interface";
import { Badge } from "@/components/ui/badge";
import {
	OrderStatus,
	FulfillmentStatus,
	PaymentStatus,
} from "@/enums/order.enum";
import { useTranslation } from "react-i18next";

// Order Status Cell Renderer
const OrderStatusCellRenderer = (params: any) => {
	const { value } = params;
	if (!value) return "-";

	const colorMap: Record<string, string> = {
		[OrderStatus.NEW]: "bg-blue-100 text-blue-800",
		[OrderStatus.WAREHOUSE_CONFIRMED]: "bg-purple-100 text-purple-800",
		[OrderStatus.NEED_PRODUCTION]: "bg-yellow-100 text-yellow-800",
		[OrderStatus.IN_PRODUCTION]: "bg-orange-100 text-orange-800",
		[OrderStatus.READY]: "bg-green-100 text-green-800",
		[OrderStatus.DELIVERING]: "bg-indigo-100 text-indigo-800",
		[OrderStatus.DELIVERED]: "bg-teal-100 text-teal-800",
		[OrderStatus.COMPLETED]: "bg-emerald-100 text-emerald-800",
		[OrderStatus.CANCELLED]: "bg-red-100 text-red-800",
	};

	return (
		<Badge className={colorMap[value] || "bg-gray-100 text-gray-800"}>
			{value.toUpperCase().replace(/_/g, " ")}
		</Badge>
	);
};

// Fulfillment Status Cell Renderer
const FulfillmentStatusCellRenderer = (params: any) => {
	const { value } = params;
	if (!value) return "-";

	const colorMap: Record<string, string> = {
		[FulfillmentStatus.PENDING]: "bg-gray-100 text-gray-800",
		[FulfillmentStatus.IN_PRODUCTION]: "bg-orange-100 text-orange-800",
		[FulfillmentStatus.STOCK_READY]: "bg-green-100 text-green-800",
		[FulfillmentStatus.SHIPPED]: "bg-blue-100 text-blue-800",
	};

	return (
		<Badge className={colorMap[value] || "bg-gray-100 text-gray-800"}>
			{value.toUpperCase().replace(/_/g, " ")}
		</Badge>
	);
};

// Payment Status Cell Renderer
const PaymentStatusCellRenderer = (params: any) => {
	const { value } = params;
	if (!value) return "-";

	const colorMap: Record<string, string> = {
		[PaymentStatus.UNPAID]: "bg-red-100 text-red-800",
		[PaymentStatus.PARTIAL]: "bg-yellow-100 text-yellow-800",
		[PaymentStatus.PAID]: "bg-green-100 text-green-800",
		[PaymentStatus.REFUNDED]: "bg-purple-100 text-purple-800",
	};

	return (
		<Badge className={colorMap[value] || "bg-gray-100 text-gray-800"}>
			{value.toUpperCase()}
		</Badge>
	);
};

// Customer Name Cell Renderer
const CustomerNameCellRenderer = (params: any) => {
	const { data } = params;
	return <div className="text-sm">{data.customer?.name || "-"}</div>;
};

// Sales Rep Cell Renderer
const SalesRepCellRenderer = (params: any) => {
	const { data } = params;
	return (
		<div className="text-sm">{data.sales_representative?.name || "-"}</div>
	);
};

// Date Cell Renderer
const DateCellRenderer = (params: any) => {
	const { value } = params;
	if (!value) return "-";
	return <div className="text-sm">{new Date(value).toLocaleDateString()}</div>;
};

const useOrderManagement = () => {
	const { t } = useTranslation("common");
	const [searchParams, setSearchParams] = useState<
		Omit<GetOrderListRequest, "page" | "limit" | "offset">
	>({});

	const pagination = usePagination({
		initialPage: 1,
		initialLimit: 10,
	});

	// Prepare query parameters
	const queryParams: GetOrderListRequest = {
		page: pagination.paginationState.current_page,
		limit: pagination.paginationState.records_per_page,
		...searchParams,
	};

	const {
		data: orderListResponse,
		isLoading: isGetOrderListPending,
		error,
		refetch,
	} = useGetOrderList(queryParams);

	// Update pagination state when data changes
	useEffect(() => {
		if (orderListResponse) {
			pagination.updatePagination({
				current_page: orderListResponse.pagination?.current_page || 1,
				records_per_page: orderListResponse.pagination?.records_per_page || 10,
				total_pages: orderListResponse.pagination?.total_pages || 0,
				total_records: orderListResponse.pagination?.total_records || 0,
			});
		}
	}, [orderListResponse, pagination.updatePagination]);

	const colDefs: ColDef<Order>[] = [
		{
			headerName: t("modules.orders.columns.orderNumber"),
			field: "order_number",
			width: 140,
			pinned: "left",
		},
		{
			headerName: t("modules.orders.columns.customer"),
			field: "customer.name",
			flex: 1,
			minWidth: 150,
			cellRenderer: CustomerNameCellRenderer,
		},
		{
			headerName: "Sales Rep",
			field: "sales_representative.name",
			flex: 1,
			minWidth: 150,
			cellRenderer: SalesRepCellRenderer,
		},
		{
			headerName: t("modules.orders.columns.status"),
			field: "status",
			width: 140,
			cellRenderer: OrderStatusCellRenderer,
		},
		{
			headerName: t("modules.orders.columns.fulfillmentStatus"),
			field: "fulfillment_status",
			width: 120,
			cellRenderer: FulfillmentStatusCellRenderer,
		},
		{
			headerName: t("modules.orders.columns.paymentStatus"),
			field: "payment_status",
			width: 100,
			cellRenderer: PaymentStatusCellRenderer,
		},
		{
			headerName: t("modules.orders.columns.createdAt"),
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

	const setStatusFilter = (status: OrderStatus) => {
		setSearchParams((prev) => ({ ...prev, status }));
		pagination.setPage(1); // Reset to first page when filtering
	};

	const setFulfillmentStatusFilter = (
		fulfillment_status: FulfillmentStatus
	) => {
		setSearchParams((prev) => ({ ...prev, fulfillment_status }));
		pagination.setPage(1); // Reset to first page when filtering
	};

	const setPaymentStatusFilter = (payment_status: PaymentStatus) => {
		setSearchParams((prev) => ({ ...prev, payment_status }));
		pagination.setPage(1); // Reset to first page when filtering
	};

	const setCustomerFilter = (customer_id: string) => {
		setSearchParams((prev) => ({ ...prev, customer_id }));
		pagination.setPage(1); // Reset to first page when filtering
	};

	const setSalesRepFilter = (sales_representative_id: string) => {
		setSearchParams((prev) => ({ ...prev, sales_representative_id }));
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
		orderList: orderListResponse?.data || [],
		total: orderListResponse?.pagination?.total_records || 0,
		isGetOrderListPending,
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
		setStatusFilter,
		setFulfillmentStatusFilter,
		setPaymentStatusFilter,
		setCustomerFilter,
		setSalesRepFilter,
		setSortBy,
		clearFilters,

		// Actions
		refetch,
	};
};

export default useOrderManagement;
