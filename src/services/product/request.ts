import { request } from "@/utils/request.util";
import {
	GetProductListRequest,
	GetProductListResponse,
	CreateProductRequest,
	ProductResponse,
	CreateVariantRequest,
	VariantResponse,
	GetVariantListRequest,
	GetVariantListResponse,
	UpdateProductRequest,
	GetAllVariantsRequest,
	GetAllVariantsResponse,
} from "@/interfaces/product.interface";

export const getProductList = async (
	params?: GetProductListRequest
): Promise<GetProductListResponse> => {
	return await request({
		url: "/products",
		method: "GET",
		params,
	});
};

export const createProduct = async (
	data: CreateProductRequest
): Promise<ProductResponse> => {
	return await request({
		url: "/products",
		method: "POST",
		data,
	});
};

export const getProductDetail = async (
	productId: string
): Promise<ProductResponse> => {
	return await request({
		url: `/products/${productId}`,
		method: "GET",
	});
};

export const updateProduct = async (
	id: string,
	data: UpdateProductRequest
): Promise<ProductResponse> => {
	return await request({
		url: `/products/${id}`,
		method: "PUT",
		data,
	});
};

//============== Variant ================================================

export const createVariant = async (
	data: CreateVariantRequest
): Promise<VariantResponse> => {
	return await request({
		url: "/product-variants",
		method: "POST",
		data,
	});
};

export const getVariantList = async (
	params?: GetVariantListRequest
): Promise<GetVariantListResponse> => {
	return await request({
		url: "/product-variants",
		method: "GET",
		params,
	});
};

export const getVariantDetail = async (
	variantId: string
): Promise<VariantResponse> => {
	return await request({
		url: `/product-variants/${variantId}`,
		method: "GET",
	});
};

export const updateVariant = async (id: string, data: { price?: number; cost?: number; status?: string; file_key?: string }) =>
	request({ url: `/product-variants/${id}`, method: "PATCH", data });

export const deleteVariant = async (id: string) =>
	request({ url: `/product-variants/${id}`, method: "DELETE" });

export const deleteProduct = async (id: string) =>
	request({ url: `/products/${id}`, method: "DELETE" });

// Get all variants for order creation with enhanced data
export const getAllVariants = async (
	params?: GetAllVariantsRequest
): Promise<GetAllVariantsResponse> => {
	return await request({
		url: "/product-variants/all",
		method: "GET",
		params,
	});
};

// ── Product Media ────────────────────────────────────────────────────────

export const getProductMedia = (productId: string) =>
	request({ url: `/products/${productId}/media`, method: "GET" });

export const addProductMedia = (
	productId: string,
	data: { file_key: string; thumbnail_key?: string; type?: string; is_primary?: boolean }
) => request({ url: `/products/${productId}/media`, method: "POST", data });

export const setPrimaryMedia = (productId: string, mediaId: string) =>
	request({ url: `/products/${productId}/media/${mediaId}/primary`, method: "PUT" });

export const deleteProductMedia = (productId: string, mediaId: string) =>
	request({ url: `/products/${productId}/media/${mediaId}`, method: "DELETE" });

export const toggleVisibleForSales = (productId: string) =>
	request({ url: `/products/${productId}/toggle-sales`, method: "PUT" });

// ── Sales Catalog ────────────────────────────────────────────────────────

export const getSalesCatalog = (q?: string) =>
	request({ url: "/products/sales-catalog", method: "GET", params: q ? { q } : undefined });

// ── Inventory Overview ───────────────────────────────────────────────────

export const getInventoryOverview = (q?: string) =>
	request({ url: "/products/inventory-overview", method: "GET", params: q ? { q } : undefined });
