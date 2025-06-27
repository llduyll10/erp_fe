import { useQuery } from "@tanstack/react-query";
import { getListCategory } from "./request";
import { QUERY_KEYS } from "@/constants/query.constant";
import { GetCategoryListRequest } from "@/interfaces/category.interface";

export const useGetListCategory = (params?: GetCategoryListRequest) => {
	return useQuery({
		queryKey: [QUERY_KEYS.CATEGORY.LIST, params],
		queryFn: async () => {
			const response = await getListCategory(params);
			return response;
		},
	});
};
