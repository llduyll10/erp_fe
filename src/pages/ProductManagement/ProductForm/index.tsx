import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { useProductForm } from "@/hooks/product/useProductForm";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { ProductItemType } from "@/enums/product.enum";
import { FileUploadPurpose } from "@/enums/file.enum";
import { AutocompleteSearch } from "@/components/molecules/autocomplete-search";
import { useGetListCategory } from "@/services/category";
import { Category } from "@/models/category.model";
import {
	useAutocompleteSearch,
	useCategoryAutocomplete,
} from "@/hooks/common/useAutocompleteSearch";
import { FormMode } from "@/constants/common.constant";
import { OptimizedImage } from "@/components/molecules/optimized-image";
import { ImageIcon } from "lucide-react";

interface ProductFormProps extends React.ComponentProps<"div"> {
	mode: FormMode;
}

export function ProductForm({ mode, ...props }: ProductFormProps) {
	const { t } = useTranslation();
	const { form, onSubmit, isPending, productDetail } = useProductForm();

	const itemTypeOptions = [
		{ value: ProductItemType.CLOTHING, label: "Clothing" },
		{ value: ProductItemType.PANTS, label: "Pants" },
		{ value: ProductItemType.SET, label: "Set" },
		{ value: ProductItemType.SHOES, label: "Shoes" },
		{ value: ProductItemType.ACCESSORIES, label: "Accessories" },
		{ value: ProductItemType.OFFICE_SUPPLIES, label: "Office Supplies" },
		{ value: ProductItemType.OTHER, label: "Other" },
	];

	return (
		<div className={cn("flex flex-col gap-6")} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>
						{mode === FormMode.CREATE ?
							t("products.create")
						:	t("products.update")}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)}>
							<div className="flex flex-col gap-6">
								{/* Product Name */}
								<div className="grid gap-3">
									<FormField
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem>
												<FormLabel required>{t("products.name")}</FormLabel>
												<FormControl>
													<Input
														{...field}
														placeholder="Enter product name"
														required
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{/* Description */}
								<div className="grid gap-3">
									<FormField
										control={form.control}
										name="description"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("products.description")}</FormLabel>
												<FormControl>
													<Textarea
														{...field}
														placeholder="Enter product description"
														rows={4}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{/* Category */}
								<div className="grid gap-3">
									<FormField
										control={form.control}
										name="category_id"
										render={({ field }) => {
											const { fieldConfig } = useCategoryAutocomplete();
											const { useQuery } = useAutocompleteSearch(
												useGetListCategory,
												fieldConfig
											);

											return (
												<FormItem>
													<FormLabel required>{t("products.category")}</FormLabel>
													<FormControl>
														<AutocompleteSearch<Category>
															useQuery={useQuery}
															fieldConfig={fieldConfig}
															value={field.value}
															onValueChange={field.onChange}
															placeholder={t("products.selectCategory")}
															searchPlaceholder="Search categories..."
															emptyMessage={t("products.noCategoryFound")}
															disabled={mode === FormMode.DETAILS}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											);
										}}
									/>
								</div>

								{/* Item Type */}
								<div className="grid gap-3">
									<FormField
										control={form.control}
										name="item_type"
										render={({ field }) => (
											<FormItem>
												<FormLabel required>{t("products.itemType")}</FormLabel>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue
																placeholder={t("products.selectItemType")}
															/>
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{itemTypeOptions.map((option) => (
															<SelectItem
																key={option.value}
																value={option.value}>
																{option.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="flex gap-3">
									{/* Show image in Detail mode */}
									{mode === FormMode.DETAILS && (
										<div className="grid gap-3">
											<OptimizedImage
												fileKey={productDetail?.file_key}
												alt="Product Image"
												className="w-[300px] h-[300px] rounded-md"
												showLoading={false} // Don't show skeleton in table for better performance
												fallbackComponent={
													<div className="w-[300px] h-[300px] rounded-md bg-gray-100 flex items-center justify-center">
														<ImageIcon className="w-6 h-6 text-gray-400" />
													</div>
												}
											/>
										</div>
									)}

									{/* Image Upload */}
									<div className="grid gap-3 w-full">
										<FormField
											control={form.control}
											name="file_key"
											render={({ field }) => (
												<FormItem>
													<FormLabel>{t("products.imageUrl")}</FormLabel>
													<FormControl>
														<ImageUpload
															purpose={FileUploadPurpose.PRODUCT_IMAGE}
															value={field.value}
															onUploadComplete={(result) => {
																field.onChange(result.fileKey);
															}}
															placeholder="Click to upload product image"
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>

								{/* Submit Button */}
								<div className="flex flex-col justify-center items-center gap-3">
									<Button type="submit" className="w-fit" disabled={isPending}>
										{mode === FormMode.CREATE ?
											t("products.create")
										:	t("products.update")}
									</Button>
								</div>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
