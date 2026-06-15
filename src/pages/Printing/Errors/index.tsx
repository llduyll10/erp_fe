import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { AlertTriangle, RefreshCw, Search } from "lucide-react";
import { useGetPrintJobErrors, useUpdatePrintJobStatus } from "@/services/printing";

export function PrintingErrorsPage() {
	const [q, setQ] = useState("");
	const [search, setSearch] = useState("");
	const { data, isLoading, refetch } = useGetPrintJobErrors({ q: search || undefined });
	const { mutate: updateStatus } = useUpdatePrintJobStatus();
	const jobs = data?.data ?? [];

	return (
		<div className="flex flex-col gap-4 p-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<AlertTriangle className="text-red-500" size={24} /> Lỗi in tên số
					</h1>
					<p className="text-sm text-muted-foreground">{jobs.length} job cần xử lý</p>
				</div>
				<Button variant="outline" size="sm" onClick={() => refetch()}>
					<RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
				</Button>
			</div>

			<div className="flex gap-2 max-w-sm">
				<div className="relative flex-1">
					<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
					<Input className="pl-8" placeholder="Barcode, tên mẫu..." value={q}
						onChange={(e) => setQ(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && setSearch(q)} />
				</div>
				<Button size="sm" onClick={() => setSearch(q)}>Tìm</Button>
			</div>

			<div className="border rounded-lg">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Barcode</TableHead>
							<TableHead>Mẫu / Size</TableHead>
							<TableHead>Tên in / Số</TableHead>
							<TableHead>Ghi chú lỗi</TableHead>
							<TableHead>Trạng thái</TableHead>
							<TableHead>Thao tác</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Đang tải...</TableCell></TableRow>
						) : jobs.length === 0 ? (
							<TableRow><TableCell colSpan={6} className="text-center py-8 text-green-600">Không có lỗi in nào! 🎉</TableCell></TableRow>
						) : jobs.map((job) => (
							<TableRow key={job.id}>
								<TableCell className="font-mono text-xs">{job.barcode}</TableCell>
								<TableCell>
									<div className="font-medium">{job.product_model}</div>
									{job.size && <div className="text-xs text-muted-foreground">{job.size}</div>}
								</TableCell>
								<TableCell>
									<div className="font-semibold text-sky-700">{job.print_name ?? "—"}</div>
									{job.print_number && <div className="text-xs">#{job.print_number}</div>}
								</TableCell>
								<TableCell className="text-sm text-red-600">{job.error_note ?? "—"}</TableCell>
								<TableCell>
									<Badge variant={job.status === "error" ? "destructive" : "outline"}>
										{job.status === "missing_shirt" ? "Thiếu áo" : "Lỗi in"}
									</Badge>
								</TableCell>
								<TableCell>
									<Button variant="outline" size="sm"
										onClick={() => updateStatus({ id: job.id, status: "pending" })}>
										Đặt lại → Chờ in
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
