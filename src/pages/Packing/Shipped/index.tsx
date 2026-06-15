import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Truck, RefreshCw, Search } from "lucide-react";
import { useGetShippedOrders } from "@/services/packing";

export function PackingShippedPage() {
	const [q, setQ] = useState("");
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);

	const { data, isLoading, refetch } = useGetShippedOrders({ q: search || undefined, page });
	const jobs = data?.data ?? [];
	const total = data?.pagination?.total_records ?? 0;

	return (
		<div className="flex flex-col gap-4 p-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<Truck className="text-green-600" size={24} /> Đã gửi bưu cục
					</h1>
					<p className="text-sm text-muted-foreground">Tổng: {total} đơn</p>
				</div>
				<Button variant="outline" size="sm" onClick={() => refetch()}>
					<RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
				</Button>
			</div>

			<div className="flex gap-2 max-w-sm">
				<div className="relative flex-1">
					<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
					<Input className="pl-8" placeholder="Mã đơn, tên sản phẩm..." value={q}
						onChange={(e) => setQ(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && (setSearch(q), setPage(1))} />
				</div>
				<Button size="sm" onClick={() => { setSearch(q); setPage(1); }}>Tìm</Button>
			</div>

			<div className="border rounded-lg">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Mã đơn</TableHead>
							<TableHead>Sản phẩm</TableHead>
							<TableHead className="text-center">SL</TableHead>
							<TableHead>Gửi lúc</TableHead>
							<TableHead>Người gửi</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Đang tải...</TableCell></TableRow>
						) : jobs.length === 0 ? (
							<TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Chưa có đơn nào</TableCell></TableRow>
						) : jobs.map((job) => (
							<TableRow key={job.id}>
								<TableCell className="font-mono font-semibold">
									{job.sales_order?.external_order_id}
								</TableCell>
								<TableCell>
									<div>{job.sales_order?.product_name}</div>
									{job.sales_order?.size && (
										<div className="text-xs text-muted-foreground">{job.sales_order.size}</div>
									)}
								</TableCell>
								<TableCell className="text-center">{job.sales_order?.quantity ?? 1}</TableCell>
								<TableCell className="text-sm text-muted-foreground">
									{job.shipped_at
										? new Date(job.shipped_at).toLocaleString("vi-VN", {
												hour: "2-digit", minute: "2-digit",
												day: "2-digit", month: "2-digit", year: "numeric",
											})
										: "—"}
								</TableCell>
								<TableCell className="text-sm">{job.shipped_by_user?.name ?? "—"}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{total > 30 && (
				<div className="flex gap-2 justify-end text-sm">
					<Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Trước</Button>
					<span className="px-3 py-1 rounded border">{page}</span>
					<Button variant="outline" size="sm" disabled={jobs.length < 30} onClick={() => setPage((p) => p + 1)}>Sau</Button>
				</div>
			)}
		</div>
	);
}
