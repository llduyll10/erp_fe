import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createProduct,
	createVariant,
	getProductDetail,
	getProductList,
	getVariantDetail,
	getVariantList,
	updateProduct,
	updateVariant,
	deleteVariant,
	deleteProduct,
	getAllVariants,
	getProductMedia,
	addProductMedia,
	setPrimaryMedia,
	deleteProductMedia,
	toggleVisibleForSales,
	getSalesCatalog,
	getInventoryOverview,
} from "./request";
import { QUERY_KEYS } from "@/constants/query.constant";
import {
	CreateProductRequest,
	CreateVariantRequest,
	GetProductListRequest,
	GetVariantListRequest,
	UpdateProductRequest,
	GetAllVariantsRequest,
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

// Get all variants for order creation with enhanced data
export const useGetAllVariants = (
	params?: GetAllVariantsRequest,
	enabled = true
) => {
	return useQuery({
		queryKey: [QUERY_KEYS.VARIANT.ALL, params],
		queryFn: () => getAllVariants(params),
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

// ── Product Media ─────────────────────────────────────────────────────────

export const useGetProductMedia = (productId: string) =>
	useQuery({
		queryKey: [QUERY_KEYS.PRODUCT.MEDIA, productId],
		queryFn: () => getProductMedia(productId),
		enabled: !!productId,
	});

export const useAddProductMedia = (productId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof addProductMedia>[1]) =>
			addProductMedia(productId, data),
		onSuccess: () =>
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCT.MEDIA, productId] }),
	});
};

export const useSetPrimaryMedia = (productId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (mediaId: string) => setPrimaryMedia(productId, mediaId),
		onSuccess: () =>
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCT.MEDIA, productId] }),
	});
};

export const useDeleteProductMedia = (productId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (mediaId: string) => deleteProductMedia(productId, mediaId),
		onSuccess: () =>
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCT.MEDIA, productId] }),
	});
};

export const useToggleVisibleForSales = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: toggleVisibleForSales,
		onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCT.LIST] }),
	});
};

// ── Sales Catalog ─────────────────────────────────────────────────────────

export const useGetSalesCatalog = (q?: string) =>
	useQuery({
		queryKey: [QUERY_KEYS.PRODUCT.SALES_CATALOG, q],
		queryFn: () => getSalesCatalog(q),
		staleTime: 0, // always refetch after any stock mutation
	});

// ── Inventory Overview ────────────────────────────────────────────────────

export const useGetInventoryOverview = (q?: string) =>
	useQuery({
		queryKey: [QUERY_KEYS.WAREHOUSE.INVENTORY_OVERVIEW, q],
		queryFn: () => getInventoryOverview(q),
		staleTime: 60 * 1000,
	});

export const useUpdateVariant = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateVariant>[1] }) =>
			updateVariant(id, data),
		onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.VARIANT.LIST] }),
	});
};

export const useDeleteVariant = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteVariant(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.VARIANT.LIST] }),
	});
};

export const useDeleteProduct = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteProduct(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCT.LIST] });
		},
	});
};
