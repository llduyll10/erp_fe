import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createOrder,
	getOrderDetail,
	getOrderList,
	getOrderByNumber,
	updateOrder,
	deleteOrder,
} from "./request";
import {
	CreateOrderRequest,
	GetOrderListRequest,
	UpdateOrderRequest,
} from "@/interfaces/order.interface";
import { QUERY_KEYS } from "@/constants/query.constant";

export const useCreateOrder = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateOrderRequest) => {
			const response = await createOrder(data);
			return response;
		},
		onSuccess: () => {
			// Invalidate order list to show new order
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDER.LIST] });
			// Invalidate related queries
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMER.LIST] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WAREHOUSE.SUMMARY] });
		},
	});
};

export const useGetOrderList = (
	params?: GetOrderListRequest,
	enabled = true
) => {
	return useQuery({
		queryKey: [QUERY_KEYS.ORDER.LIST, params],
		queryFn: () => getOrderList(params),
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

export const useGetOrderDetail = (id: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.ORDER.DETAIL, id],
		queryFn: () => getOrderDetail(id),
		enabled: !!id,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

export const useGetOrderByNumber = (orderNumber: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.ORDER.BY_NUMBER, orderNumber],
		queryFn: () => getOrderByNumber(orderNumber),
		enabled: !!orderNumber,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

export const useUpdateOrder = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateOrderRequest;
		}) => {
			const response = await updateOrder(id, data);
			return response;
		},
		onSuccess: (data, variables) => {
			// Invalidate order list to reflect updates
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDER.LIST] });
			// Invalidate specific order detail to refresh current page
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDER.DETAIL, variables.id] });
			// Invalidate order by number queries
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDER.BY_NUMBER] });
			// Invalidate related queries that might be affected
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMER.LIST] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WAREHOUSE.SUMMARY] });
		},
	});
};

export const useDeleteOrder = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			await deleteOrder(id);
			return id;
		},
		onSuccess: (deletedId) => {
			// Invalidate order list to remove deleted order
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDER.LIST] });
			// Remove specific order detail from cache
			queryClient.removeQueries({ queryKey: [QUERY_KEYS.ORDER.DETAIL, deletedId] });
			// Invalidate order by number queries
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDER.BY_NUMBER] });
			// Invalidate related queries
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WAREHOUSE.SUMMARY] });
		},
	});
};
