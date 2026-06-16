import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getViewUrl } from "@/services/file";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OptimizedImage } from "@/components/molecules/optimized-image";
import { ImageIcon, ArrowLeft, ArrowDown, Printer } from "lucide-react";
import {
	useGetProductionOrder,
	useUpdateProductionStatus,
	useStockInFromProduction,
} from "@/services/production";
import { useGetSettings } from "@/services/company-settings";
import type { ProductionOrderItem, ProductionOrderStatus } from "@/models/production-order.model";

const STATUS_CONFIG: Record<ProductionOrderStatus, {
	label: string;
	variant: "default" | "secondary" | "destructive" | "outline";
}> = {
	draft:       { label: "Mới tạo",     variant: "secondary" },
	in_progress: { label: "Đang may",    variant: "default" },
	done:        { label: "Đã may xong", variant: "outline" },
	stocked:     { label: "Đã nhập kho", variant: "default" },
	cancelled:   { label: "Đã hủy",      variant: "destructive" },
};

function groupByProduct(items: ProductionOrderItem[]) {
	const map = new Map<string, { name: string; file_key: string | null; items: ProductionOrderItem[] }>();
	for (const item of items) {
		const key = item.product_id ?? "__none__";
		if (!map.has(key)) {
			map.set(key, {
				name: item.product?.name ?? "Chưa xác định",
				file_key: item.product?.file_key ?? null,
				items: [],
			});
		}
		map.get(key)!.items.push(item);
	}
	return Array.from(map.values());
}

const thS: React.CSSProperties = {
	border: "1px solid #333", padding: "6px 8px",
	fontWeight: "bold", textAlign: "center", backgroundColor: "#FFFF00",
};
const tdS: React.CSSProperties = { border: "1px solid #aaa", padding: "6px 8px" };

export function ProductionOrderDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { data: order, isLoading } = useGetProductionOrder(id!);
	const { data: settings } = useGetSettings();
	const { mutate: updateStatus } = useUpdateProductionStatus();
	const { mutate: stockIn, isPending: stocking } = useStockInFromProduction();
	const [stockQtys, setStockQtys] = useState<Record<string, number>>({});
	const [printing, setPrinting] = useState(false);

	const handlePrint = async () => {
		if (!order) return;
		setPrinting(true);

		const groups = groupByProduct(order.items ?? []);

		// Fetch all product image URLs
		const urlMap: Record<string, string> = {};
		await Promise.all(
			groups.map(async (g) => {
				if (!g.file_key) return;
				try {
					const res = await getViewUrl(g.file_key);
					urlMap[g.name] = res.url;
				} catch { /* skip */ }
			})
		);

		const today = new Date().toLocaleDateString("vi-VN", {
			day: "2-digit", month: "2-digit", year: "numeric",
		});
		const totalAll = (order.items ?? []).reduce((s, i) => s + i.qty_planned, 0);

		// Build print rows HTML
		const rowsHtml = groups.map((group) => {
			const imgUrl = urlMap[group.name];
			const imgCell = imgUrl
				? `<img src="${imgUrl}" style="width:100px;height:100px;object-fit:cover;border-radius:4px" />`
				: `<span style="color:#aaa;font-size:11px">Không có ảnh</span>`;

			return group.items.map((item, iIdx) => `
				<tr>
					${iIdx === 0 ? `<td rowspan="${group.items.length}" style="${tdCss};font-weight:bold;vertical-align:middle;text-align:center">${group.name}</td>` : ""}
					<td style="${tdCss};text-align:center">${item.size}</td>
					<td style="${tdCss};text-align:center">${item.qty_planned}</td>
					${iIdx === 0 && group === groups[0] ? `<td rowspan="${totalAll}" style="${tdCss};vertical-align:middle;text-align:center">${order.notes ?? ""}</td>` : ""}
					<td style="${tdCss}">${item.color ?? ""}</td>
					${iIdx === 0 ? `<td rowspan="${group.items.length}" style="${tdCss};vertical-align:middle;text-align:center;padding:4px">${imgCell}</td>` : ""}
				</tr>
			`).join("");
		}).join("");

		const html = `
			<html><head><title>Phiếu SX - ${order.order_number}</title>
			<style>
				body { font-family: Arial, sans-serif; font-size: 13px; padding: 32px; }
				@media print { @page { size: A4; margin: 15mm; } }
			</style></head>
			<body>
				<div style="margin-bottom:12px">
					<div style="font-weight:bold">CÔNG TY TNHH SX TM & DV BRAVIX</div>
					<div>${settings?.address ?? "79/57 Bùi Quang Là, P.12, Q.Gò Vấp, TP HCM"}</div>
					${settings?.phone ? `<div>Sdt: ${settings.phone}</div>` : ""}
				</div>
				<div style="text-align:center;font-weight:bold;font-size:16px;text-transform:uppercase;letter-spacing:1px;margin:16px 0 20px">
					Phiếu yêu cầu sản xuất
				</div>
				<table style="width:100%;border-collapse:collapse">
					<thead>
						<tr>
							<th style="${thCss}">Tên mã hàng</th>
							<th style="${thCss}">Size</th>
							<th style="${thCss}">Số lượng</th>
							<th style="${thCss}">Yêu Cầu</th>
							<th style="${thCss}">Ghi chú</th>
							<th style="${thCss};width:110px">Hình ảnh</th>
						</tr>
					</thead>
					<tbody>
						${rowsHtml}
						<tr>
							<td colspan="2" style="${tdCss};font-weight:bold;text-align:right">Tổng:</td>
							<td style="${tdCss};font-weight:bold;text-align:center">${totalAll}</td>
							<td colspan="3" style="${tdCss}"></td>
						</tr>
					</tbody>
				</table>
				<div style="margin-top:32px;text-align:center">
					<div>Ngày ${today}</div>
					<div style="margin-top:4px">Người lập</div>
					<div style="color:#555;font-size:12px"><em>(Ký, họ tên)</em></div>
					<div style="margin-top:48px;border-top:1px solid #000;width:160px;margin-left:auto;margin-right:auto"></div>
				</div>
			</body></html>
		`;

		const printHtml = html.replace(
			"</body></html>",
			`<script>
				window.onload = function() {
					var imgs = document.querySelectorAll('img');
					if (!imgs.length) { window.print(); return; }
					var done = 0;
					function check() { done++; if (done >= imgs.length) window.print(); }
					imgs.forEach(function(img) {
						if (img.complete) check(); else { img.onload = check; img.onerror = check; }
					});
				};
			</script></body></html>`,
		);

		const w = window.open("", "_blank", "width=820,height=650");
		if (w) {
			w.document.write(printHtml);
			w.document.close();
			setPrinting(false);
		} else {
			setPrinting(false);
		}
	};

	if (isLoading || !order)
		return <div className="p-8 text-muted-foreground">Đang tải...</div>;

	const groups = groupByProduct(order.items ?? []);
	const canStockIn = order.status === "done" || order.status === "in_progress";

	const handleStockIn = () => {
		const items = Object.entries(stockQtys)
			.filter(([, qty]) => qty > 0)
			.map(([item_id, quantity]) => ({ item_id, quantity }));
		if (!items.length) return;
		stockIn({ production_order_id: order.id, items }, { onSuccess: () => setStockQtys({}) });
	};

	return (
		<div className="p-8 max-w-4xl space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
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
				<Button variant="outline" size="sm" onClick={handlePrint} disabled={printing}>
					<Printer size={14} className="mr-1" />
					{printing ? "Đang chuẩn bị..." : "In phiếu"}
				</Button>
			</div>

			{/* Status */}
			<Card>
				<CardHeader className="flex-row items-center justify-between pb-2">
					<CardTitle className="text-base">Trạng thái</CardTitle>
					<Badge variant={STATUS_CONFIG[order.status].variant}>
						{STATUS_CONFIG[order.status].label}
					</Badge>
				</CardHeader>
				<CardContent className="space-y-2">
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
						<p className="text-sm text-muted-foreground">
							<span className="font-medium text-foreground">Yêu cầu:</span> {order.notes}
						</p>
					)}
				</CardContent>
			</Card>

			{/* Product groups */}
			{groups.map((group) => {
				const groupTotal = group.items.reduce((s, i) => s + i.qty_planned, 0);
				const groupStocked = group.items.reduce((s, i) => s + i.qty_stocked, 0);
				return (
					<Card key={group.name}>
						<CardHeader className="pb-3">
							<div className="flex items-center gap-4">
								{/* Product image using OptimizedImage */}
								<div className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border bg-muted">
									<OptimizedImage
										fileKey={group.file_key}
										alt={group.name}
										className="w-full h-full object-cover"
										showLoading={true}
										fallbackComponent={
											<div className="w-full h-full flex items-center justify-center">
												<ImageIcon size={24} className="text-muted-foreground" />
											</div>
										}
									/>
								</div>
								<div className="flex-1 min-w-0">
									<CardTitle className="text-base">{group.name}</CardTitle>
									<p className="text-sm text-muted-foreground mt-0.5">
										{groupStocked}/{groupTotal} đã nhập kho
									</p>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Size</TableHead>
										<TableHead>Ghi chú</TableHead>
										<TableHead className="text-center">Kế hoạch</TableHead>
										<TableHead className="text-center">Đã nhập</TableHead>
										<TableHead className="text-center">Còn lại</TableHead>
										{canStockIn && <TableHead className="text-center">Nhập kho</TableHead>}
									</TableRow>
								</TableHeader>
								<TableBody>
									{group.items.map((item) => {
										const remaining = item.qty_planned - item.qty_stocked;
										return (
											<TableRow key={item.id}>
												<TableCell className="font-semibold">{item.size}</TableCell>
												<TableCell className="text-muted-foreground text-sm">{item.color || "—"}</TableCell>
												<TableCell className="text-center">{item.qty_planned}</TableCell>
												<TableCell className="text-center text-green-600">{item.qty_stocked}</TableCell>
												<TableCell className="text-center">
													{remaining > 0
														? <span className="text-orange-600 font-medium">{remaining}</span>
														: <span className="text-green-600">✓</span>}
												</TableCell>
												{canStockIn && (
													<TableCell className="text-center">
														{remaining > 0 ? (
															<Input
																type="number" min={0} max={remaining}
																className="h-7 w-20 text-sm text-center mx-auto"
																value={stockQtys[item.id] ?? 0}
																onChange={(e) => setStockQtys((prev) => ({
																	...prev,
																	[item.id]: Math.min(parseInt(e.target.value) || 0, remaining),
																}))}
															/>
														) : "—"}
													</TableCell>
												)}
											</TableRow>
										);
									})}
									<TableRow className="bg-muted/30 font-medium">
										<TableCell colSpan={2}>Tổng</TableCell>
										<TableCell className="text-center">{groupTotal}</TableCell>
										<TableCell className="text-center text-green-600">{groupStocked}</TableCell>
										<TableCell colSpan={canStockIn ? 2 : 1} />
									</TableRow>
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				);
			})}

			{canStockIn && (
				<Button onClick={handleStockIn} disabled={stocking} className="gap-2">
					<ArrowDown size={14} />
					{stocking ? "Đang nhập..." : "Nhập kho từ lệnh SX"}
				</Button>
			)}
		</div>
	);
}

// CSS strings for print HTML
const thCss = "border:1px solid #333;padding:6px 8px;font-weight:bold;text-align:center;background-color:#FFFF00";
const tdCss = "border:1px solid #aaa;padding:6px 8px";
