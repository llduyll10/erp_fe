import { useQuery } from "@tanstack/react-query";
import { getProductList } from "./request";
import { QUERY_KEYS } from "@/constants/query.constant";
import { GetProductListRequest } from "@/interfaces/product.interface";

export const useGetProductList = (
	params?: GetProductListRequest,
	enabled = true
) => {
	return useQuery({
		queryKey: [QUERY_KEYS.PRODUCT.LIST, params],
		queryFn: () => getProductList(params),
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};
