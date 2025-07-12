import {
	OrderStatus,
	FulfillmentStatus,
	PaymentStatus,
	ProductionStatus,
} from "@/enums/order.enum";
import { ProductUnit } from "@/enums/product.enum";
import { Order, OrderItem } from "@/models/order.model";
import { ApiListResponse, PaginationParams } from "./common.interface";

type CreateOrderItemRequest = {
	product_id?: string;
	variant_id?: string;
	custom_product_id?: string;
	quantity: number;
	unit_price: number;
	total_price: number;
	unit?: ProductUnit;
	production_status?: ProductionStatus;
};

type CreateOrderRequest = {
	customer_id: string;
	sales_representative_id: string;
	status?: OrderStatus;
	fulfillment_status?: FulfillmentStatus;
	payment_status?: PaymentStatus;

	// Shipping Address (All optional)
	shipping_street_address?: string;
	shipping_country?: string;
	shipping_state_province?: string;
	shipping_district?: string;
	shipping_ward?: string;
	shipping_postal_code?: string;
	shipping_city?: string;
	delivery_notes?: string;

	order_items: CreateOrderItemRequest[];
};

type UpdateOrderRequest = Partial<CreateOrderRequest>;

type OrderResponse = Order;

type OrderListResponse = ApiListResponse<Order>;

type GetOrderListRequest = {
	q?: string; // Search by order_number or customer_name
	status?: OrderStatus;
	fulfillment_status?: FulfillmentStatus;
	payment_status?: PaymentStatus;
	customer_id?: string;
	sales_representative_id?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
} & PaginationParams;

type GetOrderByNumberRequest = {
	orderNumber: string;
};

export type {
	CreateOrderRequest,
	CreateOrderItemRequest,
	UpdateOrderRequest,
	OrderResponse,
	OrderListResponse,
	GetOrderListRequest,
	GetOrderByNumberRequest,
};
