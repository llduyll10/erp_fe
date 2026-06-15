import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getSettings,
	updateCompanyInfo,
	updateProductSettings,
	updateStorageSettings,
} from "./request";
import { QUERY_KEYS } from "@/constants/query.constant";
import { toast } from "sonner";

export const useGetSettings = () =>
	useQuery({
		queryKey: [QUERY_KEYS.SETTINGS.DETAIL],
		queryFn: getSettings,
		staleTime: 5 * 60 * 1000,
	});

export const useUpdateCompanyInfo = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: updateCompanyInfo,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.SETTINGS.DETAIL] });
			toast.success("Đã lưu thông tin công ty");
		},
	});
};

export const useUpdateProductSettings = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: updateProductSettings,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.SETTINGS.DETAIL] });
			toast.success("Đã lưu cấu hình sản phẩm");
		},
	});
};

export const useUpdateStorageSettings = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: updateStorageSettings,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.SETTINGS.DETAIL] });
			toast.success("Đã lưu cấu hình lưu trữ");
		},
	});
};
