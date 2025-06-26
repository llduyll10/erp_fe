import { request } from "@/utils/request.util";
import {
	GetProductListRequest,
	GetProductListResponse,
	CreateProductRequest,
	ProductResponse,
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
