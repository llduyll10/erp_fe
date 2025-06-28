import { useMutation, useQuery } from "@tanstack/react-query";
import { createCustomer, getCustomerDetail, getCustomerList } from "./request";
import {
	CreateCustomerRequest,
	GetCustomerListRequest,
} from "@/interfaces/customer.interface";
import { QUERY_KEYS } from "@/constants/query.constant";

export const useCreateCustomer = () => {
	return useMutation({
		mutationFn: async (data: CreateCustomerRequest) => {
			const response = await createCustomer(data);
			return response;
		},
	});
};

export const useGetCustomerList = (
	params?: GetCustomerListRequest,
	enabled = true
) => {
	return useQuery({
		queryKey: [QUERY_KEYS.CUSTOMER.LIST, params],
		queryFn: () => getCustomerList(params),
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

export const useGetCustomerDetail = (id: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.CUSTOMER.DETAIL, id],
		queryFn: () => getCustomerDetail(id),
		enabled: !!id,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};
