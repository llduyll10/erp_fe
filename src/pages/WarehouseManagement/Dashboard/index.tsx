import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
	Package, 
	TrendingUp, 
	TrendingDown, 
	Warehouse, 
	AlertTriangle,
	RefreshCw,
	ArrowUp,
	ArrowDown,
	BarChart3,
	PieChart
} from "lucide-react";
import { useGetWarehouseSummary, useGetStockDashboardSummary } from "@/services/warehouse";
import { useGetStockMovements } from "@/services/warehouse";
import { StockMovementType } from "@/enums/warehouse.enum";
import Loading from "@/components/layout/loading";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

export function WarehouseDashboardPage() {
	const { data: warehouseSummary, isLoading: isWarehouseSummaryLoading, refetch: refetchWarehouse } = useGetWarehouseSummary();
	const { data: stockSummary, isLoading: isStockSummaryLoading, refetch: refetchStock } = useGetStockDashboardSummary();
	const { data: recentMovements, isLoading: isMovementsLoading, refetch: refetchMovements } = useGetStockMovements({
		limit: 10,
		page: 1
	});

	const isLoading = isWarehouseSummaryLoading || isStockSummaryLoading || isMovementsLoading;

	// Calculate today's movements
	const todayMovements = useMemo(() => {
		const today = new Date().toDateString();
		const movements = recentMovements?.data || [];
		
		const todayIn = movements
			.filter(m => {
				if (!m.created_at) return false;
				const moveDate = new Date(m.created_at).toDateString();
				return moveDate === today && m.type === StockMovementType.IN;
			})
			.reduce((sum, m) => sum + (m.quantity || 0), 0);

		const todayOut = movements
			.filter(m => {
				if (!m.created_at) return false;
				const moveDate = new Date(m.created_at).toDateString();
				return moveDate === today && m.type === StockMovementType.OUT;
			})
			.reduce((sum, m) => sum + (m.quantity || 0), 0);

		return { in: todayIn, out: todayOut };
	}, [recentMovements]);

	const handleRefreshAll = () => {
		refetchWarehouse();
		refetchStock();
		refetchMovements();
	};

	if (isLoading) {
		return <Loading />;
	}

	const warehouse = warehouseSummary;
	const stock = stockSummary;

	return (
		<div className="flex flex-col gap-6 p-8">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<BarChart3 className="h-8 w-8 text-blue-600" />
					<div>
						<h1 className="text-2xl font-bold">Dashboard Kho hàng</h1>
						<p className="text-sm text-muted-foreground">
							Tổng quan tình hình hoạt động kho hàng
						</p>
					</div>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={handleRefreshAll}
					disabled={isLoading}>
					<RefreshCw
						className={cn(
							"h-4 w-4 mr-2",
							isLoading && "animate-spin"
						)}
					/>
					Làm mới
				</Button>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{/* Total Warehouses */}
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Tổng số kho
								</p>
								<p className="text-2xl font-bold">
									{warehouse?.total_warehouses || 0}
								</p>
								<p className="text-xs text-green-600">
									{warehouse?.active_warehouses || 0} đang hoạt động
								</p>
							</div>
							<Warehouse className="h-8 w-8 text-blue-600" />
						</div>
					</CardContent>
				</Card>

				{/* Total Products */}
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Tổng sản phẩm
								</p>
								<p className="text-2xl font-bold">
									{stock?.total_products || 0}
								</p>
								<p className="text-xs text-orange-600">
									{stock?.low_stock_count || 0} sắp hết hàng
								</p>
							</div>
							<Package className="h-8 w-8 text-orange-600" />
						</div>
					</CardContent>
				</Card>

				{/* Today Stock In */}
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Nhập kho hôm nay
								</p>
								<p className="text-2xl font-bold text-green-600">
									+{todayMovements.in.toLocaleString()}
								</p>
								<p className="text-xs text-muted-foreground">
									Số lượng sản phẩm
								</p>
							</div>
							<ArrowUp className="h-8 w-8 text-green-600" />
						</div>
					</CardContent>
				</Card>

				{/* Today Stock Out */}
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Xuất kho hôm nay
								</p>
								<p className="text-2xl font-bold text-red-600">
									-{todayMovements.out.toLocaleString()}
								</p>
								<p className="text-xs text-muted-foreground">
									Số lượng sản phẩm
								</p>
							</div>
							<ArrowDown className="h-8 w-8 text-red-600" />
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Stock Summary */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<PieChart className="h-5 w-5" />
							Tổng quan tồn kho
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">Tổng giá trị tồn kho</span>
							<span className="text-lg font-bold">
								{stock?.total_value?.toLocaleString() || 0} ₫
							</span>
						</div>
						
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-sm">Sản phẩm còn hàng</span>
								<Badge variant="secondary">
									{stock?.in_stock_count || 0}
								</Badge>
							</div>
							
							<div className="flex items-center justify-between">
								<span className="text-sm">Sản phẩm hết hàng</span>
								<Badge variant="destructive">
									{stock?.out_of_stock_count || 0}
								</Badge>
							</div>
							
							<div className="flex items-center justify-between">
								<span className="text-sm">Sản phẩm sắp hết</span>
								<Badge variant="outline" className="border-orange-200 text-orange-600">
									{stock?.low_stock_count || 0}
								</Badge>
							</div>
						</div>

						{/* Stock Level Progress */}
						<div className="space-y-2">
							<div className="flex justify-between text-xs">
								<span>Mức tồn kho</span>
								<span>
									{Math.round(((stock?.in_stock_count || 0) / (stock?.total_products || 1)) * 100)}%
								</span>
							</div>
							<Progress 
								value={((stock?.in_stock_count || 0) / (stock?.total_products || 1)) * 100} 
								className="h-2"
							/>
						</div>
					</CardContent>
				</Card>

				{/* Recent Movements */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendingUp className="h-5 w-5" />
							Hoạt động gần đây
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{recentMovements?.data?.slice(0, 5).map((movement) => (
								<div key={movement.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
									<div className="flex items-center gap-3">
										{movement.type === StockMovementType.IN ? (
											<ArrowUp className="h-4 w-4 text-green-600" />
										) : (
											<ArrowDown className="h-4 w-4 text-red-600" />
										)}
										<div>
											<p className="text-sm font-medium">
												{movement.variant?.product?.name}
											</p>
											<p className="text-xs text-muted-foreground">
												{movement.variant?.sku} • {movement.variant?.size} • {movement.variant?.color}
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className={`text-sm font-medium ${
											movement.type === StockMovementType.IN ? 'text-green-600' : 'text-red-600'
										}`}>
											{movement.type === StockMovementType.IN ? '+' : '-'}{movement.quantity}
										</p>
										<p className="text-xs text-muted-foreground">
											{movement.created_at ? new Date(movement.created_at).toLocaleDateString('vi-VN') : ''}
										</p>
									</div>
								</div>
							))}
							{(!recentMovements?.data || recentMovements.data.length === 0) && (
								<div className="text-center py-8 text-muted-foreground">
									<Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
									<p className="text-sm">Chưa có hoạt động nào</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Low Stock Alert */}
			{stock && (stock.low_stock_count || 0) > 0 && (
				<Card className="border-orange-200 bg-orange-50">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-orange-800">
							<AlertTriangle className="h-5 w-5" />
							Cảnh báo tồn kho thấp
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-orange-700">
							Có <strong>{stock.low_stock_count || 0}</strong> sản phẩm đang ở mức tồn kho thấp. 
							Vui lòng kiểm tra và nhập thêm hàng hóa khi cần thiết.
						</p>
						<Button variant="outline" size="sm" className="mt-3 border-orange-300 text-orange-700 hover:bg-orange-100">
							Xem chi tiết
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
}