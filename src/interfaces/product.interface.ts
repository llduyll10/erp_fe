import { User } from "@/models/user.model";
import type { ApiListResponse, PaginationParams } from "./common.interface";
import { Product } from "@/models/product.model";
import { ProductVariant } from "@/models/product-variant.model";
import {
	ProductColor,
	ProductGender,
	ProductItemType,
	ProductSize,
	ProductStatus,
	ProductUnit,
} from "@/enums/product.enum";

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
	file_key?: string;
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
	product_id?: string; // For variant rows

	// Raw data for reference
	rawProduct?: Product;
	rawVariant?: ProductVariant;
}

type GetProductListRequest = {
	q?: string;
} & PaginationParams;

type GetProductListResponse = ApiListResponse<Product>;

type CreateProductRequest = {
	id?: string;
	name: string;
	description?: string;
	category_id?: string;
	file_key?: string;
	item_type: ProductItemType;
	status: ProductStatus;
};
type UpdateProductRequest = CreateProductRequest;

type ProductResponse = Product;

type CreateVariantRequest = {
	product_id: string;
	size: ProductSize;
	color: ProductColor;
	gender: ProductGender;
	price: number;
	cost: number;
	unit: ProductUnit;
	quantity?: number;
	file_key?: string;
};

type VariantResponse = ProductVariant;

type GetVariantListRequest = {
	q?: string;
	product_id?: string;
} & PaginationParams;
type GetVariantListResponse = ApiListResponse<ProductVariant>;

// Enhanced variants for order creation
type GetAllVariantsRequest = {
	page?: number;
	limit?: number;
	q?: string;
	size?: string;
	color?: string;
	gender?: string;
	category_id?: string;
};

type GetAllVariantsResponse = {
	data: Array<{
		id: string;
		product_id: string;
		sku: string;
		variant_name: string;
		size: string;
		color: string;
		gender: string;
		price: number;
		cost: number;
		unit: string;
		quantity: number;
		status: string;
		file_key?: string;
		product_name: string;
		product_description?: string;
		product_file_key?: string;
		category_name?: string;
		category_id?: string;
		display_name: string;
		is_in_stock: boolean;
	}>;
} & PaginationParams;

export type {
	GetProductListResponse,
	GetProductListRequest,
	ProductTableRow,
	ProductTableRowType,
	CreateProductRequest,
	UpdateProductRequest,
	ProductResponse,
	CreateVariantRequest,
	VariantResponse,
	GetVariantListRequest,
	GetVariantListResponse,
	GetAllVariantsRequest,
	GetAllVariantsResponse,
};
