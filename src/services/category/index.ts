import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getListCategory,
	createCategory,
	updateCategory,
	deleteCategory,
} from "./request";
import { QUERY_KEYS } from "@/constants/query.constant";
import { GetCategoryListRequest } from "@/interfaces/category.interface";
import { toast } from "sonner";

export const useGetListCategory = (params?: GetCategoryListRequest) => {
	return useQuery({
		queryKey: [QUERY_KEYS.CATEGORY.LIST, params],
		queryFn: async () => {
			const response = await getListCategory(params);
			return response;
		},
	});
};

export const useCreateCategory = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: createCategory,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORY.LIST] });
			toast.success("Đã tạo danh mục");
		},
	});
};

export const useUpdateCategory = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: { name?: string; code?: string; description?: string } }) =>
			updateCategory(id, data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORY.LIST] });
			toast.success("Đã cập nhật danh mục");
		},
	});
};

export const useDeleteCategory = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: deleteCategory,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORY.LIST] });
			toast.success("Đã xóa danh mục");
		},
	});
};
