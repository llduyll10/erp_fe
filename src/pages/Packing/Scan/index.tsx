import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { scanForPacking, packOrder } from "@/services/packing/request";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query.constant";
import { toast } from "sonner";
import { ScanLine, Package, AlertTriangle, CheckCircle2, Printer } from "lucide-react";

export function PackingScanPage() {
	const qc = useQueryClient();
	const [orderId, setOrderId] = useState("");
	const [result, setResult] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [packing, setPacking] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => { inputRef.current?.focus(); }, []);

	const handleScan = async (id = orderId) => {
		const trimmed = id.trim();
		if (!trimmed) return;
		setLoading(true);
		setError(null);
		setResult(null);
		try {
			const res = await scanForPacking(trimmed);
			setResult(res);
		} catch {
			setError(`Không tìm thấy đơn: ${trimmed}`);
		} finally {
			setLoading(false);
		}
	};

	const handlePack = async () => {
		if (!result?.order) return;
		setPacking(true);
		try {
			await packOrder(result.order.external_order_id);
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.PACKING.QUEUE] });
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.PACKING.STATS] });
			toast.success(`✓ Đã đóng gói: ${result.order.external_order_id}`);
			setResult(null);
			setOrderId("");
			setTimeout(() => inputRef.current?.focus(), 100);
		} catch (e: any) {
			toast.error(e?.response?.data?.message ?? "Lỗi đóng gói");
		} finally {
			setPacking(false);
		}
	};

	const order = result?.order;
	const pj = result?.packing_job;
	const warning = result?.print_warning;

	return (
		<div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-start p-6 pt-10">
			<div className="w-full max-w-md space-y-6">
				<div className="text-center">
					<Package className="mx-auto mb-2 text-green-400" size={36} />
					<h1 className="text-2xl font-bold">Scan đóng gói</h1>
					<p className="text-gray-400 text-sm">Quét mã đơn để xác nhận đóng gói</p>
				</div>

				<div className="flex gap-2">
					<Input
						ref={inputRef}
						value={orderId}
						onChange={(e) => setOrderId(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleScan()}
						placeholder="Mã đơn TikTok..."
						className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 text-lg h-12"
						autoComplete="off"
					/>
					<Button onClick={() => handleScan()} disabled={loading} className="h-12 px-6">
						{loading ? "..." : "Scan"}
					</Button>
				</div>

				{error && (
					<div className="bg-red-900/40 border border-red-700 rounded-xl p-4 text-red-300 text-center">
						{error}
					</div>
				)}

				{order && (
					<div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 space-y-4">
						<div className="text-center space-y-1">
							<p className="text-gray-400 text-xs uppercase tracking-widest">Mã đơn</p>
							<p className="text-3xl font-black text-white">{order.external_order_id}</p>
						</div>

						<div className="text-center">
							<p className="text-gray-400 text-xs uppercase tracking-widest">Sản phẩm</p>
							<p className="text-2xl font-bold text-sky-300">{order.product_name}</p>
							{order.size && <p className="text-4xl font-black text-sky-400 mt-1">{order.size}</p>}
							{order.color && <p className="text-gray-400 text-sm">{order.color}</p>}
						</div>

						<div className="flex items-center justify-center gap-2 text-sm">
							<span className="text-gray-400">Số lượng:</span>
							<span className="text-xl font-bold">{order.quantity}</span>
						</div>

						{order.has_print && (
							<div className="bg-sky-900/30 border border-sky-700 rounded-lg p-3 text-center">
								<div className="flex items-center justify-center gap-2 mb-1">
									<Printer size={14} className="text-sky-400" />
									<span className="text-sky-400 text-xs uppercase">In tên số</span>
								</div>
								<p className="text-yellow-300 font-bold text-lg">
									{order.print_name} {order.print_number && `#${order.print_number}`}
								</p>
							</div>
						)}

						{warning && (
							<div className="bg-orange-900/40 border border-orange-600 rounded-lg p-3 flex items-center gap-2">
								<AlertTriangle size={16} className="text-orange-400 shrink-0" />
								<span className="text-orange-300 text-sm">{warning}</span>
							</div>
						)}

						{pj?.status === "packed" && (
							<div className="bg-green-900/30 border border-green-600 rounded-lg p-3 flex items-center gap-2">
								<CheckCircle2 size={16} className="text-green-400" />
								<span className="text-green-300 text-sm">Đơn này đã được đóng gói trước đó</span>
							</div>
						)}

						<div className="flex gap-2">
							<Button
								className="flex-1 bg-green-600 hover:bg-green-500 font-bold h-14 text-lg"
								disabled={packing || pj?.status === "packed"}
								onClick={handlePack}>
								<Package size={20} className="mr-2" />
								{packing ? "Đang lưu..." : "ĐÃ ĐÓNG GÓI"}
							</Button>
							<Button
								variant="ghost"
								className="text-gray-500 hover:text-gray-300 h-14"
								onClick={() => { setResult(null); setOrderId(""); inputRef.current?.focus(); }}>
								Bỏ qua
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
