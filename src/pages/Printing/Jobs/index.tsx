import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Printer, RefreshCw, Search, ScanLine, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import {
	useGetPrintJobs, useGetPrintJobStats, useGeneratePrintJobs,
} from "@/services/printing";
import type { PrintJobStatus } from "@/models/print-job.model";

const STATUS_CONFIG: Record<PrintJobStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
	pending:       { label: "Chờ in",    variant: "secondary",    icon: <Clock size={12} /> },
	printed:       { label: "Đã in",     variant: "default",      icon: <CheckCircle2 size={12} /> },
	error:         { label: "Lỗi in",    variant: "destructive",  icon: <AlertTriangle size={12} /> },
	missing_shirt: { label: "Thiếu áo",  variant: "outline",      icon: <AlertTriangle size={12} /> },
};

export function PrintJobsPage() {
	const navigate = useNavigate();
	const [q, setQ] = useState("");
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("");
	const [page, setPage] = useState(1);

	const { data, isLoading, refetch } = useGetPrintJobs({
		q: search || undefined, status: status || undefined, page, limit: 30,
	});
	const { data: stats } = useGetPrintJobStats();
	const { mutate: generate, isPending: generating } = useGeneratePrintJobs();

	const jobs = data?.data ?? [];

	return (
		<div className="flex flex-col gap-4 p-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Print Jobs — In tên số</h1>
					<p className="text-sm text-muted-foreground">Quản lý và theo dõi in tên số</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="sm" onClick={() => refetch()}>
						<RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
					</Button>
					<Button variant="outline" size="sm" onClick={() => navigate("/dashboard/printing/scan")}>
						<ScanLine size={14} className="mr-1" /> Màn hình scan
					</Button>
					<Button size="sm" disabled={generating} onClick={() => generate({})}>
						<Printer size={14} className="mr-1" />
						{generating ? "Đang tạo..." : "Tạo print jobs"}
					</Button>
				</div>
			</div>

			{/* Stats */}
			{stats && (
				<div className="grid grid-cols-4 gap-3">
					{[
						{ key: "pending",  label: "Chờ in",   value: stats.pending,  color: "text-gray-700" },
						{ key: "printed",  label: "Đã in",    value: stats.printed,  color: "text-green-600" },
						{ key: "error",    label: "Lỗi in",   value: stats.error,    color: "text-red-600" },
						{ key: "missing",  label: "Thiếu áo", value: stats.missing,  color: "text-orange-500" },
					].map((s) => (
						<Card key={s.key} className="cursor-pointer hover:shadow-sm"
							onClick={() => { setStatus(s.key === "missing" ? "missing_shirt" : s.key); setPage(1); }}>
							<CardContent className="p-4">
								<p className="text-xs text-muted-foreground">{s.label}</p>
								<p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			<div className="flex gap-2">
				<div className="relative flex-1 max-w-sm">
					<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
					<Input className="pl-8" placeholder="Barcode, tên mẫu, tên in..." value={q}
						onChange={(e) => setQ(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && (setSearch(q), setPage(1))} />
				</div>
				<Select value={status || "all"} onValueChange={(v) => { setStatus(v === "all" ? "" : v); setPage(1); }}>
					<SelectTrigger className="w-36"><SelectValue placeholder="Tất cả" /></SelectTrigger>
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
							<TableHead>Barcode</TableHead>
							<TableHead>Mẫu</TableHead>
							<TableHead className="text-center">Size</TableHead>
							<TableHead>Tên in</TableHead>
							<TableHead className="text-center">Số</TableHead>
							<TableHead>FC</TableHead>
							<TableHead>Trạng thái</TableHead>
							<TableHead>Người in</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Đang tải...</TableCell></TableRow>
						) : jobs.length === 0 ? (
							<TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Không có print job nào</TableCell></TableRow>
						) : jobs.map((job) => {
							const cfg = STATUS_CONFIG[job.status];
							return (
								<TableRow key={job.id}>
									<TableCell className="font-mono text-xs">{job.barcode}</TableCell>
									<TableCell className="font-medium">{job.product_model}</TableCell>
									<TableCell className="text-center">{job.size ?? "—"}</TableCell>
									<TableCell className="font-semibold text-sky-700">{job.print_name ?? "—"}</TableCell>
									<TableCell className="text-center font-bold">{job.print_number ?? "—"}</TableCell>
									<TableCell className="text-xs text-muted-foreground">{job.fc ?? "—"}</TableCell>
									<TableCell>
										<Badge variant={cfg.variant} className="gap-1">
											{cfg.icon} {cfg.label}
										</Badge>
										{job.error_note && (
											<p className="text-xs text-red-500 mt-1">{job.error_note}</p>
										)}
									</TableCell>
									<TableCell className="text-xs text-muted-foreground">
										{job.printed_by_user?.name ?? (job.printed_at ? "—" : "")}
										{job.printed_at && (
											<div>{new Date(job.printed_at).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}</div>
										)}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
