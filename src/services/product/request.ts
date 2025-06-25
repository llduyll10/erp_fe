import { request } from "@/utils/request.util";
import {
	GetProductListRequest,
	GetProductListResponse,
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
