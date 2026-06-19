import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, Trash2, X } from "lucide-react";
import { useCreateProductionOrder } from "@/services/production";
import { useGetSettings } from "@/services/company-settings";
import { useGetProductList } from "@/services/product";
import { useImageUrl } from "@/services/file";
import { AutocompleteSearch } from "@/components/molecules/autocomplete-search";
import { useAutocompleteSearch, useProductAutocomplete } from "@/hooks/common/useAutocompleteSearch";
import { Product } from "@/models/product.model";

type SizeRow = { size: string; qty_planned: number; note: string };
type ProductGroup = { product_id: string; product_name: string; file_key?: string | null; rows: SizeRow[] };

const schema = z.object({ requirement: z.string().optional() });

function ProductGroupCard({
	group, sizes, onRemoveGroup, onAddRow, onRemoveRow, onUpdateRow,
}: {
	group: ProductGroup;
	sizes: string[];
	onRemoveGroup: () => void;
	onAddRow: () => void;
	onRemoveRow: (rIdx: number) => void;
	onUpdateRow: (rIdx: number, key: keyof SizeRow, val: string | number) => void;
}) {
	const { data: imgData } = useImageUrl(group.file_key);
	const imgUrl = imgData?.url;
	const total = group.rows.reduce((s, r) => s + (r.qty_planned || 0), 0);

	return (
		<div className="border rounded-lg overflow-hidden">
			{/* Group header */}
			<div className="flex items-center gap-3 bg-yellow-50 border-b px-4 py-2">
				<div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden border bg-muted flex items-center justify-center">
					{imgUrl ? (
						<img src={imgUrl} alt={group.product_name} className="w-full h-full object-cover" />
					) : (
						<span className="text-[10px] text-muted-foreground text-center">No img</span>
					)}
				</div>
				<span className="font-semibold text-sm flex-1">{group.product_name}</span>
				<span className="text-xs text-muted-foreground">{total.toLocaleString("vi-VN")} cái</span>
				<Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-700" onClick={onRemoveGroup}>
					<X size={14} />
				</Button>
			</div>

			{/* Size rows */}
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/30">
						<TableHead className="w-32">Size</TableHead>
						<TableHead className="w-32 text-center">Số lượng</TableHead>
						<TableHead>Ghi chú</TableHead>
						<TableHead className="w-10"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{group.rows.map((row, rIdx) => (
						<TableRow key={rIdx}>
							<TableCell>
								<select
									className="border rounded px-2 py-1 text-sm w-28"
									value={row.size}
									onChange={(e) => onUpdateRow(rIdx, "size", e.target.value)}>
									{sizes.map((s) => <option key={s} value={s}>{s}</option>)}
								</select>
							</TableCell>
							<TableCell>
								<Input
									type="number" min={0} value={row.qty_planned}
									onChange={(e) => onUpdateRow(rIdx, "qty_planned", parseInt(e.target.value) || 0)}
									className="h-8 text-sm w-24 text-center mx-auto"
								/>
							</TableCell>
							<TableCell>
								<Input
									value={row.note}
									onChange={(e) => onUpdateRow(rIdx, "note", e.target.value)}
									placeholder="Ghi chú..."
									className="h-8 text-sm"
								/>
							</TableCell>
							<TableCell>
								<Button type="button" variant="ghost" size="sm"
									onClick={() => onRemoveRow(rIdx)}
									className="text-red-400 hover:text-red-600 h-7 w-7 p-0">
									<Trash2 size={12} />
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<div className="px-4 py-2 border-t bg-muted/10">
				<Button type="button" variant="ghost" size="sm" className="text-xs h-7" onClick={onAddRow}>
					<Plus size={12} className="mr-1" /> Thêm size
				</Button>
			</div>
		</div>
	);
}

export function CreateProductionOrderPage() {
	const navigate = useNavigate();
	const { mutate: create, isPending } = useCreateProductionOrder();
	const { data: settings } = useGetSettings();
	const sizes = settings?.sizes ?? ["S", "M", "L", "XL", "2XL", "3XL"];

	const [groups, setGroups] = useState<ProductGroup[]>([]);
	const [addingProduct, setAddingProduct] = useState(false);
	const [newProductId, setNewProductId] = useState("");
	const [newProductName, setNewProductName] = useState("");
	const [newProductFileKey, setNewProductFileKey] = useState<string | null>(null);

	const form = useForm({ resolver: zodResolver(schema), defaultValues: { requirement: "" } });

	// Add a new product group
	const confirmAddProduct = () => {
		if (!newProductId) return;
		if (groups.find((g) => g.product_id === newProductId)) {
			setAddingProduct(false);
			return;
		}
		setGroups((prev) => [
			...prev,
			{
				product_id: newProductId,
				product_name: newProductName,
				file_key: newProductFileKey,
				rows: sizes.map((s) => ({ size: s, qty_planned: 0, note: "" })),
			},
		]);
		setNewProductId("");
		setNewProductName("");
		setNewProductFileKey(null);
		setAddingProduct(false);
	};

	const removeGroup = (idx: number) =>
		setGroups((prev) => prev.filter((_, i) => i !== idx));

	const addRow = (gIdx: number) =>
		setGroups((prev) =>
			prev.map((g, i) =>
				i !== gIdx ? g : { ...g, rows: [...g.rows, { size: sizes[0] ?? "S", qty_planned: 0, note: "" }] }
			)
		);

	const removeRow = (gIdx: number, rIdx: number) =>
		setGroups((prev) =>
			prev.map((g, i) =>
				i !== gIdx ? g : { ...g, rows: g.rows.filter((_, j) => j !== rIdx) }
			)
		);

	const updateRow = (gIdx: number, rIdx: number, key: keyof SizeRow, val: string | number) =>
		setGroups((prev) =>
			prev.map((g, i) =>
				i !== gIdx ? g : {
					...g,
					rows: g.rows.map((r, j) => (j !== rIdx ? r : { ...r, [key]: val })),
				}
			)
		);

	const totalAll = groups.reduce(
		(s, g) => s + g.rows.reduce((rs, r) => rs + (r.qty_planned || 0), 0), 0
	);

	const onSubmit = (data: z.infer<typeof schema>) => {
		const items = groups.flatMap((g) =>
			g.rows
				.filter((r) => r.qty_planned > 0)
				.map((r) => ({
					product_id: g.product_id,
					size: r.size,
					color: r.note || undefined,
					qty_planned: r.qty_planned,
				}))
		);
		if (items.length === 0) return;
		create(
			{ notes: data.requirement, items },
			{ onSuccess: (order) => navigate(`/dashboard/production/orders/${order.id}`) }
		);
	};

	const { fieldConfig } = useProductAutocomplete();
	const { useQuery } = useAutocompleteSearch(useGetProductList, fieldConfig);

	return (
		<div className="p-8 max-w-4xl">
			<div className="flex items-center gap-3 mb-6">
				<Button variant="outline" size="sm" onClick={() => navigate(-1)}>
					<ArrowLeft size={14} className="mr-1" /> Quay lại
				</Button>
				<h1 className="text-2xl font-bold">Tạo phiếu yêu cầu sản xuất</h1>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					{/* Yêu cầu chung */}
					<FormField
						control={form.control}
						name="requirement"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Yêu cầu chung</FormLabel>
								<FormControl>
									<Textarea
										placeholder="VD: In / Cắt / Sáp bán thành phẩm theo bộ..."
										rows={2}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Product groups */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<FormLabel className="text-base">Danh sách sản phẩm</FormLabel>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setAddingProduct(true)}>
								<Plus size={13} className="mr-1" /> Thêm sản phẩm
							</Button>
						</div>

						{/* Product picker */}
						{addingProduct && (
							<div className="border rounded-lg p-4 bg-muted/30 space-y-3">
								<div className="text-sm font-medium">Chọn sản phẩm để thêm</div>
								<AutocompleteSearch<Product>
									useQuery={useQuery}
									fieldConfig={fieldConfig}
									value={newProductId}
									onValueChange={(id, item) => {
										setNewProductId(id);
										setNewProductName((item as Product)?.name ?? "");
										setNewProductFileKey((item as Product)?.file_key ?? null);
									}}
									placeholder="Tìm sản phẩm..."
									searchPlaceholder="Nhập tên sản phẩm..."
									emptyMessage="Không tìm thấy"
								/>
								<div className="flex gap-2">
									<Button type="button" size="sm" onClick={confirmAddProduct} disabled={!newProductId}>
										Thêm vào phiếu
									</Button>
									<Button type="button" size="sm" variant="outline" onClick={() => setAddingProduct(false)}>
										Hủy
									</Button>
								</div>
							</div>
						)}

						{groups.length === 0 && !addingProduct && (
							<div className="border rounded-lg py-10 text-center text-muted-foreground text-sm">
								Chưa có sản phẩm nào. Nhấn "Thêm sản phẩm" để bắt đầu.
							</div>
						)}

						{groups.map((group, gIdx) => (
							<ProductGroupCard
								key={group.product_id}
								group={group}
								sizes={sizes}
								onRemoveGroup={() => removeGroup(gIdx)}
								onAddRow={() => addRow(gIdx)}
								onRemoveRow={(rIdx) => removeRow(gIdx, rIdx)}
								onUpdateRow={(rIdx, key, val) => updateRow(gIdx, rIdx, key, val)}
							/>
						))}

						{groups.length > 0 && (
							<div className="text-sm font-medium text-right pr-1">
								Tổng toàn phiếu:{" "}
								<span className="text-base font-bold">{totalAll.toLocaleString("vi-VN")}</span> sản phẩm
							</div>
						)}
					</div>

					<div className="flex gap-2">
						<Button type="button" variant="outline" onClick={() => navigate(-1)}>
							Hủy
						</Button>
						<Button type="submit" disabled={isPending || groups.length === 0 || totalAll === 0}>
							{isPending ? "Đang tạo..." : "Tạo phiếu sản xuất"}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
