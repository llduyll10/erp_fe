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
import { FormMode } from "@/constants/common.constant";
import { useOrderForm } from "@/hooks/order/useOrderForm";
import {
	OrderStatus,
	FulfillmentStatus,
	PaymentStatus,
	ProductionStatus,
} from "@/enums/order.enum";
import { AddressForm } from "@/components/molecules/address-form";
import { CustomerSearchCombobox } from "@/components/molecules/customer-search-combobox";
import { ProductSearchCombobox } from "@/components/molecules/product-search-combobox";
import { OrderPreviewModal } from "@/components/molecules/order-preview-modal";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { OrderVariant } from "@/models/order-variant.model";
import { useState } from "react";

interface OrderFormProps extends React.ComponentProps<"div"> {
	mode: FormMode;
}

export function OrderForm({ mode, ...props }: OrderFormProps) {
	const { t } = useTranslation("order");
	const [showPreviewModal, setShowPreviewModal] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const {
		form,
		onSubmit,
		orderDetail,
		selectedCustomer,
		handleCustomerSelect,
		handleCreateNewCustomer,
	} = useOrderForm();

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "order_items",
	});

	// Add new order item
	const addOrderItem = () => {
		append({
			product_id: "",
			variant_id: "",
			custom_product_id: "",
			quantity: 1,
			unit_price: 0,
			total_price: 0,
			production_status: ProductionStatus.PENDING,
		});
	};

	// Calculate total for an item when quantity or unit price changes
	const calculateItemTotal = (index: number) => {
		const quantity = form.watch(`order_items.${index}.quantity`);
		const unitPrice = form.watch(`order_items.${index}.unit_price`);
		const totalPrice = (quantity || 0) * (unitPrice || 0);
		form.setValue(`order_items.${index}.total_price`, totalPrice);
	};

	// Handle variant selection (new API structure)
	const handleVariantSelect = (
		index: number,
		variantId: string,
		variant: OrderVariant
	) => {
		// Set variant ID (product_id is included in variant data)
		form.setValue(`order_items.${index}.variant_id`, variantId);
		form.setValue(`order_items.${index}.custom_product_id`, "");

		// Auto-populate price from variant
		if (variant.price) {
			form.setValue(`order_items.${index}.unit_price`, variant.price);
			calculateItemTotal(index);
		}
	};

	// Calculate order total
	const orderTotal =
		form.watch("order_items")?.reduce((total, item) => {
			return total + (item.total_price || 0);
		}, 0) || 0;

	// Get list of already selected variant IDs to exclude from search
	const getExcludedVariantIds = (currentIndex: number): string[] => {
		const orderItems = form.watch("order_items") || [];
		return orderItems
			.map((item, index) => {
				// Exclude current index to allow changing the current selection
				if (index === currentIndex) return null;
				return item.variant_id;
			})
			.filter((variantId): variantId is string => Boolean(variantId));
	};

	// Check if form is ready for submission
	const isFormValid = () => {
		const customerId = form.watch("customer_id");
		const orderItems = form.watch("order_items") || [];
		
		// Must have customer
		if (!customerId || customerId.trim() === "") {
			return false;
		}
		
		// Must have at least one order item with variant_id
		const validItems = orderItems.filter((item) => 
			item.variant_id && item.variant_id.trim() !== "" && item.quantity > 0
		);
		
		return validItems.length > 0;
	};

	// Handle form submission - show preview modal
	const handleFormSubmit = (data: any) => {
		console.log("Form submitted, showing modal", data);
		setShowPreviewModal(true);
	};

	// Handle button click - bypass validation for preview
	const handlePreviewClick = (e: React.MouseEvent) => {
		e.preventDefault();
		console.log("Preview button clicked");
		setShowPreviewModal(true);
	};

	// Handle final confirmation from modal
	const handleConfirmSubmit = async () => {
		setIsSubmitting(true);
		try {
			const formData = form.getValues();
			await onSubmit(formData);
			setShowPreviewModal(false);
		} catch (error) {
			console.error("Submit error:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-6")} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>
						{mode === FormMode.CREATE ? t("create") : t("update")}
					</CardTitle>
					<CardDescription>{t("createDescription")}</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
							{/* Customer Search */}
							<div className="space-y-4">
								<h3 className="text-lg font-medium">{t("customer")}</h3>
								<FormField
									control={form.control}
									name="customer_id"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("customer")} *</FormLabel>
											<FormControl>
												<CustomerSearchCombobox
													value={field.value}
													onValueChange={(customerId, customer) => {
														field.onChange(customerId);
														handleCustomerSelect(customer);
													}}
													onCreateNew={handleCreateNewCustomer}
													placeholder={t("customerPlaceholder")}
													disabled={mode === FormMode.DETAILS}
													className="w-[50%]"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Display selected customer info */}
								{selectedCustomer && (
									<div className="p-4 bg-muted/50 rounded-lg">
										<h4 className="font-medium mb-2">Customer Information</h4>
										<div className="grid grid-cols-2 gap-4 text-sm">
											<div>
												<span className="text-muted-foreground">Name:</span>{" "}
												{selectedCustomer.name}
											</div>
											<div>
												<span className="text-muted-foreground">Phone:</span>{" "}
												{selectedCustomer.phone_number}
											</div>
											<div>
												<span className="text-muted-foreground">Email:</span>{" "}
												{selectedCustomer.email || "N/A"}
											</div>
											<div>
												<span className="text-muted-foreground">Code:</span>{" "}
												{selectedCustomer.customer_code || "N/A"}
											</div>
										</div>
									</div>
								)}
							</div>

							{/* Order Status Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-medium">Order Status</h3>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									{/* Order Status */}
									<FormField
										control={form.control}
										name="status"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("status")}</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}
													disabled={mode === FormMode.DETAILS}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder={t("selectStatus")} />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{Object.values(OrderStatus).map((status) => (
															<SelectItem key={status} value={status}>
																{t(`statuses.${status}`)}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Fulfillment Status */}
									<FormField
										control={form.control}
										name="fulfillment_status"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("fulfillmentStatus")}</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}
													disabled={mode === FormMode.DETAILS}>
													<FormControl>
														<SelectTrigger>
															<SelectValue
																placeholder={t("selectFulfillmentStatus")}
															/>
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{Object.values(FulfillmentStatus).map((status) => (
															<SelectItem key={status} value={status}>
																{t(`fulfillmentStatuses.${status}`)}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Payment Status */}
									<FormField
										control={form.control}
										name="payment_status"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("paymentStatus")}</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}
													disabled={mode === FormMode.DETAILS}>
													<FormControl>
														<SelectTrigger>
															<SelectValue
																placeholder={t("selectPaymentStatus")}
															/>
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{Object.values(PaymentStatus).map((status) => (
															<SelectItem key={status} value={status}>
																{t(`paymentStatuses.${status}`)}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>

							{/* Shipping Address */}
							<div className="space-y-4">
								<AddressForm
									control={form.control}
									prefix="shipping"
									titleKey="shippingAddress"
								/>

								{/* Delivery Notes */}
								<FormField
									control={form.control}
									name="delivery_notes"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("deliveryNotes")}</FormLabel>
											<FormControl>
												<Textarea
													{...field}
													placeholder={t("deliveryNotesPlaceholder")}
													disabled={mode === FormMode.DETAILS}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Order Items */}
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="text-lg font-medium">{t("orderItems")}</h3>
									{mode !== FormMode.DETAILS && (
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={addOrderItem}
											className="gap-2">
											<Plus className="h-4 w-4" />
											{t("addItem")}
										</Button>
									)}
								</div>

								{fields.length === 0 && (
									<div className="text-center py-8 text-muted-foreground">
										No items added yet. Click "Add Item" to start.
									</div>
								)}

								{fields.map((field, index) => (
									<Card key={field.id} className="p-4">
										<div className="flex items-start gap-4">
											<div className="flex-1 space-y-4">
												{/* Product/Variant Search */}
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<FormField
														control={form.control}
														name={`order_items.${index}.variant_id`}
														render={({ field }) => (
															<FormItem className="md:col-span-2">
																<FormLabel>{t("product")} *</FormLabel>
																<FormControl>
																	<ProductSearchCombobox
																		value={field.value}
																		onValueChange={(variantId, variant) =>
																			handleVariantSelect(
																				index,
																				variantId,
																				variant
																			)
																		}
																		placeholder={t("productPlaceholder")}
																		disabled={mode === FormMode.DETAILS}
																		excludedVariantIds={getExcludedVariantIds(index)}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>

												{/* Quantity, Price, Total */}
												<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
													{/* Quantity */}
													<FormField
														control={form.control}
														name={`order_items.${index}.quantity`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>{t("quantity")}</FormLabel>
																<FormControl>
																	<Input
																		{...field}
																		type="number"
																		min={1}
																		onChange={(e) => {
																			field.onChange(Number(e.target.value));
																			calculateItemTotal(index);
																		}}
																		disabled={mode === FormMode.DETAILS}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													{/* Unit Price */}
													<FormField
														control={form.control}
														name={`order_items.${index}.unit_price`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>{t("unitPrice")}</FormLabel>
																<FormControl>
																	<Input
																		{...field}
																		type="number"
																		min={0}
																		step={0.01}
																		onChange={(e) => {
																			field.onChange(Number(e.target.value));
																			calculateItemTotal(index);
																		}}
																		disabled={mode === FormMode.DETAILS}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													{/* Total Price */}
													<FormField
														control={form.control}
														name={`order_items.${index}.total_price`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>{t("totalPrice")}</FormLabel>
																<FormControl>
																	<Input
																		{...field}
																		type="number"
																		readOnly
																		className="bg-muted"
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
											</div>

											{mode !== FormMode.DETAILS && (
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => remove(index)}
													className="text-red-600 hover:text-red-700">
													<Trash2 className="h-4 w-4" />
												</Button>
											)}
										</div>
									</Card>
								))}

								{/* Order Total */}
								{fields.length > 0 && (
									<div className="flex justify-end">
										<div className="text-right">
											<div className="text-lg font-medium">
												{t("orderTotal")}: ${orderTotal.toFixed(2)}
											</div>
											<div className="text-sm text-muted-foreground">
												{t("itemCount", { count: fields.length })}
											</div>
										</div>
									</div>
								)}
							</div>

							{/* Submit Button */}
							{mode !== FormMode.DETAILS && (
								<div className="flex flex-col items-end gap-2">
									{!isFormValid() && (
										<div className="text-sm text-muted-foreground text-right">
											{!form.watch("customer_id") && t("pleaseSelectCustomer")}
											{form.watch("customer_id") && (!form.watch("order_items") || form.watch("order_items").filter(item => item.variant_id && item.variant_id.trim() !== "" && item.quantity > 0).length === 0) && t("pleaseAddProduct")}
										</div>
									)}
									<div className="flex gap-4">
										<Button 
											type="button"
											onClick={handlePreviewClick}
											disabled={!isFormValid()}
											className={!isFormValid() ? "opacity-50 cursor-not-allowed" : ""}
										>
											{mode === FormMode.CREATE ? t("create") : t("update")}
										</Button>
									</div>
								</div>
							)}
						</form>
					</Form>
				</CardContent>
			</Card>

			{/* Order Preview Modal */}
			{console.log("Modal state:", { showPreviewModal, selectedCustomer, formData: form.getValues() })}
			<OrderPreviewModal
				open={showPreviewModal}
				onOpenChange={setShowPreviewModal}
				orderData={form.getValues()}
				selectedCustomer={selectedCustomer}
				onConfirm={handleConfirmSubmit}
				isLoading={isSubmitting}
				mode={mode === FormMode.CREATE ? "create" : "update"}
			/>
		</div>
	);
}
