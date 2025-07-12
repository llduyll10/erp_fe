/**
 * Warehouse API Request Functions
 * Raw API calls for warehouse operations
 */

import {
	CreateStockInRequest,
	CreateStockOutRequest,
	FulfillOrderRequest,
	GetStockMovementsRequest,
	StockMovementResponse,
	StockMovementListResponse,
	StockSummaryResponseType,
	WarehouseSummaryResponse,
	CreateWarehouseRequest,
	UpdateWarehouseRequest,
	GetWarehouseListRequest,
	WarehouseResponse,
	WarehouseListResponse,
} from "@/interfaces/warehouse.interface";
import { request } from "../../utils/request.util";

// Stock Movement Operations
export const createStockIn = async (
	data: CreateStockInRequest
): Promise<StockMovementResponse> => {
	return await request({
		url: "/warehouse/stock-in",
		method: "POST",
		data,
	});
};

export const createStockOut = async (
	data: CreateStockOutRequest
): Promise<StockMovementResponse> => {
	return await request({
		url: "/warehouse/stock-out",
		method: "POST",
		data,
	});
};

export const fulfillOrder = async (
	data: FulfillOrderRequest
): Promise<StockMovementResponse[]> => {
	return await request({
		url: "/warehouse/fulfill-order",
		method: "POST",
		data,
	});
};

export const getStockMovements = async (
	params?: GetStockMovementsRequest
): Promise<StockMovementListResponse> => {
	return await request({
		url: "/warehouse/movements",
		method: "GET",
		params,
	});
};

export const getStockMovementDetail = async (
	id: string
): Promise<StockMovementResponse> => {
	return await request({
		url: `/warehouse/movements/${id}`,
		method: "GET",
	});
};

export const getStockSummary = async (): Promise<StockSummaryResponseType> => {
	return await request({
		url: "/warehouse/summary",
		method: "GET",
	});
};

export const getStockDashboardSummary = async () => {
	return await request({
		url: "/warehouse/dashboard-stock-summary",
		method: "GET",
	});
};

export const getWarehouseSummary =
	async (): Promise<WarehouseSummaryResponse> => {
		return await request({
			url: "/warehouse/dashboard-summary",
			method: "GET",
		});
	};

// Warehouse Management Operations
export const createWarehouse = async (
	data: CreateWarehouseRequest
): Promise<WarehouseResponse> => {
	return await request({
		url: "/warehouses",
		method: "POST",
		data,
	});
};

export const getWarehouseList = async (
	params?: GetWarehouseListRequest
): Promise<WarehouseListResponse> => {
	return await request({
		url: "/warehouses",
		method: "GET",
		params,
	});
};

export const getWarehouseDetail = async (
	id: string
): Promise<WarehouseResponse> => {
	return await request({
		url: `/warehouses/${id}`,
		method: "GET",
	});
};

export const updateWarehouse = async (
	id: string,
	data: UpdateWarehouseRequest
): Promise<WarehouseResponse> => {
	return await request({
		url: `/warehouses/${id}`,
		method: "PUT",
		data,
	});
};

export const deleteWarehouse = async (id: string): Promise<void> => {
	return await request({
		url: `/warehouses/${id}`,
		method: "DELETE",
	});
};
