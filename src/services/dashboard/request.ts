import { request } from "@/utils/request.util";

export interface DashboardStats {
	low_stock: { count: number; threshold: number };
	production: { in_progress: number; done_unstocked: number };
	printing: { pending: number; errors: number };
	packing: { waiting: number };
	shipped_today: number;
}

export const getDashboardStats = (): Promise<DashboardStats> =>
	request({ url: "/dashboard/stats", method: "GET" });
