import { Category } from "@/models/category.model";
import { ApiListResponse, PaginationParams } from "./common.interface";

type CategoryResponse = Category;
type CategoryListResponse = ApiListResponse<Category>;

type GetCategoryListRequest = {
	q?: string;
} & PaginationParams;

type GetCategoryListResponse = ApiListResponse<Category>;

export type {
	CategoryResponse,
	CategoryListResponse,
	GetCategoryListRequest,
	GetCategoryListResponse,
};
