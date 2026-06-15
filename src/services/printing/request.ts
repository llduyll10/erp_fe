import { request } from "@/utils/request.util";
import type { PrintJob, PrintJobStats } from "@/models/print-job.model";

type Paginated<T> = { data: T[]; pagination: { current_page: number; records_per_page: number; total_pages: number; total_records: number } };

export const getPrintJobs = (params?: { q?: string; page?: number; limit?: number; status?: string }): Promise<Paginated<PrintJob>> =>
	request({ url: "/print-jobs", method: "GET", params });

export const getPrintJobByBarcode = (barcode: string): Promise<PrintJob> =>
	request({ url: `/print-jobs/scan/${encodeURIComponent(barcode)}`, method: "GET" });

export const getPrintJobErrors = (params?: { q?: string; page?: number; limit?: number }): Promise<Paginated<PrintJob>> =>
	request({ url: "/print-jobs/errors", method: "GET", params });

export const getPrintJobStats = (): Promise<PrintJobStats> =>
	request({ url: "/print-jobs/stats", method: "GET" });

export const generatePrintJobs = (data?: { import_batch_id?: string }): Promise<{ created: number }> =>
	request({ url: "/print-jobs/generate", method: "POST", data: data ?? {} });

export const updatePrintJobStatus = (id: string, status: string, error_note?: string): Promise<PrintJob> =>
	request({ url: `/print-jobs/${id}/status`, method: "PUT", data: { status, error_note } });
