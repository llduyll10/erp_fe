/**
 * Warehouse Service Layer
 * React Query hooks for warehouse operations
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/constants/query.constant";
import {
	CreateStockInRequest,
	CreateStockOutRequest,
	FulfillOrderRequest,
	GetStockMovementsRequest,
	CreateWarehouseRequest,
	UpdateWarehouseRequest,
	GetWarehouseListRequest,
} from "@/interfaces/warehouse.interface";
import {
	createStockIn,
	createStockOut,
	fulfillOrder,
	getStockMovements,
	getStockMovementDetail,
	getStockSummary,
	getWarehouseSummary,
	getStockDashboardSummary,
	createWarehouse,
	getWarehouseList,
	getWarehouseDetail,
	updateWarehouse,
	deleteWarehouse,
} from "./request";

// Stock Movement Hooks
export const useCreateStockIn = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createStockIn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WAREHOUSE.MOVEMENTS] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WAREHOUSE.SUMMARY] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VARIANT.ALL] });
			toast.success("Nhập kho thành công");
		},
		onError: (error: any) => {
			toast.error(error?.message || "Nhập kho thất bại");
		},
	});
};

export const useCreateStockOut = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createStockOut,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WAREHOUSE.MOVEMENTS] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WAREHOUSE.SUMMARY] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VARIANT.ALL] });
			toast.success("Xuất kho thành công");
		},
		onError: (error: any) => {
			if (error?.message === "warehouse.insufficient_stock") {
				toast.error(
					`Không đủ hàng. Tồn kho: ${error.current_stock}, Yêu cầu: ${error.requested}`
				);
			} else {
				toast.error(error?.message || "Xuất kho thất bại");
			}
		},
	});
};

export const useFulfillOrder = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: fulfillOrder,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WAREHOUSE.MOVEMENTS] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WAREHOUSE.SUMMARY] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDER.LIST] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VARIANT.ALL] });
			toast.success("Thực hiện đơn hàng thành công");
		},
		onError: (error: any) => {
			toast.error(error?.message || "Thực hiện đơn hàng thất bại");
		},
	});
};

export const useGetStockMovements = (params?: GetStockMovementsRequest) => {
	return useQuery({
		queryKey: [QUERY_KEYS.WAREHOUSE.MOVEMENTS, params],
		queryFn: () => getStockMovements(params),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

export const useGetStockMovementDetail = (id: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.WAREHOUSE.MOVEMENTS, id],
		queryFn: () => getStockMovementDetail(id),
		enabled: !!id,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
};

export const useGetStockSummary = () => {
	return useQuery({
		queryKey: [QUERY_KEYS.WAREHOUSE.SUMMARY],
		queryFn: getStockSummary,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
};

export const useGetStockInventory = () => {
	return useQuery({
		queryKey: [QUERY_KEYS.WAREHOUSE.INVENTORY],
		queryFn: getStockSummary, // Same endpoint for now, but different query key
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
};

export const useGetWarehouseSummary = () => {
	return useQuery({
		queryKey: [QUERY_KEYS.WAREHOUSE.DASHBOARD_SUMMARY],
		queryFn: getWarehouseSummary,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
};

export const useGetStockDashboardSummary = () => {
	return useQuery({
		queryKey: [QUERY_KEYS.WAREHOUSE.SUMMARY, "dashboard"],
		queryFn: getStockDashboardSummary,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
};

// Warehouse Management Hooks
export const useCreateWarehouse = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createWarehouse,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WAREHOUSE.LIST] });
			toast.success("Tạo kho thành công");
		},
		onError: (error: any) => {
			toast.error(error?.message || "Tạo kho thất bại");
		},
	});
};

export const useGetWarehouseList = (params?: GetWarehouseListRequest) => {
	return useQuery({
		queryKey: [QUERY_KEYS.WAREHOUSE.LIST, params],
		queryFn: () => getWarehouseList(params),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
};

export const useGetWarehouseDetail = (id: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.WAREHOUSE.DETAIL, id],
		queryFn: () => getWarehouseDetail(id),
		enabled: !!id,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
};

export const useUpdateWarehouse = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateWarehouseRequest }) =>
			updateWarehouse(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WAREHOUSE.LIST] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WAREHOUSE.DETAIL] });
			toast.success("Cập nhật kho thành công");
		},
		onError: (error: any) => {
			toast.error(error?.message || "Cập nhật kho thất bại");
		},
	});
};

export const useDeleteWarehouse = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteWarehouse,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WAREHOUSE.LIST] });
			toast.success("Xóa kho thành công");
		},
		onError: (error: any) => {
			toast.error(error?.message || "Xóa kho thất bại");
		},
	});
};