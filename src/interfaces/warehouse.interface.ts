/**
 * Warehouse Module Interfaces
 * Request/Response type definitions for warehouse API
 */

import { StockMovementType, StockMovementReason, WarehouseStatus, WarehouseType } from "@/enums/warehouse.enum";
import { StockMovement, StockSummary, Warehouse, WarehouseSummary, StockSummaryResponse } from "@/models/warehouse.model";
import { ApiListResponse, PaginationParams } from "./common.interface";

// Stock Movement Interfaces
export type CreateStockInRequest = {
	variant_id: string;
	quantity: number;
	reason?: string;
	reason_type?: StockMovementReason;
};

export type CreateStockOutRequest = {
	variant_id: string;
	quantity: number;
	reason?: string;
	reason_type?: StockMovementReason;
	order_id?: string;
};

export type FulfillOrderRequest = {
	order_id: string;
	reason?: string;
};

export type GetStockMovementsRequest = {
	q?: string;
	variant_id?: string;
	order_id?: string;
	type?: StockMovementType;
	reason_type?: StockMovementReason;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
} & PaginationParams;

export type StockMovementResponse = StockMovement;
export type StockMovementListResponse = ApiListResponse<StockMovement>;
export type StockSummaryResponseType = StockSummary[];
export type WarehouseSummaryResponse = WarehouseSummary;

// Warehouse Interfaces
export type CreateWarehouseRequest = {
	warehouse_code?: string;
	name: string;
	warehouse_type: WarehouseType;
	status?: WarehouseStatus;
	manager_id?: string;
	street_address?: string;
	country?: string;
	state_province?: string;
	district?: string;
	ward?: string;
	postal_code?: string;
	city?: string;
	description?: string;
};

export type UpdateWarehouseRequest = Partial<CreateWarehouseRequest>;

export type GetWarehouseListRequest = {
	q?: string;
	warehouse_type?: WarehouseType;
	status?: WarehouseStatus;
	manager_id?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
} & PaginationParams;

export type WarehouseResponse = Warehouse;
export type WarehouseListResponse = ApiListResponse<Warehouse>;

// Error Response Interfaces
export type InsufficientStockError = {
	message: string;
	statusCode: number;
	current_stock: number;
	requested: number;
};

export type OrderFulfillmentError = {
	message: string;
	statusCode: number;
	insufficient_items: Array<{
		variant_id: string;
		sku: string;
		current_stock: number;
		required: number;
	}>;
};