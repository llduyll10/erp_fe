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
import { AutocompleteSearch } from "@/components/molecules/autocomplete-search";
import { OrderPreviewModal } from "@/components/molecules/order-preview-modal";
import { Plus, Trash2, ImageIcon } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { OrderVariant } from "@/models/order-variant.model";
import { useState, useMemo } from "react";
import { UserRoleEnum } from "@/enums/user.enums";
import { User } from "@/models/user.model";
import { useSalesRepresentativeQuery } from "@/services/user";
import { useUpdateOrder } from "@/services/order";
import { toast } from "sonner";
import { OptimizedImage } from "@/components/molecules/optimized-image";

interface OrderFormProps extends React.ComponentProps<"div"> {
	mode: FormMode;
}

export function OrderForm({ mode, ...props }: OrderFormProps) {
	const { t } = useTranslation("order");
	const [showPreviewModal, setShowPreviewModal] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	// State to store selected variants for display (includes image info)
	const [selectedVariants, setSelectedVariants] = useState<Record<number, OrderVariant>>({});
	const { mutate: updateOrder } = useUpdateOrder();
	const {
		form,
		onSubmit,
		orderDetail,
		selectedCustomer,
		selectedSalesRep,
		handleCustomerSelect,
		handleSalesRepSelect,
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

		// Store variant info for display (including image)
		setSelectedVariants(prev => ({
			...prev,
			[index]: variant
		}));
	};

	// Handle removing order item
	const handleRemoveItem = (index: number) => {
		remove(index);
		// Remove variant from selectedVariants state
		setSelectedVariants(prev => {
			const newState = { ...prev };
			delete newState[index];
			// Re-index remaining items
			const reindexed: Record<number, OrderVariant> = {};
			Object.entries(newState).forEach(([key, value]) => {
				const oldIndex = parseInt(key);
				if (oldIndex > index) {
					reindexed[oldIndex - 1] = value;
				} else {
					reindexed[oldIndex] = value;
				}
			});
			return reindexed;
		});
	};

	// Calculate order total
	const orderTotal = (() => {
		const orderItems = form.watch("order_items");
		if (!orderItems || !Array.isArray(orderItems)) return 0;
		
		return orderItems.reduce((total, item) => {
			const itemTotal = Number(item.total_price) || 0;
			return total + itemTotal;
		}, 0);
	})();

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
		const salesRepId = form.watch("sales_representative_id");
		const orderItems = form.watch("order_items") || [];

		// Must have customer
		if (!customerId || customerId.trim() === "") {
			return false;
		}

		// Must have sales representative
		if (!salesRepId || salesRepId.trim() === "") {
			return false;
		}

		// Must have at least one order item with variant_id
		const validItems = orderItems.filter(
			(item) =>
				item.variant_id && item.variant_id.trim() !== "" && item.quantity > 0
		);

		return validItems.length > 0;
	};

	// Watch status fields for changes
	const watchedStatus = form.watch("status");
	const watchedFulfillmentStatus = form.watch("fulfillment_status");
	const watchedPaymentStatus = form.watch("payment_status");

	// Watch delivery notes for changes too
	const watchedDeliveryNotes = form.watch("delivery_notes");

	// Check if status fields have changed (for detail mode updates)
	const hasStatusChanges = useMemo(() => {
		if (!orderDetail) {
			return false;
		}
		
		// Handle undefined/null values by providing defaults
		const currentStatus = watchedStatus || "";
		const currentFulfillmentStatus = watchedFulfillmentStatus || "";
		const currentPaymentStatus = watchedPaymentStatus || "";
		const currentDeliveryNotes = watchedDeliveryNotes || "";
		
		const originalStatus = orderDetail.status || "";
		const originalFulfillmentStatus = orderDetail.fulfillment_status || "";
		const originalPaymentStatus = orderDetail.payment_status || "";
		const originalDeliveryNotes = orderDetail.delivery_notes || "";
		
		const hasChanges = (
			currentStatus !== originalStatus ||
			currentFulfillmentStatus !== originalFulfillmentStatus ||
			currentPaymentStatus !== originalPaymentStatus ||
			currentDeliveryNotes !== originalDeliveryNotes
		);
		
		return hasChanges;
	}, [orderDetail, watchedStatus, watchedFulfillmentStatus, watchedPaymentStatus, watchedDeliveryNotes]);

	// Handle status update (for detail mode)
	const handleStatusUpdate = () => {
		if (!orderDetail?.id) return;

		const formData = form.getValues();
		// Submit status fields and delivery notes
		const statusOnlyData = {
			status: formData.status,
			fulfillment_status: formData.fulfillment_status,
			payment_status: formData.payment_status,
			delivery_notes: formData.delivery_notes,
		};

		setIsSubmitting(true);
		updateOrder(
			{
				id: orderDetail.id,
				data: statusOnlyData,
			},
			{
				onSuccess: () => {
					toast.success(t("updateSuccess"));
					setIsSubmitting(false);
				},
				onError: (error) => {
					console.error("Status update error:", error);
					toast.error(t("updateError"));
					setIsSubmitting(false);
				},
			}
		);
	};



	// Handle form submission - show preview modal
	const handleFormSubmit = (data: any) => {
		setShowPreviewModal(true);
	};

	// Handle button click - bypass validation for preview
	const handlePreviewClick = (e: React.MouseEvent) => {
		e.preventDefault();
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

	// Format date for display
	const formatDate = (dateString?: string | Date | null) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("vi-VN", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "Asia/Ho_Chi_Minh",
		}).format(date);
	};

	return (
		<div className={cn("flex flex-col gap-6")} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>
						{mode === FormMode.CREATE ? t("create") : t("update")}
					</CardTitle>
					<CardDescription>{t("createDescription")}</CardDescription>
					
					{/* Order Meta Information - Only show in detail mode */}
					{mode === FormMode.DETAILS && orderDetail && (
						<div className="mt-4 p-4 bg-muted/30 rounded-lg border">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
								<div>
									<span className="font-medium text-muted-foreground">Mã đơn hàng:</span>{" "}
									<span className="font-medium">{orderDetail.order_number}</span>
								</div>
								<div>
									<span className="font-medium text-muted-foreground">Ngày tạo:</span>{" "}
									{formatDate(orderDetail.created_at)}
								</div>
								<div>
									<span className="font-medium text-muted-foreground">Người tạo:</span>{" "}
									{orderDetail.created_by?.name || "N/A"} ({orderDetail.created_by?.email || "N/A"})
								</div>
								<div>
									<span className="font-medium text-muted-foreground">Cập nhật lần cuối:</span>{" "}
									{formatDate(orderDetail.updated_at)}
								</div>
								<div className="md:col-span-2">
									<span className="font-medium text-muted-foreground">Người cập nhật:</span>{" "}
									{orderDetail.updated_by?.name || "N/A"} ({orderDetail.updated_by?.email || "N/A"})
								</div>
							</div>
						</div>
					)}
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleFormSubmit)}
							className="space-y-6">
							{/* Customer Search */}
							<div className="space-y-4">
								<h3 className="text-lg font-medium">{t("customer")}</h3>
								<FormField
									control={form.control}
									name="customer_id"
									render={({ field }) => (
										<FormItem>
											<FormLabel required>{t("customer")}</FormLabel>
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

								{/* Sales Representative */}
								<FormField
									control={form.control}
									name="sales_representative_id"
									render={({ field }) => (
										<FormItem>
											<FormLabel required>{t("salesRepresentative")}</FormLabel>
											<FormControl>
												<AutocompleteSearch<User>
													useQuery={useSalesRepresentativeQuery}
													fieldConfig={{
														value: "id",
														label: "name",
														description: "email",
														subtitle: "role",
													}}
													value={field.value}
													onValueChange={handleSalesRepSelect}
													placeholder={t("salesRepPlaceholder")}
													searchPlaceholder={t("salesRepSearch")}
													emptyMessage={t("salesRepNotFound")}
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
													disabled={false}>
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
													disabled={false}>
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
													disabled={false}>
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
									disabled={mode === FormMode.DETAILS}
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
													placeholder="Ghi chú toàn bộ thông tin đơn hàng: trạng thái sản xuất, yêu cầu đặc biệt, thời gian giao hàng, điều kiện thanh toán, ghi chú từ khách hàng..."
													disabled={false}
													rows={4}
													className="resize-none"
												/>
											</FormControl>
											<div className="text-xs text-muted-foreground mt-1">
												💡 Gợi ý: Ghi chú chi tiết về yêu cầu khách hàng, tình trạng sản xuất, thời gian giao hàng, phương thức thanh toán và các lưu ý đặc biệt khác
											</div>
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
																<FormLabel required>{t("product")}</FormLabel>
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
																		excludedVariantIds={getExcludedVariantIds(
																			index
																		)}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>

												{/* Selected Product Image & Info */}
												{selectedVariants[index] && (
													<div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
														<OptimizedImage
															fileKey={selectedVariants[index].file_key}
															alt={selectedVariants[index].display_name}
															className="w-16 h-16 rounded-md object-cover"
															showLoading={false}
															fallbackComponent={
																<div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center">
																	<ImageIcon className="w-8 h-8 text-gray-400" />
																</div>
															}
														/>
														<div className="flex-1">
															<h4 className="font-medium text-sm">
																{selectedVariants[index].display_name}
															</h4>
															<div className="text-xs text-muted-foreground mt-1">
																<span>SKU: {selectedVariants[index].sku}</span>
																<span className="mx-2">•</span>
																<span>{selectedVariants[index].size}</span>
																<span className="mx-2">•</span>
																<span>{selectedVariants[index].color}</span>
																<span className="mx-2">•</span>
																<span>{selectedVariants[index].gender}</span>
															</div>
															<div className="text-xs text-muted-foreground">
																{selectedVariants[index].product_name}
															</div>
														</div>
														<div className="text-right">
															<div className="font-medium text-green-600">
																${selectedVariants[index].price.toFixed(2)}
															</div>
															{!selectedVariants[index].is_in_stock && (
																<div className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded mt-1">
																	Out of Stock
																</div>
															)}
														</div>
													</div>
												)}

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
													onClick={() => handleRemoveItem(index)}
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
												{t("orderTotal")}: ${(orderTotal || 0).toFixed(2)}
											</div>
											<div className="text-sm text-muted-foreground">
												{t("itemCount", { count: fields.length })}
											</div>
										</div>
									</div>
								)}
							</div>

							{/* Submit Button */}
							{mode === FormMode.DETAILS ? (
								<div className="flex flex-col items-end gap-2">
									{hasStatusChanges && (
										<div className="text-sm text-muted-foreground text-right">
											{t("statusChangesDetected")}
										</div>
									)}
									<div className="flex gap-4">
										<Button
											type="button"
											onClick={handleStatusUpdate}
											disabled={!hasStatusChanges || isSubmitting}
											className={
												!hasStatusChanges ? "opacity-50 cursor-not-allowed" : ""
											}>
											{isSubmitting ? t("updating") : t("updateStatus")}
										</Button>
									</div>
								</div>
							) : (
								<div className="flex flex-col items-end gap-2">
									{!isFormValid() && (
										<div className="text-sm text-muted-foreground text-right">
											{!form.watch("customer_id") && t("pleaseSelectCustomer")}
											{form.watch("customer_id") &&
												!form.watch("sales_representative_id") &&
												t("pleaseSelectSalesRep")}
											{form.watch("customer_id") &&
												form.watch("sales_representative_id") &&
												(!form.watch("order_items") ||
													form
														.watch("order_items")
														.filter(
															(item) =>
																item.variant_id &&
																item.variant_id.trim() !== "" &&
																item.quantity > 0
														).length === 0) &&
												t("pleaseAddProduct")}
										</div>
									)}
									<div className="flex gap-4">
										<Button
											type="button"
											onClick={handlePreviewClick}
											disabled={!isFormValid()}
											className={
												!isFormValid() ? "opacity-50 cursor-not-allowed" : ""
											}>
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
			<OrderPreviewModal
				open={showPreviewModal}
				onOpenChange={setShowPreviewModal}
				orderData={form.getValues()}
				selectedCustomer={selectedCustomer}
				selectedSalesRep={selectedSalesRep}
				onConfirm={handleConfirmSubmit}
				isLoading={isSubmitting}
				mode={mode === FormMode.CREATE ? "create" : "update"}
			/>
		</div>
	);
}
