import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/constants/query.constant";
import {
	getSalesOrders, getSalesOrder, updateSalesOrderStatus,
	getImportBatches, getBatchErrors, importCsvFile,
} from "./request";

export const useGetSalesOrders = (params?: {
	q?: string; page?: number; limit?: number; status?: string;
	import_batch_id?: string; has_print?: string;
}) =>
	useQuery({
		queryKey: [QUERY_KEYS.SALES_ORDERS.LIST, params],
		queryFn: () => getSalesOrders(params),
		staleTime: 60 * 1000,
	});

export const useGetSalesOrder = (id: string) =>
	useQuery({
		queryKey: [QUERY_KEYS.SALES_ORDERS.DETAIL, id],
		queryFn: () => getSalesOrder(id),
		enabled: !!id,
	});

export const useUpdateSalesOrderStatus = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, status }: { id: string; status: string }) =>
			updateSalesOrderStatus(id, status),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.SALES_ORDERS.LIST] });
			toast.success("Đã cập nhật trạng thái đơn hàng");
		},
	});
};

export const useGetImportBatches = (params?: { page?: number; limit?: number }) =>
	useQuery({
		queryKey: [QUERY_KEYS.SALES_ORDERS.BATCHES, params],
		queryFn: () => getImportBatches(params),
		staleTime: 60 * 1000,
	});

export const useGetBatchErrors = (batchId: string) =>
	useQuery({
		queryKey: [QUERY_KEYS.SALES_ORDERS.BATCH_ERRORS, batchId],
		queryFn: () => getBatchErrors(batchId),
		enabled: !!batchId,
	});

export const useImportCsv = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: importCsvFile,
		onSuccess: (batch) => {
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.SALES_ORDERS.LIST] });
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.SALES_ORDERS.BATCHES] });
			toast.success(`Import xong: ${batch.success_rows} đơn thành công, ${batch.error_rows} lỗi`);
		},
		onError: () => toast.error("Import thất bại"),
	});
};
