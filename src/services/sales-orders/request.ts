import { request } from "@/utils/request.util";
import axios from "axios";
import { getAuthTokens } from "@/utils/auth.util";
import { backendDomain } from "@/utils/request.util";
import type { SalesOrder, ImportBatch, ImportError } from "@/models/sales-order.model";

type PaginatedResponse<T> = {
	data: T[];
	pagination: { current_page: number; records_per_page: number; total_pages: number; total_records: number };
};

export const getSalesOrders = (params?: {
	q?: string; page?: number; limit?: number; status?: string;
	import_batch_id?: string; has_print?: string;
}): Promise<PaginatedResponse<SalesOrder>> =>
	request({ url: "/sales-orders", method: "GET", params });

export const getSalesOrder = (id: string): Promise<SalesOrder> =>
	request({ url: `/sales-orders/${id}`, method: "GET" });

export const updateSalesOrderStatus = (id: string, status: string): Promise<SalesOrder> =>
	request({ url: `/sales-orders/${id}/status`, method: "PUT", data: { status } });

export const getImportBatches = (params?: {
	page?: number; limit?: number;
}): Promise<{ data: ImportBatch[]; total: number }> =>
	request({ url: "/sales-orders/batches/list", method: "GET", params });

export const getBatchErrors = (batchId: string): Promise<ImportError[]> =>
	request({ url: `/sales-orders/batches/${batchId}/errors`, method: "GET" });

export const importCsvFile = async (file: File): Promise<ImportBatch> => {
	const tokens = getAuthTokens();
	const formData = new FormData();
	formData.append("file", file);
	const res = await axios.post(
		`${backendDomain}/api/v1/sales-orders/import`,
		formData,
		{
			headers: {
				Authorization: `Bearer ${tokens?.access_token}`,
				"Content-Type": "multipart/form-data",
			},
		},
	);
	return res.data;
};
