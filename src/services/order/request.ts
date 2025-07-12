import {
	OrderResponse,
	CreateOrderRequest,
	OrderListResponse,
	UpdateOrderRequest,
	GetOrderListRequest,
	GetOrderByNumberRequest,
} from "@/interfaces/order.interface";
import { request } from "../../utils/request.util";

export const createOrder = async (
	data: CreateOrderRequest
): Promise<OrderResponse> => {
	return await request({
		url: "/orders",
		method: "POST",
		data,
	});
};

export const getOrderList = async (
	params?: GetOrderListRequest
): Promise<OrderListResponse> => {
	return await request({
		url: "/orders",
		method: "GET",
		params,
	});
};

export const getOrderDetail = async (id: string): Promise<OrderResponse> => {
	return await request({
		url: `/orders/${id}`,
		method: "GET",
	});
};

export const getOrderByNumber = async (
	orderNumber: string
): Promise<OrderResponse> => {
	return await request({
		url: `/orders/number/${orderNumber}`,
		method: "GET",
	});
};

export const updateOrder = async (
	id: string,
	data: UpdateOrderRequest
): Promise<OrderResponse> => {
	return await request({
		url: `/orders/${id}`,
		method: "PUT",
		data,
	});
};

export const deleteOrder = async (id: string): Promise<void> => {
	return await request({
		url: `/orders/${id}`,
		method: "DELETE",
	});
};
