import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductSearchCombobox } from "@/components/molecules/product-search-combobox";
import { useStockInForm } from "@/hooks/warehouse/useStockOperations";
import { STOCK_IN_REASON_OPTIONS } from "@/constants/warehouse.constant";
import { StockMovementReason } from "@/enums/warehouse.enum";
import { ArrowLeft, Package, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function StockInPage() {
	const navigate = useNavigate();
	const { form, onSubmit, isSubmitting } = useStockInForm();
	const [selectedVariant, setSelectedVariant] = useState<any>(null);

	const handleVariantSelect = (variantId: string, variant: any) => {
		setSelectedVariant(variant);
		form.setValue("variant_id", variantId);
	};

	const inReasons = STOCK_IN_REASON_OPTIONS;

	return (
		<div className="flex flex-col gap-6 p-8">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="sm" onClick={() => navigate(-1)}>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Quay lại
				</Button>
				<div className="flex items-center gap-2">
					<Package className="h-6 w-6 text-green-600" />
					<h1 className="text-2xl font-bold">Nhập kho</h1>
				</div>
			</div>

			<div className="max-w-2xl">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Plus className="h-5 w-5 text-green-600" />
							Thông tin nhập kho
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form onSubmit={onSubmit} className="space-y-6">
								{/* Product Selection */}
								<FormField
									control={form.control}
									name="variant_id"
									render={({ field }) => (
										<FormItem>
											<FormLabel required>Sản phẩm</FormLabel>
											<FormControl>
												<ProductSearchCombobox
													value={selectedVariant?.id}
													onValueChange={handleVariantSelect}
													placeholder="Chọn sản phẩm cần nhập kho..."
													className="w-full"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Selected Product Info */}
								{selectedVariant && (
									<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
										<div className="flex items-center gap-3">
											{selectedVariant.file_key && (
												<img
													src={`/api/files/${selectedVariant.file_key}`}
													alt={selectedVariant.display_name}
													className="w-12 h-12 rounded object-cover"
												/>
											)}
											<div className="flex-1">
												<h4 className="font-medium text-green-900">
													{selectedVariant.product?.name}
												</h4>
												<p className="text-sm text-green-700">
													{selectedVariant.sku} • {selectedVariant.size} • {selectedVariant.color}
												</p>
												<p className="text-xs text-green-600">
													Tồn kho hiện tại: {selectedVariant.quantity?.toLocaleString() || 0}
												</p>
											</div>
										</div>
									</div>
								)}

								{/* Quantity */}
								<FormField
									control={form.control}
									name="quantity"
									render={({ field }) => (
										<FormItem>
											<FormLabel required>Số lượng nhập</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="Nhập số lượng..."
													min="0.01"
													step="0.01"
													{...field}
													onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Reason Type */}
								<FormField
									control={form.control}
									name="reason_type"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Lý do nhập kho</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Chọn lý do nhập kho" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{inReasons.map((reason: { value: string; label: string }) => (
														<SelectItem key={reason.value} value={reason.value}>
															{reason.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Reason Notes */}
								<FormField
									control={form.control}
									name="reason"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Ghi chú</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Nhập ghi chú thêm (tùy chọn)..."
													className="resize-none"
													rows={3}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Submit Button */}
								<div className="flex justify-end gap-3 pt-4">
									<Button
										type="button"
										variant="outline"
										onClick={() => navigate(-1)}
										disabled={isSubmitting}
									>
										Hủy
									</Button>
									<Button
										type="submit"
										disabled={isSubmitting || !selectedVariant}
										className="bg-green-600 hover:bg-green-700"
									>
										{isSubmitting ? "Đang xử lý..." : "Nhập kho"}
									</Button>
								</div>
							</form>
						</Form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}