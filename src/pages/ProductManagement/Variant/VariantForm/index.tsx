import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { FileUploadPurpose } from "@/enums/file.enum";
import { NumberInput } from "@/components/ui/number-input";
import { FormMode } from "@/constants/common.constant";
import { useVariantForm } from "@/hooks/product/useVariantForm";
import { PRODUCT_SIZE_OPTIONS } from "@/constants/product.constant";

interface VariantFormProps extends React.ComponentProps<"div"> {
	mode: FormMode;
	onSuccess?: () => void;
}

export function VariantForm({ mode, onSuccess, ...props }: VariantFormProps) {
	const { t } = useTranslation("product");
	const { form, onSubmit, isPending } = useVariantForm(onSuccess);

	return (
		<div className={cn("flex flex-col gap-4")} {...props}>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className="flex flex-col gap-4">
						{/* Size */}
						<FormField
							control={form.control}
							name="size"
							render={({ field }) => (
								<FormItem>
									<FormLabel required>Size</FormLabel>
									<Select onValueChange={field.onChange} value={field.value?.toString()}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Chọn size" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{PRODUCT_SIZE_OPTIONS.map((s) => (
												<SelectItem key={s.value} value={s.value}>
													{s.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Price & Cost */}
						<div className="grid grid-cols-2 gap-3">
							<FormField
								control={form.control}
								name="price"
								render={({ field }) => (
									<FormItem>
										<FormLabel required>Giá bán (VNĐ)</FormLabel>
										<FormControl>
											<NumberInput {...field} placeholder="0" min={0} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="cost"
								render={({ field }) => (
									<FormItem>
										<FormLabel required>Giá vốn (VNĐ)</FormLabel>
										<FormControl>
											<NumberInput {...field} placeholder="0" min={0} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Quantity */}
						<FormField
							control={form.control}
							name="quantity"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Số lượng ban đầu</FormLabel>
									<FormControl>
										<NumberInput {...field} placeholder="0" min={0} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Image */}
						<FormField
							control={form.control}
							name="file_key"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Ảnh biến thể</FormLabel>
									<FormControl>
										<ImageUpload
											purpose={FileUploadPurpose.PRODUCT_IMAGE}
											value={field.value}
											onUploadComplete={(result) => field.onChange(result.fileKey)}
											placeholder="Click để tải ảnh lên"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button type="submit" className="w-full" disabled={isPending}>
							{isPending ? "Đang tạo..." : "Tạo biến thể"}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
