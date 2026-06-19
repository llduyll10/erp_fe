import { request } from "../../utils/request.util";
import {
	CategoryListResponse,
	GetCategoryListRequest,
} from "@/interfaces/category.interface";
import type { Category } from "@/models/category.model";

export const getListCategory = async (
	params?: GetCategoryListRequest
): Promise<CategoryListResponse> => {
	return await request({
		url: "/categories",
		method: "GET",
		params,
	});
};

export const createCategory = async (data: {
	name: string;
	code?: string;
	description?: string;
}): Promise<Category> =>
	request({ url: "/categories", method: "POST", data });

export const updateCategory = async (
	id: string,
	data: { name?: string; code?: string; description?: string }
): Promise<Category> =>
	request({ url: `/categories/${id}`, method: "PUT", data });

export const deleteCategory = async (id: string): Promise<void> =>
	request({ url: `/categories/${id}`, method: "DELETE" });
