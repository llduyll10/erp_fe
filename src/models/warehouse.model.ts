/**
 * Warehouse Module Models
 * Type definitions for warehouse-related entities
 */

import type { User } from "./user.model";
import type { ProductVariant } from "./product.model";
import type { Order } from "./order.model";
import { StockMovementType, StockMovementReason, WarehouseStatus, WarehouseType } from "@/enums/warehouse.enum";

export type StockMovement = {
	id?: string | null;
	company_id?: string | null;
	variant_id?: string | null;
	order_id?: string | null;
	type?: StockMovementType | null;
	quantity?: number | null;
	reason?: string | null;
	reason_type?: StockMovementReason | null;
	created_by?: string | null;
	updated_by?: string | null;
	created_at?: Date | null;
	updated_at?: Date | null;

	// Relations
	variant?: ProductVariant | null;
	order?: Order | null;
	created_by_user?: User | null;
	updated_by_user?: User | null;
};

export type StockSummary = {
	variant_id?: string | null;
	current_stock?: number | null;
	total_stock_in?: number | null;
	total_stock_out?: number | null;
	variant?: ProductVariant | null;
};

export type Warehouse = {
	id?: string | null;
	company_id?: string | null;
	warehouse_code?: string | null;
	name?: string | null;
	warehouse_type?: WarehouseType | null;
	status?: WarehouseStatus | null;
	manager_id?: string | null;
	street_address?: string | null;
	country?: string | null;
	state_province?: string | null;
	district?: string | null;
	ward?: string | null;
	postal_code?: string | null;
	city?: string | null;
	description?: string | null;
	created_at?: Date | null;
	updated_at?: Date | null;

	// Relations
	manager?: User | null;
};

export type WarehouseSummary = {
	total_warehouses?: number | null;
	active_warehouses?: number | null;
	inactive_warehouses?: number | null;
	maintenance_warehouses?: number | null;
};

export type StockSummaryResponse = {
	total_products?: number | null;
	in_stock_count?: number | null;
	out_of_stock_count?: number | null;
	low_stock_count?: number | null;
	total_value?: number | null;
};

export type WarehouseDashboardSummary = {
	total_products?: number | null;
	in_stock_count?: number | null;
	out_of_stock_count?: number | null;
	low_stock_count?: number | null;
	total_value?: number | null;
};