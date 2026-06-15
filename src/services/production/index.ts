import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/constants/query.constant";
import {
	getProductionOrders, getProductionOrder, createProductionOrder,
	updateProductionStatus, stockInFromProduction,
} from "./request";

export const useGetProductionOrders = (params?: {
	q?: string; page?: number; limit?: number; status?: string;
}) =>
	useQuery({
		queryKey: [QUERY_KEYS.PRODUCTION.LIST, params],
		queryFn: () => getProductionOrders(params),
		staleTime: 60 * 1000,
	});

export const useGetProductionOrder = (id: string) =>
	useQuery({
		queryKey: [QUERY_KEYS.PRODUCTION.DETAIL, id],
		queryFn: () => getProductionOrder(id),
		enabled: !!id,
	});

export const useCreateProductionOrder = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: createProductionOrder,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTION.LIST] });
			toast.success("Đã tạo lệnh sản xuất");
		},
	});
};

export const useUpdateProductionStatus = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, status }: { id: string; status: string }) =>
			updateProductionStatus(id, status),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTION.LIST] });
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTION.DETAIL] });
			toast.success("Đã cập nhật trạng thái");
		},
	});
};

export const useStockInFromProduction = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: stockInFromProduction,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTION.DETAIL] });
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.WAREHOUSE.INVENTORY_OVERVIEW] });
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.WAREHOUSE.INVENTORY] });
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.WAREHOUSE.SUMMARY] });
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCT.SALES_CATALOG] });
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.VARIANT.ALL] });
			toast.success("Đã nhập kho thành công");
		},
	});
};
