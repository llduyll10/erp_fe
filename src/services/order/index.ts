import { useMutation, useQuery } from "@tanstack/react-query";
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
	return useMutation({
		mutationFn: async (data: CreateOrderRequest) => {
			const response = await createOrder(data);
			return response;
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
	});
};

export const useDeleteOrder = () => {
	return useMutation({
		mutationFn: async (id: string) => {
			await deleteOrder(id);
			return id;
		},
	});
};
