import { request } from "@/utils/request.util";
import type { PackingJob, PackingStats } from "@/models/packing-job.model";

type Paginated<T> = { data: T[]; pagination: { current_page: number; records_per_page: number; total_pages: number; total_records: number } };

export const getPackingQueue = (params?: { q?: string; page?: number; limit?: number }): Promise<Paginated<PackingJob>> =>
	request({ url: "/packing/queue", method: "GET", params });

export const getPackingStats = (): Promise<PackingStats> =>
	request({ url: "/packing/stats", method: "GET" });

export const scanAndPack = (external_order_id: string): Promise<{
  status: "packed" | "duplicate";
  external_order_id: string;
  packed_at: string;
  packed_by_name: string | null;
  packing_job_id: string;
}> =>
	request({ url: "/packing/scan", method: "POST", data: { external_order_id } });

export const shipOrders = (packing_job_ids: string[], notes?: string) =>
	request({ url: "/packing/ship", method: "POST", data: { packing_job_ids, notes } });

export const getShippedOrders = (params?: { q?: string; page?: number; limit?: number }): Promise<Paginated<PackingJob>> =>
	request({ url: "/packing/shipped", method: "GET", params });
