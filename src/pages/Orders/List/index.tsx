import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, RefreshCw, Upload, Printer } from "lucide-react";
import { useGetSalesOrders } from "@/services/sales-orders";
import type { SalesOrderStatus } from "@/models/sales-order.model";

const STATUS_CONFIG: Record<SalesOrderStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
	pending:   { label: "Chờ xử lý",   variant: "secondary" },
	printing:  { label: "Đang in",      variant: "default" },
	printed:   { label: "Đã in",        variant: "outline" },
	packing:   { label: "Đóng gói",     variant: "default" },
	shipped:   { label: "Đã gửi",       variant: "default" },
	cancelled: { label: "Đã hủy",       variant: "destructive" },
};

export function SalesOrdersListPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const initBatch = searchParams.get("batch") ?? "";

	const [q, setQ] = useState("");
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("");
	const [hasPrint, setHasPrint] = useState("");
	const [page, setPage] = useState(1);

	const { data, isLoading, refetch } = useGetSalesOrders({
		q: search || undefined,
		status: status || undefined,
		has_print: hasPrint || undefined,
		import_batch_id: initBatch || undefined,
		page,
		limit: 30,
	});

	const orders = data?.data ?? [];
	const total = data?.pagination?.total_records ?? 0;

	return (
		<div className="flex flex-col gap-4 p-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Đơn hàng TikTok</h1>
					{initBatch && (
						<p className="text-sm text-muted-foreground">Lọc theo lô import</p>
					)}
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="sm" onClick={() => refetch()}>
						<RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
					</Button>
					<Button size="sm" onClick={() => navigate("/dashboard/orders/import")}>
						<Upload size={14} className="mr-1" /> Import CSV
					</Button>
				</div>
			</div>

			<div className="flex gap-2 flex-wrap">
				<div className="relative flex-1 min-w-[200px] max-w-sm">
					<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
					<Input className="pl-8" placeholder="Mã đơn, tên SP, tên in..."
						value={q} onChange={(e) => setQ(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && (setSearch(q), setPage(1))} />
				</div>
				<Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
					<SelectTrigger className="w-36"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
					<SelectContent>
						<SelectItem value="">Tất cả</SelectItem>
						{Object.entries(STATUS_CONFIG).map(([k, v]) => (
							<SelectItem key={k} value={k}>{v.label}</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select value={hasPrint} onValueChange={(v) => { setHasPrint(v); setPage(1); }}>
					<SelectTrigger className="w-36"><SelectValue placeholder="Loại đơn" /></SelectTrigger>
					<SelectContent>
						<SelectItem value="">Tất cả</SelectItem>
						<SelectItem value="true">Có in tên số</SelectItem>
						<SelectItem value="false">Không in</SelectItem>
					</SelectContent>
				</Select>
				<Button size="sm" onClick={() => { setSearch(q); setPage(1); }}>Tìm</Button>
			</div>

			<div className="text-sm text-muted-foreground">Tổng: {total} đơn</div>

			<div className="border rounded-lg">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Mã đơn</TableHead>
							<TableHead>Sản phẩm</TableHead>
							<TableHead className="text-center">Size</TableHead>
							<TableHead className="text-center">SL</TableHead>
							<TableHead>In tên số</TableHead>
							<TableHead>Trạng thái</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Đang tải...</TableCell></TableRow>
						) : orders.length === 0 ? (
							<TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Không có đơn nào</TableCell></TableRow>
						) : orders.map((o) => {
							const cfg = STATUS_CONFIG[o.status];
							return (
								<TableRow key={o.id}
									className="cursor-pointer hover:bg-muted/40"
									onClick={() => navigate(`/dashboard/orders/${o.id}`)}>
									<TableCell className="font-mono text-sm font-semibold">{o.external_order_id}</TableCell>
									<TableCell>
										<div className="text-sm">{o.product_name}</div>
										{o.color && <div className="text-xs text-muted-foreground">{o.color}</div>}
									</TableCell>
									<TableCell className="text-center">{o.size || "—"}</TableCell>
									<TableCell className="text-center">{o.quantity}</TableCell>
									<TableCell>
										{o.has_print ? (
											<div className="flex items-center gap-1">
												<Printer size={12} className="text-sky-600" />
												<span className="text-xs text-sky-700">
													{o.print_name} {o.print_number && `#${o.print_number}`}
												</span>
											</div>
										) : (
											<span className="text-xs text-muted-foreground">Không</span>
										)}
									</TableCell>
									<TableCell><Badge variant={cfg.variant}>{cfg.label}</Badge></TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>

			{total > 30 && (
				<div className="flex gap-2 justify-end text-sm">
					<Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Trước</Button>
					<span className="px-3 py-1 rounded border">{page}</span>
					<Button variant="outline" size="sm" disabled={orders.length < 30} onClick={() => setPage((p) => p + 1)}>Sau</Button>
				</div>
			)}
		</div>
	);
}
