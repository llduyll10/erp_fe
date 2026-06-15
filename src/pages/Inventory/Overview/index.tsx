import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Search, RefreshCw, SlidersHorizontal } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetInventoryOverview } from "@/services/product";
import { useAdjustStock } from "@/services/warehouse";
import type { InventoryOverviewRow } from "@/models/product-media.model";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "FREE_SIZE"];
const SIZE_LABELS: Record<string, string> = {
	XS: "XS", S: "S", M: "M", L: "L", XL: "XL", XXL: "2XL", FREE_SIZE: "FS",
};

const LOW_THRESHOLD = 5;

function stockColor(qty: number) {
	if (qty === 0) return "bg-red-100 text-red-700 font-bold";
	if (qty <= LOW_THRESHOLD) return "bg-orange-100 text-orange-700 font-semibold";
	return "text-green-700";
}

const adjustSchema = z.object({
	quantity_after: z.coerce.number().int().min(0),
	reason: z.string().optional(),
});

function AdjustDialog({
	variantId,
	currentQty,
	label,
}: {
	variantId: string;
	currentQty: number;
	label: string;
}) {
	const [open, setOpen] = useState(false);
	const { mutate: adjust, isPending } = useAdjustStock();
	const form = useForm({
		resolver: zodResolver(adjustSchema),
		defaultValues: { quantity_after: currentQty, reason: "" },
	});

	const onSubmit = (data: z.infer<typeof adjustSchema>) => {
		adjust(
			{ variant_id: variantId, ...data },
			{ onSuccess: () => setOpen(false) },
		);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<button className="hover:underline cursor-pointer">{currentQty}</button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>Điều chỉnh tồn — {label}</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 mt-2">
						<FormField control={form.control} name="quantity_after" render={({ field }) => (
							<FormItem>
								<FormLabel>Số lượng mới (hiện tại: {currentQty})</FormLabel>
								<FormControl><Input type="number" min={0} {...field} /></FormControl>
								<FormMessage />
							</FormItem>
						)} />
						<FormField control={form.control} name="reason" render={({ field }) => (
							<FormItem>
								<FormLabel>Lý do (tuỳ chọn)</FormLabel>
								<FormControl><Input placeholder="Kiểm kê tháng 6..." {...field} /></FormControl>
								<FormMessage />
							</FormItem>
						)} />
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
							<Button type="submit" disabled={isPending}>{isPending ? "Đang lưu..." : "Lưu"}</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

function OverviewRow({ row }: { row: InventoryOverviewRow }) {
	const lowItems = Object.values(row.sizes).filter((q) => q <= LOW_THRESHOLD && q > 0).length;
	const outItems = Object.values(row.sizes).filter((q) => q === 0).length;

	return (
		<tr className="border-b hover:bg-muted/30">
			<td className="px-3 py-2 font-medium">{row.product_name}</td>
			<td className="px-3 py-2">
				{row.color ? (
					<Badge variant="outline" className="text-xs">{row.color}</Badge>
				) : (
					<span className="text-muted-foreground text-xs">—</span>
				)}
			</td>
			{SIZES.map((s) => {
				const qty = row.sizes[s] ?? 0;
				return (
					<td key={s} className={`px-2 py-2 text-center text-sm ${stockColor(qty)}`}>
						{qty > 0 ? qty : <span className="text-red-500">0</span>}
					</td>
				);
			})}
			<td className="px-3 py-2 text-center font-bold">{row.total}</td>
			<td className="px-3 py-2 text-center">
				{outItems > 0 && (
					<Badge variant="destructive" className="text-xs mr-1">Hết {outItems} size</Badge>
				)}
				{lowItems > 0 && outItems === 0 && (
					<Badge variant="secondary" className="text-xs text-orange-600">Thấp</Badge>
				)}
			</td>
		</tr>
	);
}

export function InventoryOverviewPage() {
	const [q, setQ] = useState("");
	const [search, setSearch] = useState("");
	const { data: rows = [], isLoading, refetch } = useGetInventoryOverview(search);

	const totalOut = rows.reduce(
		(s, r) => s + Object.values(r.sizes).filter((q) => q === 0).length,
		0,
	);
	const totalLow = rows.reduce(
		(s, r) =>
			s + Object.values(r.sizes).filter((q) => q > 0 && q <= LOW_THRESHOLD).length,
		0,
	);

	return (
		<div className="flex flex-col gap-4 p-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Tồn kho theo mẫu / size</h1>
					<div className="flex gap-3 mt-1 text-sm">
						{totalOut > 0 && (
							<span className="text-red-600 font-medium">{totalOut} size hết hàng</span>
						)}
						{totalLow > 0 && (
							<span className="text-orange-500 font-medium">{totalLow} size sắp hết</span>
						)}
					</div>
				</div>
				<Button variant="outline" size="sm" onClick={() => refetch()}>
					<RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
				</Button>
			</div>

			<div className="flex gap-2 max-w-sm">
				<div className="relative flex-1">
					<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
					<Input
						className="pl-8"
						placeholder="Tìm theo tên, SKU..."
						value={q}
						onChange={(e) => setQ(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && setSearch(q)}
					/>
				</div>
				<Button size="sm" onClick={() => setSearch(q)}>Tìm</Button>
			</div>

			<div className="text-xs text-muted-foreground flex items-center gap-3">
				<span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-red-100" /> Hết hàng</span>
				<span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-orange-100" /> Sắp hết (≤{LOW_THRESHOLD})</span>
				<span className="text-muted-foreground">Click vào số để điều chỉnh tồn kho</span>
			</div>

			<div className="border rounded-lg overflow-x-auto">
				<table className="w-full text-sm">
					<thead className="bg-muted/50 border-b">
						<tr>
							<th className="px-3 py-2 text-left min-w-[160px]">Mẫu</th>
							<th className="px-3 py-2 text-left w-24">Màu</th>
							{SIZES.map((s) => (
								<th key={s} className="px-2 py-2 text-center w-14">
									{SIZE_LABELS[s]}
								</th>
							))}
							<th className="px-3 py-2 text-center w-16">Tổng</th>
							<th className="px-3 py-2 text-left w-28">Trạng thái</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr><td colSpan={SIZES.length + 4} className="text-center py-8 text-muted-foreground">Đang tải...</td></tr>
						) : rows.length === 0 ? (
							<tr><td colSpan={SIZES.length + 4} className="text-center py-8 text-muted-foreground">Không có dữ liệu</td></tr>
						) : (
							rows.map((row, i) => <OverviewRow key={`${row.product_id}-${row.color}-${i}`} row={row} />)
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
