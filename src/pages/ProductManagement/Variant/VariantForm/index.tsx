import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
import {
	PRODUCT_COLOR_OPTIONS,
	PRODUCT_GENDER_OPTIONS,
	PRODUCT_SIZE_OPTIONS,
} from "@/constants/product.constant";

interface VariantFormProps extends React.ComponentProps<"div"> {
	mode: FormMode;
	onSuccess?: () => void;
}

export function VariantForm({ mode, onSuccess, ...props }: VariantFormProps) {
	const { t } = useTranslation("product");
	const { form, onSubmit, isPending } = useVariantForm(onSuccess);

	return (
		<div className={cn("flex flex-col gap-6")} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>{t("variant.create")}</CardTitle>
					<CardDescription className="text-red-500">
						{t("variant.importantNote")}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)}>
							<div className="flex flex-col gap-6">
								<div className="flex gap-3">
									{/* Size */}
									<div className="grid gap-3">
										<FormField
											control={form.control}
											name="size"
											render={({ field }) => (
												<FormItem>
													<FormLabel>{t("variant.size")}</FormLabel>
													<FormControl>
														<Select
															onValueChange={field.onChange}
															value={field.value?.toString()}>
															<FormControl>
																<SelectTrigger>
																	<SelectValue
																		placeholder={t(
																			"product.variant.selectSize"
																		)}
																	/>
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{PRODUCT_SIZE_OPTIONS.map((size) => (
																	<SelectItem
																		key={size.value}
																		value={size.value}>
																		{size.label}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									{/* Color */}
									<div className="grid gap-3">
										<FormField
											control={form.control}
											name="color"
											render={({ field }) => (
												<FormItem>
													<FormLabel>{t("variant.color")}</FormLabel>
													<FormControl>
														<Select
															onValueChange={field.onChange}
															value={field.value?.toString()}>
															<FormControl>
																<SelectTrigger>
																	<SelectValue
																		placeholder={t(
																			"product.variant.selectColor"
																		)}
																	/>
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{PRODUCT_COLOR_OPTIONS.map((color) => (
																	<SelectItem
																		key={color.value}
																		value={color.value}>
																		{color.label}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									{/* Gender */}
									<div className="grid gap-3">
										<FormField
											control={form.control}
											name="gender"
											render={({ field }) => (
												<FormItem>
													<FormLabel>{t("variant.gender")}</FormLabel>
													<FormControl>
														<Select
															onValueChange={field.onChange}
															value={field.value?.toString()}>
															<FormControl>
																<SelectTrigger>
																	<SelectValue
																		placeholder={t(
																			"product.variant.selectGender"
																		)}
																	/>
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{PRODUCT_GENDER_OPTIONS.map((gender) => (
																	<SelectItem
																		key={gender.value}
																		value={gender.value}>
																		{gender.label}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>

								{/* Price */}
								<div className="grid gap-3">
									<FormField
										control={form.control}
										name="price"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("variant.price")} *</FormLabel>
												<FormControl>
													<NumberInput
														{...field}
														placeholder={t("variant.enterPrice")}
														min={0}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{/* Cost */}
								<div className="grid gap-3">
									<FormField
										control={form.control}
										name="cost"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("variant.cost")} *</FormLabel>
												<FormControl>
													<NumberInput
														{...field}
														placeholder={t("variant.enterCost")}
														min={0}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{/* Quantity */}
								<div className="grid gap-3">
									<FormField
										control={form.control}
										name="quantity"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("variant.quantity")}</FormLabel>
												<FormControl>
													<NumberInput
														{...field}
														placeholder={t("variant.enterQuantity")}
														min={0}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="flex gap-3">
									{/* Image Upload */}
									<div className="grid gap-3 w-full">
										<FormField
											control={form.control}
											name="file_key"
											render={({ field }) => (
												<FormItem>
													<FormLabel>{t("variant.imageUrl")}</FormLabel>
													<FormControl>
														<ImageUpload
															purpose={FileUploadPurpose.PRODUCT_IMAGE}
															value={field.value}
															onUploadComplete={(result) => {
																console.log(result);
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
								<div className="flex flex-col gap-3">
									<Button type="submit" className="w-full" disabled={isPending}>
										{isPending ? t("variant.loading") : t("variant.submit")}
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
