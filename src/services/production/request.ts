import { request } from "@/utils/request.util";
import type { ProductionOrder } from "@/models/production-order.model";

type PaginatedResponse<T> = {
	data: T[];
	pagination: { current_page: number; records_per_page: number; total_pages: number; total_records: number };
};

export const getProductionOrders = (params?: {
	q?: string; page?: number; limit?: number; status?: string;
}): Promise<PaginatedResponse<ProductionOrder>> =>
	request({ url: "/production-orders", method: "GET", params });

export const getProductionOrder = (id: string): Promise<ProductionOrder> =>
	request({ url: `/production-orders/${id}`, method: "GET" });

export const createProductionOrder = (data: {
	product_id?: string;
	notes?: string;
	items: { variant_id?: string; size: string; color?: string; qty_planned: number }[];
}): Promise<ProductionOrder> =>
	request({ url: "/production-orders", method: "POST", data });

export const updateProductionStatus = (id: string, status: string): Promise<ProductionOrder> =>
	request({ url: `/production-orders/${id}/status`, method: "PUT", data: { status } });

export const stockInFromProduction = (data: {
	production_order_id: string;
	items: { item_id: string; quantity: number }[];
}): Promise<ProductionOrder> =>
	request({ url: "/production-orders/stock-in", method: "POST", data });
