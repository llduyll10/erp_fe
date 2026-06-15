import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	useGetSettings,
	useUpdateProductSettings,
} from "@/services/company-settings";

const schema = z.object({
	low_stock_threshold: z.coerce.number().int().min(0),
	product_code_prefix: z.string().max(20),
	product_code_pad: z.coerce.number().int().min(1),
	production_order_code_prefix: z.string().max(20),
	production_order_code_pad: z.coerce.number().int().min(1),
	print_job_code_prefix: z.string().max(20),
	print_job_code_pad: z.coerce.number().int().min(1),
	stock_in_code_prefix: z.string().max(20),
	stock_in_code_pad: z.coerce.number().int().min(1),
});

type FormValues = z.infer<typeof schema>;

export function ProductSettingsPage() {
	const { data: settings, isLoading } = useGetSettings();
	const { mutate: save, isPending } = useUpdateProductSettings();
	const [sizes, setSizes] = useState<string[]>([]);
	const [newSize, setNewSize] = useState("");

	const form = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			low_stock_threshold: 10,
			product_code_prefix: "SP",
			product_code_pad: 4,
			production_order_code_prefix: "SX",
			production_order_code_pad: 6,
			print_job_code_prefix: "PRINT",
			print_job_code_pad: 6,
			stock_in_code_prefix: "NK",
			stock_in_code_pad: 6,
		},
	});

	useEffect(() => {
		if (settings) {
			form.reset({
				low_stock_threshold: settings.low_stock_threshold,
				product_code_prefix: settings.product_code_prefix,
				product_code_pad: settings.product_code_pad,
				production_order_code_prefix: settings.production_order_code_prefix,
				production_order_code_pad: settings.production_order_code_pad,
				print_job_code_prefix: settings.print_job_code_prefix,
				print_job_code_pad: settings.print_job_code_pad,
				stock_in_code_prefix: settings.stock_in_code_prefix,
				stock_in_code_pad: settings.stock_in_code_pad,
			});
			setSizes(settings.sizes ?? ["S", "M", "L", "XL", "2XL", "3XL"]);
		}
	}, [settings]);

	const onSubmit = (values: FormValues) => save({ ...values, sizes });

	const removeSize = (s: string) => setSizes((prev) => prev.filter((x) => x !== s));
	const addSize = () => {
		const trimmed = newSize.trim().toUpperCase();
		if (trimmed && !sizes.includes(trimmed)) {
			setSizes((prev) => [...prev, trimmed]);
		}
		setNewSize("");
	};

	if (isLoading) return <div className="p-8">Đang tải...</div>;

	return (
		<div className="p-8 max-w-2xl space-y-6">
			<h1 className="text-2xl font-bold">Cấu hình sản phẩm & kho</h1>

			<Card>
				<CardHeader>
					<CardTitle>Cấu hình size</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex flex-wrap gap-2">
						{sizes.map((s) => (
							<Badge key={s} variant="secondary" className="gap-1 pr-1">
								{s}
								<button onClick={() => removeSize(s)} className="hover:text-red-500">
									<X size={12} />
								</button>
							</Badge>
						))}
					</div>
					<div className="flex gap-2">
						<Input
							value={newSize}
							onChange={(e) => setNewSize(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSize())}
							placeholder="Thêm size (VD: 4XL)"
							className="max-w-xs"
						/>
						<Button variant="outline" size="sm" onClick={addSize}>
							<Plus size={14} className="mr-1" /> Thêm
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Cấu hình mã chứng từ & tồn kho</CardTitle>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="low_stock_threshold"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Ngưỡng tồn thấp (cảnh báo khi tồn ≤ giá trị này)</FormLabel>
										<FormControl>
											<Input type="number" min={0} {...field} className="max-w-xs" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-2 gap-4">
								{(
									[
										["product_code_prefix", "product_code_pad", "Mã sản phẩm", "SP0001"],
										["production_order_code_prefix", "production_order_code_pad", "Lệnh sản xuất", "SX-000001"],
										["print_job_code_prefix", "print_job_code_pad", "Phiếu in", "PRINT-000001"],
										["stock_in_code_prefix", "stock_in_code_pad", "Nhập kho", "NK-000001"],
									] as const
								).map(([prefixKey, padKey, label, example]) => (
									<div key={prefixKey} className="col-span-2 border rounded-lg p-3 space-y-2">
										<div className="text-sm font-medium">{label}</div>
										<div className="flex gap-2 items-end">
											<FormField
												control={form.control}
												name={prefixKey}
												render={({ field }) => (
													<FormItem className="flex-1">
														<FormLabel className="text-xs">Tiền tố</FormLabel>
														<FormControl>
															<Input {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name={padKey}
												render={({ field }) => (
													<FormItem className="w-24">
														<FormLabel className="text-xs">Số chữ số</FormLabel>
														<FormControl>
															<Input type="number" min={1} {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
										<FormDescription className="text-xs">VD: {example}</FormDescription>
									</div>
								))}
							</div>

							<Button type="submit" disabled={isPending}>
								{isPending ? "Đang lưu..." : "Lưu thay đổi"}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
