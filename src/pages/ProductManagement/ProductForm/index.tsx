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

export function ProductForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const { t } = useTranslation();
	const { form, onSubmit, isPending } = useProductForm();

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
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>{t("products.create")}</CardTitle>
					<CardDescription>
						Create a new product with basic information
					</CardDescription>
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
												<FormLabel>{t("products.name")} *</FormLabel>
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
													<FormLabel>{t("products.category")} *</FormLabel>
													<FormControl>
														<AutocompleteSearch<Category>
															useQuery={useQuery}
															fieldConfig={fieldConfig}
															value={field.value}
															onValueChange={field.onChange}
															placeholder={t("products.selectCategory")}
															searchPlaceholder="Search categories..."
															emptyMessage={t("products.noCategoryFound")}
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
												<FormLabel>{t("products.itemType")} *</FormLabel>
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

								{/* Image Upload */}
								<div className="grid gap-3">
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

								{/* Submit Button */}
								<div className="flex flex-col gap-3">
									<Button type="submit" className="w-full" disabled={isPending}>
										{isPending ? t("common.loading") : t("common.create")}
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
