import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	AlertTriangle,
	Factory,
	Printer,
	XCircle,
	Package,
	Truck,
	RefreshCw,
} from "lucide-react";
import { useGetDashboardStats } from "@/services/dashboard";
import { cn } from "@/lib/utils";

interface StatCardProps {
	title: string;
	value: number | undefined;
	subtitle?: string;
	icon: React.ReactNode;
	href: string;
	variant?: "default" | "warning" | "danger" | "success";
	isLoading: boolean;
}

function StatCard({ title, value, subtitle, icon, href, variant = "default", isLoading }: StatCardProps) {
	const navigate = useNavigate();

	const colorMap = {
		default: "text-blue-600 bg-blue-50",
		warning: "text-amber-600 bg-amber-50",
		danger: "text-red-600 bg-red-50",
		success: "text-green-600 bg-green-50",
	};

	return (
		<Card
			className="cursor-pointer hover:shadow-md transition-shadow"
			onClick={() => navigate(href)}
		>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
				<div className={cn("p-2 rounded-lg", colorMap[variant])}>
					{icon}
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="h-8 w-16 bg-muted animate-pulse rounded" />
				) : (
					<p className="text-3xl font-bold">{value ?? 0}</p>
				)}
				{subtitle && (
					<p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
				)}
			</CardContent>
		</Card>
	);
}

export function DashboardPage() {
	const navigate = useNavigate();
	const { data: stats, isLoading, refetch, isFetching } = useGetDashboardStats();

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Dashboard</h1>
					<p className="text-sm text-muted-foreground">Tổng quan vận hành</p>
				</div>
				<Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
					<RefreshCw className={cn("h-4 w-4 mr-2", isFetching && "animate-spin")} />
					Làm mới
				</Button>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
				<StatCard
					title="Tồn thấp"
					value={stats?.low_stock.count}
					subtitle={`Ngưỡng ≤ ${stats?.low_stock.threshold ?? 10}`}
					icon={<AlertTriangle className="h-4 w-4" />}
					href="/dashboard/inventory/overview"
					variant={stats?.low_stock.count ? "warning" : "default"}
					isLoading={isLoading}
				/>
				<StatCard
					title="Đang sản xuất"
					value={stats?.production.in_progress}
					icon={<Factory className="h-4 w-4" />}
					href="/dashboard/production/orders?status=in_progress"
					isLoading={isLoading}
				/>
				<StatCard
					title="Chờ nhập kho"
					value={stats?.production.done_unstocked}
					subtitle="Lệnh SX đã may xong"
					icon={<Factory className="h-4 w-4" />}
					href="/dashboard/production/orders?status=done"
					variant={stats?.production.done_unstocked ? "warning" : "default"}
					isLoading={isLoading}
				/>
				<StatCard
					title="Chờ in tên số"
					value={stats?.printing.pending}
					icon={<Printer className="h-4 w-4" />}
					href="/dashboard/printing/jobs"
					variant={stats?.printing.pending ? "warning" : "default"}
					isLoading={isLoading}
				/>
				<StatCard
					title="Lỗi in"
					value={stats?.printing.errors}
					icon={<XCircle className="h-4 w-4" />}
					href="/dashboard/printing/errors"
					variant={stats?.printing.errors ? "danger" : "default"}
					isLoading={isLoading}
				/>
				<StatCard
					title="Chờ đóng gói"
					value={stats?.packing.waiting}
					icon={<Package className="h-4 w-4" />}
					href="/dashboard/packing/queue"
					variant={stats?.packing.waiting ? "warning" : "default"}
					isLoading={isLoading}
				/>
			</div>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base flex items-center gap-2">
						<Truck className="h-4 w-4 text-green-600" />
						Đã gửi bưu cục hôm nay
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="h-12 w-24 bg-muted animate-pulse rounded" />
					) : (
						<p className="text-5xl font-bold text-green-600">{stats?.shipped_today ?? 0}</p>
					)}
					<Button
						variant="link"
						className="p-0 h-auto text-xs text-muted-foreground mt-2"
						onClick={() => navigate("/dashboard/packing/shipped")}
					>
						Xem danh sách đã gửi →
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
