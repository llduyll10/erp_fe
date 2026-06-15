import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, RefreshCw, Search } from "lucide-react";
import { useGetProductionOrders } from "@/services/production";
import type { ProductionOrderStatus } from "@/models/production-order.model";

const STATUS_CONFIG: Record<ProductionOrderStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
	draft:       { label: "Mới tạo",     variant: "secondary" },
	in_progress: { label: "Đang may",    variant: "default" },
	done:        { label: "Đã may xong", variant: "outline" },
	stocked:     { label: "Đã nhập kho", variant: "default" },
	cancelled:   { label: "Đã hủy",      variant: "destructive" },
};

export function ProductionOrdersPage() {
	const navigate = useNavigate();
	const [q, setQ] = useState("");
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState<string>("");
	const [page, setPage] = useState(1);

	const { data, isLoading, refetch } = useGetProductionOrders({
		q: search || undefined,
		status: status || undefined,
		page,
		limit: 20,
	});

	const orders = data?.data ?? [];
	const total = data?.pagination?.total_records ?? 0;

	return (
		<div className="flex flex-col gap-6 p-8">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Lệnh sản xuất</h1>
				<div className="flex gap-2">
					<Button variant="outline" size="sm" onClick={() => refetch()}>
						<RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
					</Button>
					<Button size="sm" onClick={() => navigate("/dashboard/production/orders/create")}>
						<Plus size={14} className="mr-1" /> Tạo lệnh SX
					</Button>
				</div>
			</div>

			<div className="flex gap-2">
				<div className="relative flex-1 max-w-sm">
					<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
					<Input className="pl-8" placeholder="Tìm mã lệnh, tên mẫu..." value={q}
						onChange={(e) => setQ(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && (setSearch(q), setPage(1))} />
				</div>
				<Select value={status || "all"} onValueChange={(v) => { setStatus(v === "all" ? "" : v); setPage(1); }}>
					<SelectTrigger className="w-40"><SelectValue placeholder="Tất cả trạng thái" /></SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tất cả</SelectItem>
						{Object.entries(STATUS_CONFIG).map(([k, v]) => (
							<SelectItem key={k} value={k}>{v.label}</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button size="sm" onClick={() => { setSearch(q); setPage(1); }}>Tìm</Button>
			</div>

			<div className="border rounded-lg">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Mã lệnh</TableHead>
							<TableHead>Sản phẩm</TableHead>
							<TableHead>Trạng thái</TableHead>
							<TableHead>Tổng SL kế hoạch</TableHead>
							<TableHead>Đã nhập kho</TableHead>
							<TableHead>Ngày tạo</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Đang tải...</TableCell></TableRow>
						) : orders.length === 0 ? (
							<TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Chưa có lệnh sản xuất nào</TableCell></TableRow>
						) : orders.map((o) => {
							const cfg = STATUS_CONFIG[o.status];
							const totalPlanned = o.items?.reduce((s, i) => s + i.qty_planned, 0) ?? 0;
							const totalStocked = o.items?.reduce((s, i) => s + i.qty_stocked, 0) ?? 0;
							return (
								<TableRow key={o.id} className="cursor-pointer hover:bg-muted/40"
									onClick={() => navigate(`/dashboard/production/orders/${o.id}`)}>
									<TableCell className="font-mono font-semibold">{o.order_number}</TableCell>
									<TableCell>{o.product?.name ?? <span className="text-muted-foreground">—</span>}</TableCell>
									<TableCell><Badge variant={cfg.variant}>{cfg.label}</Badge></TableCell>
									<TableCell>{totalPlanned}</TableCell>
									<TableCell>
										<span className={totalStocked >= totalPlanned && totalPlanned > 0 ? "text-green-600 font-semibold" : ""}>
											{totalStocked}
										</span>
									</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										{new Date(o.created_at).toLocaleDateString("vi-VN")}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
			{total > 20 && (
				<div className="flex gap-2 justify-end text-sm">
					<Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Trước</Button>
					<span className="px-3 py-1 rounded border">{page}</span>
					<Button variant="outline" size="sm" disabled={orders.length < 20} onClick={() => setPage((p) => p + 1)}>Sau</Button>
				</div>
			)}
		</div>
	);
}
