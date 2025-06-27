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
