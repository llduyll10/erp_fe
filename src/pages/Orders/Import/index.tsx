import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Upload, FileText, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { useImportCsv, useGetImportBatches, useGetBatchErrors } from "@/services/sales-orders";
import type { ImportBatch } from "@/models/sales-order.model";

const BATCH_STATUS_CONFIG = {
	pending:    { label: "Chờ", variant: "secondary" as const },
	processing: { label: "Đang xử lý", variant: "default" as const },
	done:       { label: "Hoàn thành", variant: "default" as const },
	failed:     { label: "Thất bại", variant: "destructive" as const },
};

function BatchErrorsPanel({ batchId }: { batchId: string }) {
	const { data: errors = [], isLoading } = useGetBatchErrors(batchId);
	if (isLoading) return <div className="text-sm text-muted-foreground">Đang tải lỗi...</div>;
	if (errors.length === 0) return <div className="text-sm text-green-600">Không có lỗi</div>;
	return (
		<div className="space-y-1 max-h-40 overflow-y-auto">
			{errors.map((e) => (
				<div key={e.id} className="text-xs flex gap-2">
					<span className="text-muted-foreground w-14 shrink-0">Dòng {e.row_number}</span>
					<span className="text-red-600">{e.error_message}</span>
				</div>
			))}
		</div>
	);
}

export function ImportOrdersPage() {
	const navigate = useNavigate();
	const fileRef = useRef<HTMLInputElement>(null);
	const { mutate: importCsv, isPending, data: lastResult } = useImportCsv();
	const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
	const { data: batches, isLoading: loadingBatches, refetch } = useGetImportBatches();
	const batchList: ImportBatch[] = (batches as any)?.data ?? [];

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		importCsv(file, {
			onSuccess: (batch) => {
				setSelectedBatchId(batch.id);
				refetch();
			},
		});
		e.target.value = "";
	};

	return (
		<div className="p-8 space-y-6 max-w-4xl">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Import đơn TikTok / Google Sheet</h1>
				<Button variant="outline" size="sm" onClick={() => navigate("/dashboard/orders")}>
					Xem danh sách đơn <ArrowRight size={13} className="ml-1" />
				</Button>
			</div>

			{/* Upload zone */}
			<Card>
				<CardHeader><CardTitle className="text-base">Upload file CSV</CardTitle></CardHeader>
				<CardContent className="space-y-3">
					<div
						className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/30 transition-colors"
						onClick={() => fileRef.current?.click()}>
						<Upload className="mx-auto mb-2 text-muted-foreground" size={32} />
						<p className="text-sm font-medium">Click để chọn file CSV</p>
						<p className="text-xs text-muted-foreground mt-1">
							Tối đa 5MB · Định dạng CSV với header tiếng Việt hoặc tiếng Anh
						</p>
						{isPending && (
							<p className="text-sm text-sky-600 mt-2 animate-pulse">Đang xử lý file...</p>
						)}
					</div>
					<input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileChange} />

					<div className="text-xs text-muted-foreground space-y-1">
						<p className="font-medium">Cột hỗ trợ (tên cột trong CSV):</p>
						<p>Mã đơn · Tên sản phẩm · Size · Màu · Số lượng · Tên in · Số in · FC</p>
						<p className="text-sky-600">Đơn có "Tên in" hoặc "Số in" → tự động đánh dấu "Có in tên số"</p>
					</div>
				</CardContent>
			</Card>

			{/* Last result */}
			{lastResult && (
				<Card className={lastResult.error_rows > 0 ? "border-orange-300" : "border-green-300"}>
					<CardContent className="pt-4">
						<div className="flex items-center gap-3">
							{lastResult.error_rows === 0 ? (
								<CheckCircle2 className="text-green-600" size={20} />
							) : (
								<AlertTriangle className="text-orange-500" size={20} />
							)}
							<div>
								<p className="font-medium text-sm">{lastResult.filename}</p>
								<p className="text-xs text-muted-foreground">
									{lastResult.total_rows} dòng · {lastResult.success_rows} thành công ·{" "}
									<span className={lastResult.error_rows > 0 ? "text-red-600" : ""}>
										{lastResult.error_rows} lỗi
									</span>
								</p>
							</div>
							{selectedBatchId && (
								<Button variant="outline" size="sm" className="ml-auto"
									onClick={() => navigate(`/dashboard/orders?batch=${selectedBatchId}`)}>
									Xem đơn đã import
								</Button>
							)}
						</div>
						{lastResult.error_rows > 0 && selectedBatchId && (
							<div className="mt-3 border-t pt-3">
								<p className="text-xs font-medium mb-2 text-red-600">Chi tiết lỗi:</p>
								<BatchErrorsPanel batchId={selectedBatchId} />
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* Batch history */}
			<Card>
				<CardHeader className="flex-row items-center justify-between pb-2">
					<CardTitle className="text-base">Lịch sử import</CardTitle>
					<Button variant="ghost" size="sm" onClick={() => refetch()}>Làm mới</Button>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>File</TableHead>
								<TableHead>Trạng thái</TableHead>
								<TableHead className="text-center">Tổng</TableHead>
								<TableHead className="text-center">OK</TableHead>
								<TableHead className="text-center">Lỗi</TableHead>
								<TableHead>Thời gian</TableHead>
								<TableHead></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loadingBatches ? (
								<TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">Đang tải...</TableCell></TableRow>
							) : batchList.length === 0 ? (
								<TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">Chưa có lô import nào</TableCell></TableRow>
							) : batchList.map((b) => {
								const cfg = BATCH_STATUS_CONFIG[b.status];
								return (
									<TableRow key={b.id}
										className={selectedBatchId === b.id ? "bg-sky-50" : ""}
										onClick={() => setSelectedBatchId(b.id === selectedBatchId ? null : b.id)}
									>
										<TableCell className="text-sm">
											<div className="flex items-center gap-2">
												<FileText size={13} className="text-muted-foreground" />
												{b.filename}
											</div>
										</TableCell>
										<TableCell><Badge variant={cfg.variant}>{cfg.label}</Badge></TableCell>
										<TableCell className="text-center">{b.total_rows}</TableCell>
										<TableCell className="text-center text-green-600">{b.success_rows}</TableCell>
										<TableCell className="text-center">
											{b.error_rows > 0 ? (
												<span className="text-red-600 font-medium">{b.error_rows}</span>
											) : 0}
										</TableCell>
										<TableCell className="text-muted-foreground text-sm">
											{new Date(b.created_at).toLocaleString("vi-VN")}
										</TableCell>
										<TableCell>
											<Button variant="ghost" size="sm"
												onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/orders?batch=${b.id}`); }}>
												Xem đơn
											</Button>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
					{selectedBatchId && (
						<div className="mt-3 border-t pt-3">
							<p className="text-xs font-medium mb-2 text-muted-foreground">Lỗi của lô đã chọn:</p>
							<BatchErrorsPanel batchId={selectedBatchId} />
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
