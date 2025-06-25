import { User } from "@/models/user.model";
import type { ApiListResponse, PaginationParams } from "./common.interface";
import { Product } from "@/models/product.model";
import { ProductVariant } from "@/models/product-variant.model";

type GetProductListRequest = {
	q?: string;
} & PaginationParams;

type GetProductListResponse = ApiListResponse<Product>;

// For tree-like table structure
type ProductTableRowType = "product" | "variant";

interface ProductTableRow {
	id: string;
	rowType: ProductTableRowType;
	level: number; // 0 for products, 1 for variants
	isExpanded?: boolean;
	parentId?: string;

	// Product fields
	name?: string;
	description?: string;
	item_type?: string;
	created_at?: Date;
	updated_at?: Date;

	// Variant fields
	sku?: string;
	size?: string;
	color?: string;
	gender?: string;
	price?: number;
	cost?: number;
	unit?: string;
	quantity?: number;
	status?: string;

	// Raw data for reference
	rawProduct?: Product;
	rawVariant?: ProductVariant;
}

export type {
	GetProductListResponse,
	GetProductListRequest,
	ProductTableRow,
	ProductTableRowType,
};
