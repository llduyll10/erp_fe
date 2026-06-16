import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query.constant";
import { getDashboardStats } from "./request";

export const useGetDashboardStats = () =>
	useQuery({
		queryKey: [QUERY_KEYS.DASHBOARD.STATS],
		queryFn: getDashboardStats,
		staleTime: 30 * 1000,
		refetchInterval: 60 * 1000,
	});
