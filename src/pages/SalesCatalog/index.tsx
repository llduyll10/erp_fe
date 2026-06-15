import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, Download, Copy, Eye, EyeOff } from "lucide-react";
import { OptimizedImage } from "@/components/molecules/optimized-image";
import {
	useGetSalesCatalog,
	useToggleVisibleForSales,
} from "@/services/product";
import type { SalesCatalogItem } from "@/models/product-media.model";
import { toast } from "sonner";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "FREE_SIZE"];

function StockCell({ qty }: { qty?: number }) {
	if (qty === undefined || qty === 0)
		return <span className="text-red-500 font-medium">0</span>;
	return <span className="text-green-700 font-medium">{qty}</span>;
}

function ProductRow({ item }: { item: SalesCatalogItem }) {
	const { mutate: toggle } = useToggleVisibleForSales();

	const copyInfo = () => {
		const text = `${item.name}\nTồn kho: ${item.total_stock}`;
		navigator.clipboard.writeText(text);
		toast.success("Đã copy thông tin");
	};

	const colors = Object.keys(item.stock_by_color);
	if (colors.length === 0) {
		return (
			<tr className="border-b hover:bg-muted/30">
				<td className="px-3 py-2 w-16">
					<OptimizedImage
						fileKey={item.primary_image}
						className="w-12 h-12 object-cover rounded"
						fallbackComponent={
							<div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
								No img
							</div>
						}
					/>
				</td>
				<td className="px-3 py-2 font-medium">{item.name}</td>
				{SIZES.map((s) => (
					<td key={s} className="px-2 py-2 text-center text-sm">—</td>
				))}
				<td className="px-3 py-2 text-center font-bold">{item.total_stock}</td>
				<td className="px-3 py-2">
					<div className="flex gap-1">
						<Button variant="ghost" size="sm" onClick={copyInfo}><Copy size={13} /></Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => toggle(item.id)}
							title={item.visible_for_sales ? "Ẩn khỏi catalog" : "Hiện lên catalog"}>
							{item.visible_for_sales ? <Eye size={13} /> : <EyeOff size={13} className="text-muted-foreground" />}
						</Button>
					</div>
				</td>
			</tr>
		);
	}

	return (
		<>
			{colors.map((color, ci) => (
				<tr key={color} className="border-b hover:bg-muted/30">
					{ci === 0 && (
						<>
							<td className="px-3 py-2 w-16" rowSpan={colors.length}>
								<OptimizedImage
									fileKey={item.primary_image}
									className="w-12 h-12 object-cover rounded"
									fallbackComponent={
										<div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
											No img
										</div>
									}
								/>
							</td>
							<td className="px-3 py-2 font-medium align-top" rowSpan={colors.length}>
								{item.name}
							</td>
						</>
					)}
					{ci > 0 && null}
					{SIZES.map((s) => (
						<td key={s} className="px-2 py-2 text-center text-sm">
							<StockCell qty={item.stock_by_color[color]?.[s]} />
						</td>
					))}
					<td className="px-3 py-2 text-center font-bold">
						{Object.values(item.stock_by_color[color] ?? {}).reduce((a, b) => a + b, 0)}
					</td>
					{ci === 0 && (
						<td className="px-3 py-2 align-top" rowSpan={colors.length}>
							<div className="flex gap-1 flex-col">
								<Button variant="ghost" size="sm" onClick={copyInfo}><Copy size={13} /></Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => toggle(item.id)}>
									{item.visible_for_sales ? <Eye size={13} /> : <EyeOff size={13} className="text-muted-foreground" />}
								</Button>
							</div>
						</td>
					)}
				</tr>
			))}
		</>
	);
}

export function SalesCatalogPage() {
	const [q, setQ] = useState("");
	const [search, setSearch] = useState("");
	const { data: items = [], isLoading, refetch } = useGetSalesCatalog(search);

	return (
		<div className="flex flex-col gap-4 p-8">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Catalog Sales</h1>
				<div className="flex gap-2">
					<Button variant="outline" size="sm" onClick={() => refetch()}>
						<RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
					</Button>
				</div>
			</div>

			<div className="flex gap-2 max-w-sm">
				<div className="relative flex-1">
					<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
					<Input
						className="pl-8"
						placeholder="Tìm mẫu..."
						value={q}
						onChange={(e) => setQ(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && setSearch(q)}
					/>
				</div>
				<Button size="sm" onClick={() => setSearch(q)}>Tìm</Button>
			</div>

			<div className="border rounded-lg overflow-x-auto">
				<table className="w-full text-sm">
					<thead className="bg-muted/50 border-b">
						<tr>
							<th className="px-3 py-2 text-left w-16">Ảnh</th>
							<th className="px-3 py-2 text-left">Mẫu</th>
							{SIZES.map((s) => (
								<th key={s} className="px-2 py-2 text-center w-16">{s}</th>
							))}
							<th className="px-3 py-2 text-center w-16">Tổng</th>
							<th className="px-3 py-2 text-left w-20">Thao tác</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr><td colSpan={SIZES.length + 4} className="text-center py-8 text-muted-foreground">Đang tải...</td></tr>
						) : items.length === 0 ? (
							<tr><td colSpan={SIZES.length + 4} className="text-center py-8 text-muted-foreground">Chưa có mẫu nào</td></tr>
						) : (
							items.map((item) => <ProductRow key={item.id} item={item} />)
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
