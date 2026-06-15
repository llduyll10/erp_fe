import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPrintJobByBarcode, updatePrintJobStatus } from "@/services/printing/request";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query.constant";
import { toast } from "sonner";
import type { PrintJob } from "@/models/print-job.model";
import { CheckCircle2, XCircle, ShirtIcon, ScanLine } from "lucide-react";

export function PrintingScanPage() {
	const qc = useQueryClient();
	const [barcode, setBarcode] = useState("");
	const [job, setJob] = useState<PrintJob | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [actionPending, setActionPending] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	// Auto-focus on mount
	useEffect(() => { inputRef.current?.focus(); }, []);

	const handleScan = async (code = barcode) => {
		const trimmed = code.trim();
		if (!trimmed) return;
		setLoading(true);
		setError(null);
		setJob(null);
		try {
			const result = await getPrintJobByBarcode(trimmed);
			setJob(result);
		} catch {
			setError(`Không tìm thấy barcode: ${trimmed}`);
		} finally {
			setLoading(false);
		}
	};

	const handleAction = async (status: string, error_note?: string) => {
		if (!job) return;
		setActionPending(true);
		try {
			await updatePrintJobStatus(job.id, status, error_note);
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRINTING.STATS] });
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRINTING.LIST] });

			const labels: Record<string, string> = {
				printed: "✓ Đã ghi nhận ĐÃ IN",
				error: "✓ Đã ghi nhận LỖI IN",
				missing_shirt: "✓ Đã ghi nhận THIẾU ÁO",
			};
			toast.success(labels[status] ?? "Đã cập nhật");

			// Reset for next scan
			setJob(null);
			setBarcode("");
			setTimeout(() => inputRef.current?.focus(), 100);
		} catch (e: any) {
			toast.error(e?.response?.data?.message ?? "Lỗi cập nhật");
		} finally {
			setActionPending(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-start p-6 pt-10">
			<div className="w-full max-w-lg space-y-6">
				<div className="text-center">
					<ScanLine className="mx-auto mb-2 text-sky-400" size={36} />
					<h1 className="text-2xl font-bold">Scan in tên số</h1>
					<p className="text-gray-400 text-sm">Quét barcode hoặc nhập thủ công</p>
				</div>

				{/* Scan input */}
				<div className="flex gap-2">
					<Input
						ref={inputRef}
						value={barcode}
						onChange={(e) => setBarcode(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleScan()}
						placeholder="Quét barcode / nhập mã..."
						className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 text-lg h-12"
						autoComplete="off"
					/>
					<Button onClick={() => handleScan()} disabled={loading} className="h-12 px-6">
						{loading ? "..." : "Scan"}
					</Button>
				</div>

				{/* Error */}
				{error && (
					<div className="bg-red-900/40 border border-red-700 rounded-xl p-4 text-red-300 text-center">
						{error}
					</div>
				)}

				{/* Job display */}
				{job && (
					<div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 space-y-4">
						<div className="text-center space-y-1">
							<p className="text-gray-400 text-xs uppercase tracking-widest">Mẫu</p>
							<p className="text-3xl font-black text-white">{job.product_model}</p>
						</div>

						{job.size && (
							<div className="text-center">
								<p className="text-gray-400 text-xs uppercase tracking-widest">Size</p>
								<p className="text-5xl font-black text-sky-400">{job.size}</p>
							</div>
						)}

						{job.print_name && (
							<div className="text-center">
								<p className="text-gray-400 text-xs uppercase tracking-widest">Tên in</p>
								<p className="text-4xl font-black text-yellow-300 tracking-wide">
									{job.print_name}
								</p>
							</div>
						)}

						{job.print_number && (
							<div className="text-center">
								<p className="text-gray-400 text-xs uppercase tracking-widest">Số</p>
								<p className="text-6xl font-black text-yellow-300">{job.print_number}</p>
							</div>
						)}

						{job.fc && (
							<div className="text-center">
								<p className="text-gray-400 text-xs uppercase tracking-widest">FC</p>
								<p className="text-2xl font-bold text-gray-300">{job.fc}</p>
							</div>
						)}

						<div className="text-center">
							<p className="text-gray-500 text-xs font-mono">{job.barcode}</p>
							{job.status !== "pending" && (
								<p className="text-orange-400 text-sm mt-1">
									⚠️ Job này đã ở trạng thái: {job.status}
								</p>
							)}
						</div>

						{/* Action buttons */}
						<div className="grid grid-cols-3 gap-3 pt-2">
							<Button
								size="lg"
								disabled={actionPending}
								onClick={() => handleAction("printed")}
								className="bg-green-600 hover:bg-green-500 text-white font-bold h-16 text-base flex flex-col gap-1">
								<CheckCircle2 size={20} />
								ĐÃ IN
							</Button>
							<Button
								size="lg"
								disabled={actionPending}
								onClick={() => handleAction("error", "Lỗi in")}
								variant="destructive"
								className="font-bold h-16 text-base flex flex-col gap-1">
								<XCircle size={20} />
								LỖI IN
							</Button>
							<Button
								size="lg"
								disabled={actionPending}
								onClick={() => handleAction("missing_shirt")}
								className="bg-orange-600 hover:bg-orange-500 text-white font-bold h-16 text-base flex flex-col gap-1">
								<ShirtIcon size={20} />
								THIẾU ÁO
							</Button>
						</div>

						<Button
							variant="ghost"
							className="w-full text-gray-500 hover:text-gray-300"
							onClick={() => { setJob(null); setBarcode(""); inputRef.current?.focus(); }}>
							Bỏ qua → Scan tiếp
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
