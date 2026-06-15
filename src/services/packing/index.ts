import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/constants/query.constant";
import {
	getPackingQueue, getPackingStats, scanForPacking,
	packOrder, shipOrders, getShippedOrders,
} from "./request";

export const useGetPackingQueue = (params?: { q?: string; page?: number; limit?: number }) =>
	useQuery({
		queryKey: [QUERY_KEYS.PACKING.QUEUE, params],
		queryFn: () => getPackingQueue(params),
		staleTime: 30 * 1000,
		refetchInterval: 60 * 1000,
	});

export const useGetPackingStats = () =>
	useQuery({
		queryKey: [QUERY_KEYS.PACKING.STATS],
		queryFn: getPackingStats,
		staleTime: 30 * 1000,
		refetchInterval: 60 * 1000,
	});

export const useScanForPacking = (externalOrderId: string, enabled = false) =>
	useQuery({
		queryKey: [QUERY_KEYS.PACKING.SCAN, externalOrderId],
		queryFn: () => scanForPacking(externalOrderId),
		enabled: enabled && !!externalOrderId,
		retry: false,
	});

export const usePackOrder = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (external_order_id: string) => packOrder(external_order_id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.PACKING.QUEUE] });
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.PACKING.STATS] });
			toast.success("Đã xác nhận đóng gói");
		},
		onError: (err: any) => toast.error(err?.response?.data?.message ?? "Lỗi đóng gói"),
	});
};

export const useShipOrders = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ ids, notes }: { ids: string[]; notes?: string }) => shipOrders(ids, notes),
		onSuccess: (res: any) => {
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.PACKING.QUEUE] });
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.PACKING.STATS] });
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.PACKING.SHIPPED] });
			toast.success(`Đã gửi bưu cục ${res.shipped} đơn`);
		},
		onError: (err: any) => toast.error(err?.response?.data?.message ?? "Lỗi gửi hàng"),
	});
};

export const useGetShippedOrders = (params?: { q?: string; page?: number }) =>
	useQuery({
		queryKey: [QUERY_KEYS.PACKING.SHIPPED, params],
		queryFn: () => getShippedOrders(params),
		staleTime: 60 * 1000,
	});
