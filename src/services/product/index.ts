import { useMutation, useQuery } from "@tanstack/react-query";
import {
	createProduct,
	createVariant,
	getProductDetail,
	getProductList,
	getVariantDetail,
	getVariantList,
	updateProduct,
} from "./request";
import { QUERY_KEYS } from "@/constants/query.constant";
import {
	CreateProductRequest,
	CreateVariantRequest,
	GetProductListRequest,
	GetVariantListRequest,
	UpdateProductRequest,
} from "@/interfaces/product.interface";

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

export const useCreateProduct = () => {
	return useMutation({
		mutationFn: (data: CreateProductRequest) => createProduct(data),
	});
};

export const useGetProductDetail = (productId: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.PRODUCT.DETAIL, productId],
		queryFn: () => getProductDetail(productId),
		enabled: !!productId,
	});
};

export const useUpdateProduct = () => {
	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateProductRequest;
		}) => {
			const response = await updateProduct(id, data);
			return response;
		},
	});
};

//============== Variant ================================================

export const useCreateVariant = () => {
	return useMutation({
		mutationFn: (data: CreateVariantRequest) => createVariant(data),
	});
};

export const useGetVariantList = (params?: GetVariantListRequest) => {
	return useQuery({
		queryKey: [QUERY_KEYS.VARIANT.LIST, params],
		queryFn: () => getVariantList(params),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

export const useGetVariantDetail = (variantId: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.VARIANT.DETAIL, variantId],
		queryFn: () => getVariantDetail(variantId),
		enabled: !!variantId,
	});
};
