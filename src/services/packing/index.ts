import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/constants/query.constant";
import {
	getPackingQueue, getPackingStats, scanAndPack,
	shipOrders, getShippedOrders,
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

export const useScanAndPack = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (external_order_id: string) => scanAndPack(external_order_id),
		onSuccess: (res) => {
			if (res.status === "packed") {
				qc.invalidateQueries({ queryKey: [QUERY_KEYS.PACKING.QUEUE] });
				qc.invalidateQueries({ queryKey: [QUERY_KEYS.PACKING.STATS] });
			}
		},
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
