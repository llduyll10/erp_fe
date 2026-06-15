import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
	Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useCreateProductionOrder } from "@/services/production";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "FREE_SIZE"];

type ItemRow = { size: string; color: string; qty_planned: number };

const schema = z.object({
	notes: z.string().optional(),
});

export function CreateProductionOrderPage() {
	const navigate = useNavigate();
	const { mutate: create, isPending } = useCreateProductionOrder();
	const [items, setItems] = useState<ItemRow[]>([{ size: "M", color: "", qty_planned: 10 }]);
	const form = useForm({ resolver: zodResolver(schema), defaultValues: { notes: "" } });

	const addItem = () => setItems((prev) => [...prev, { size: "L", color: "", qty_planned: 10 }]);
	const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));
	const updateItem = (i: number, key: keyof ItemRow, value: string | number) =>
		setItems((prev) => prev.map((r, idx) => idx === i ? { ...r, [key]: value } : r));

	const onSubmit = (data: z.infer<typeof schema>) => {
		if (items.length === 0) return;
		create(
			{
				notes: data.notes,
				items: items.map((i) => ({
					size: i.size,
					color: i.color || undefined,
					qty_planned: i.qty_planned,
				})),
			},
			{ onSuccess: (order) => navigate(`/dashboard/production/orders/${order.id}`) },
		);
	};

	return (
		<div className="p-8 max-w-3xl">
			<div className="flex items-center gap-3 mb-6">
				<Button variant="outline" size="sm" onClick={() => navigate(-1)}>
					<ArrowLeft size={14} className="mr-1" /> Quay lại
				</Button>
				<h1 className="text-2xl font-bold">Tạo lệnh sản xuất</h1>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<FormField control={form.control} name="notes" render={({ field }) => (
						<FormItem>
							<FormLabel>Ghi chú</FormLabel>
							<FormControl><Textarea placeholder="Ghi chú cho xưởng..." rows={2} {...field} /></FormControl>
							<FormMessage />
						</FormItem>
					)} />

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<FormLabel>Danh sách size cần may</FormLabel>
							<Button type="button" variant="outline" size="sm" onClick={addItem}>
								<Plus size={13} className="mr-1" /> Thêm dòng
							</Button>
						</div>

						<div className="border rounded-lg">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Size</TableHead>
										<TableHead>Màu</TableHead>
										<TableHead>Số lượng</TableHead>
										<TableHead className="w-10"></TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{items.map((item, i) => (
										<TableRow key={i}>
											<TableCell>
												<select
													className="border rounded px-2 py-1 text-sm w-28"
													value={item.size}
													onChange={(e) => updateItem(i, "size", e.target.value)}>
													{SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
												</select>
											</TableCell>
											<TableCell>
												<Input
													value={item.color}
													onChange={(e) => updateItem(i, "color", e.target.value)}
													placeholder="Xanh, Đỏ..."
													className="h-8 text-sm w-28"
												/>
											</TableCell>
											<TableCell>
												<Input
													type="number"
													min={1}
													value={item.qty_planned}
													onChange={(e) => updateItem(i, "qty_planned", parseInt(e.target.value) || 0)}
													className="h-8 text-sm w-24"
												/>
											</TableCell>
											<TableCell>
												<Button type="button" variant="ghost" size="sm"
													onClick={() => removeItem(i)} className="text-red-500 h-7 w-7 p-0">
													<Trash2 size={13} />
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
						<div className="text-sm text-muted-foreground">
							Tổng: {items.reduce((s, i) => s + (i.qty_planned || 0), 0)} cái
						</div>
					</div>

					<div className="flex gap-2">
						<Button type="button" variant="outline" onClick={() => navigate(-1)}>Hủy</Button>
						<Button type="submit" disabled={isPending || items.length === 0}>
							{isPending ? "Đang tạo..." : "Tạo lệnh sản xuất"}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
