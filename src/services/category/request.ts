import { request } from "../../utils/request.util";
import {
	CategoryListResponse,
	GetCategoryListRequest,
} from "@/interfaces/category.interface";

export const getListCategory = async (
	params?: GetCategoryListRequest
): Promise<CategoryListResponse> => {
	return await request({
		url: "/categories",
		method: "GET",
		params,
	});
};
