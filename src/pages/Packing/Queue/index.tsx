import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Package, RefreshCw, Search, Truck, ScanLine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
	useGetPackingQueue, useGetPackingStats, useShipOrders,
} from "@/services/packing";

export function PackingQueuePage() {
	const navigate = useNavigate();
	const [q, setQ] = useState("");
	const [search, setSearch] = useState("");
	const [selected, setSelected] = useState<Set<string>>(new Set());

	const { data, isLoading, refetch } = useGetPackingQueue({ q: search || undefined });
	const { data: stats } = useGetPackingStats();
	const { mutate: ship, isPending: shipping } = useShipOrders();

	const jobs = data?.data ?? [];

	const toggleSelect = (id: string) =>
		setSelected((prev) => {
			const next = new Set(prev);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});

	const toggleAll = () =>
		setSelected(selected.size === jobs.length ? new Set() : new Set(jobs.map((j) => j.id)));

	const handleShip = () => {
		if (selected.size === 0) return;
		ship(
			{ ids: Array.from(selected) },
			{ onSuccess: () => setSelected(new Set()) },
		);
	};

	return (
		<div className="flex flex-col gap-4 p-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Đã đóng gói — chờ gửi bưu cục</h1>
					<p className="text-sm text-muted-foreground">Chọn đơn và bấm "Gửi bưu cục" để hoàn tất</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="sm" onClick={() => refetch()}>
						<RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
					</Button>
					<Button variant="outline" size="sm" onClick={() => navigate("/dashboard/packing/scan")}>
						<ScanLine size={14} className="mr-1" /> Scan đóng gói
					</Button>
					{selected.size > 0 && (
						<Button size="sm" disabled={shipping} onClick={handleShip}
							className="bg-green-600 hover:bg-green-700 text-white">
							<Truck size={14} className="mr-1" />
							Gửi bưu cục ({selected.size} đơn)
						</Button>
					)}
				</div>
			</div>

			{/* Stats */}
			{stats && (
				<div className="grid grid-cols-3 gap-3">
					<Card><CardContent className="p-4">
						<p className="text-xs text-muted-foreground">Chưa đóng gói</p>
						<p className="text-2xl font-bold text-orange-600">{stats.waiting}</p>
					</CardContent></Card>
					<Card><CardContent className="p-4">
						<p className="text-xs text-muted-foreground">Đã đóng gói, chờ gửi</p>
						<p className="text-2xl font-bold text-blue-600">{stats.packed}</p>
					</CardContent></Card>
					<Card><CardContent className="p-4">
						<p className="text-xs text-muted-foreground">Đã gửi hôm nay</p>
						<p className="text-2xl font-bold text-green-600">{stats.shipped_today}</p>
					</CardContent></Card>
				</div>
			)}

			<div className="flex gap-2 max-w-sm">
				<div className="relative flex-1">
					<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
					<Input className="pl-8" placeholder="Mã đơn, tên sản phẩm..." value={q}
						onChange={(e) => setQ(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && setSearch(q)} />
				</div>
				<Button size="sm" onClick={() => setSearch(q)}>Tìm</Button>
			</div>

			<div className="border rounded-lg">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-10">
								<input type="checkbox"
									checked={selected.size === jobs.length && jobs.length > 0}
									onChange={toggleAll}
									className="cursor-pointer" />
							</TableHead>
							<TableHead>Mã đơn</TableHead>
							<TableHead>Sản phẩm</TableHead>
							<TableHead className="text-center">SL</TableHead>
							<TableHead>In tên số</TableHead>
							<TableHead>Đóng gói lúc</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Đang tải...</TableCell></TableRow>
						) : jobs.length === 0 ? (
							<TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Chưa có đơn nào đóng gói</TableCell></TableRow>
						) : jobs.map((job) => (
							<TableRow key={job.id} className={selected.has(job.id) ? "bg-sky-50" : ""}>
								<TableCell>
									<input type="checkbox"
										checked={selected.has(job.id)}
										onChange={() => toggleSelect(job.id)}
										className="cursor-pointer" />
								</TableCell>
								<TableCell className="font-mono font-semibold">
									{job.sales_order?.external_order_id}
								</TableCell>
								<TableCell>
									<div>{job.sales_order?.product_name}</div>
									{job.sales_order?.color && (
										<div className="text-xs text-muted-foreground">{job.sales_order.color}</div>
									)}
								</TableCell>
								<TableCell className="text-center">{job.sales_order?.quantity ?? 1}</TableCell>
								<TableCell>
									{job.sales_order?.has_print ? (
										<div className="text-xs text-sky-700">
											{job.sales_order.print_name} #{job.sales_order.print_number}
										</div>
									) : (
										<span className="text-xs text-muted-foreground">Không in</span>
									)}
								</TableCell>
								<TableCell className="text-xs text-muted-foreground">
									{job.packed_at ? new Date(job.packed_at).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }) : "—"}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
