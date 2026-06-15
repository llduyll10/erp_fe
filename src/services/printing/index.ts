import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/constants/query.constant";
import {
	getPrintJobs, getPrintJobByBarcode, getPrintJobErrors,
	getPrintJobStats, generatePrintJobs, updatePrintJobStatus,
} from "./request";

export const useGetPrintJobs = (params?: { q?: string; page?: number; limit?: number; status?: string }) =>
	useQuery({
		queryKey: [QUERY_KEYS.PRINTING.LIST, params],
		queryFn: () => getPrintJobs(params),
		staleTime: 30 * 1000,
	});

export const useGetPrintJobByBarcode = (barcode: string, enabled = false) =>
	useQuery({
		queryKey: [QUERY_KEYS.PRINTING.SCAN, barcode],
		queryFn: () => getPrintJobByBarcode(barcode),
		enabled: enabled && !!barcode,
		retry: false,
	});

export const useGetPrintJobErrors = (params?: { q?: string; page?: number }) =>
	useQuery({
		queryKey: [QUERY_KEYS.PRINTING.ERRORS, params],
		queryFn: () => getPrintJobErrors(params),
		staleTime: 30 * 1000,
	});

export const useGetPrintJobStats = () =>
	useQuery({
		queryKey: [QUERY_KEYS.PRINTING.STATS],
		queryFn: getPrintJobStats,
		staleTime: 30 * 1000,
		refetchInterval: 60 * 1000,
	});

export const useGeneratePrintJobs = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: generatePrintJobs,
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRINTING.LIST] });
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRINTING.STATS] });
			toast.success(`Đã tạo ${res.created} print job`);
		},
	});
};

export const useUpdatePrintJobStatus = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, status, error_note }: { id: string; status: string; error_note?: string }) =>
			updatePrintJobStatus(id, status, error_note),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRINTING.LIST] });
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRINTING.STATS] });
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRINTING.ERRORS] });
		},
	});
};
