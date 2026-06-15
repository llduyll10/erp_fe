import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowDown } from "lucide-react";
import {
	useGetProductionOrder,
	useUpdateProductionStatus,
	useStockInFromProduction,
} from "@/services/production";
import type { ProductionOrderStatus } from "@/models/production-order.model";

const STATUS_CONFIG: Record<ProductionOrderStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
	draft:       { label: "Mới tạo",     variant: "secondary" },
	in_progress: { label: "Đang may",    variant: "default" },
	done:        { label: "Đã may xong", variant: "outline" },
	stocked:     { label: "Đã nhập kho", variant: "default" },
	cancelled:   { label: "Đã hủy",      variant: "destructive" },
};

export function ProductionOrderDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { data: order, isLoading } = useGetProductionOrder(id!);
	const { mutate: updateStatus } = useUpdateProductionStatus();
	const { mutate: stockIn, isPending: stocking } = useStockInFromProduction();

	// qty to stock-in per item
	const [stockQtys, setStockQtys] = useState<Record<string, number>>({});

	if (isLoading || !order)
		return <div className="p-8 text-muted-foreground">Đang tải...</div>;

	const cfg = STATUS_CONFIG[order.status];

	const handleStockIn = () => {
		const items = Object.entries(stockQtys)
			.filter(([, qty]) => qty > 0)
			.map(([item_id, quantity]) => ({ item_id, quantity }));
		if (items.length === 0) return;
		stockIn(
			{ production_order_id: order.id, items },
			{ onSuccess: () => setStockQtys({}) },
		);
	};

	return (
		<div className="p-8 max-w-3xl space-y-6">
			<div className="flex items-center gap-3">
				<Button variant="outline" size="sm" onClick={() => navigate(-1)}>
					<ArrowLeft size={14} className="mr-1" /> Quay lại
				</Button>
				<div>
					<h1 className="text-2xl font-bold font-mono">{order.order_number}</h1>
					<div className="text-sm text-muted-foreground">
						Tạo bởi {order.created_by_user?.name} · {new Date(order.created_at).toLocaleDateString("vi-VN")}
					</div>
				</div>
			</div>

			<Card>
				<CardHeader className="flex-row items-center justify-between pb-2">
					<CardTitle className="text-base">Trạng thái</CardTitle>
					<Badge variant={cfg.variant}>{cfg.label}</Badge>
				</CardHeader>
				<CardContent>
					{order.status !== "stocked" && order.status !== "cancelled" && (
						<div className="flex gap-2 flex-wrap">
							{(["draft", "in_progress", "done", "cancelled"] as ProductionOrderStatus[])
								.filter((s) => s !== order.status)
								.map((s) => (
									<Button key={s} variant="outline" size="sm"
										onClick={() => updateStatus({ id: order.id, status: s })}>
										→ {STATUS_CONFIG[s].label}
									</Button>
								))}
						</div>
					)}
					{order.notes && (
						<p className="text-sm text-muted-foreground mt-2">{order.notes}</p>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-base">Chi tiết size / số lượng</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Size</TableHead>
								<TableHead>Màu</TableHead>
								<TableHead className="text-center">Kế hoạch</TableHead>
								<TableHead className="text-center">Đã nhập kho</TableHead>
								<TableHead className="text-center">Còn lại</TableHead>
								{(order.status === "done" || order.status === "in_progress") && (
									<TableHead className="text-center">Nhập kho</TableHead>
								)}
							</TableRow>
						</TableHeader>
						<TableBody>
							{order.items?.map((item) => {
								const remaining = item.qty_planned - item.qty_stocked;
								return (
									<TableRow key={item.id}>
										<TableCell className="font-semibold">{item.size}</TableCell>
										<TableCell>{item.color || "—"}</TableCell>
										<TableCell className="text-center">{item.qty_planned}</TableCell>
										<TableCell className="text-center text-green-600">{item.qty_stocked}</TableCell>
										<TableCell className="text-center">
											{remaining > 0 ? (
												<span className="text-orange-600 font-medium">{remaining}</span>
											) : (
												<span className="text-green-600">✓</span>
											)}
										</TableCell>
										{(order.status === "done" || order.status === "in_progress") && (
											<TableCell className="text-center">
												{remaining > 0 ? (
													<Input
														type="number"
														min={0}
														max={remaining}
														className="h-7 w-20 text-sm text-center mx-auto"
														value={stockQtys[item.id] ?? 0}
														onChange={(e) =>
															setStockQtys((prev) => ({
																...prev,
																[item.id]: Math.min(parseInt(e.target.value) || 0, remaining),
															}))
														}
													/>
												) : "—"}
											</TableCell>
										)}
									</TableRow>
								);
							})}
						</TableBody>
					</Table>

					{(order.status === "done" || order.status === "in_progress") && (
						<div className="mt-4">
							<Button onClick={handleStockIn} disabled={stocking}
								className="gap-2">
								<ArrowDown size={14} />
								{stocking ? "Đang nhập..." : "Nhập kho từ lệnh SX"}
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
