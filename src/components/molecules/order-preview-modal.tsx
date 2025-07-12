import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Customer } from "@/models/customer.model";
import { CreateOrderRequest } from "@/interfaces/order.interface";
import { 
	OrderStatus, 
	FulfillmentStatus, 
	PaymentStatus,
	ProductionStatus 
} from "@/enums/order.enum";
import { Package, User, MapPin, CreditCard, Truck } from "lucide-react";

interface OrderPreviewModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	orderData: CreateOrderRequest;
	selectedCustomer: Customer | null;
	onConfirm: () => void;
	isLoading?: boolean;
	mode: "create" | "update";
}

export function OrderPreviewModal({
	open,
	onOpenChange,
	orderData,
	selectedCustomer,
	onConfirm,
	isLoading = false,
	mode,
}: OrderPreviewModalProps) {
	const { t } = useTranslation("order");
	
	console.log("OrderPreviewModal props:", { open, orderData, selectedCustomer, mode });

	const getStatusDisplay = (status: string, type: "order" | "fulfillment" | "payment") => {
		const statusKey = type === "order" ? "statuses" : 
			type === "fulfillment" ? "fulfillmentStatuses" : "paymentStatuses";
		return t(`${statusKey}.${status}`);
	};

	const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
		if (status === OrderStatus.CANCELLED) return "destructive";
		if (status === OrderStatus.COMPLETED || status === PaymentStatus.PAID) return "default";
		if (status === OrderStatus.NEW || status === FulfillmentStatus.PENDING) return "secondary";
		return "outline";
	};

	const calculateOrderTotal = () => {
		return orderData.order_items?.reduce((total, item) => {
			return total + (item.total_price || 0);
		}, 0) || 0;
	};

	const formatAddress = () => {
		const addressParts = [
			orderData.shipping_street_address,
			orderData.shipping_ward,
			orderData.shipping_district,
			orderData.shipping_state_province,
			orderData.shipping_country,
		].filter(Boolean);
		
		return addressParts.length > 0 ? addressParts.join(", ") : "Chưa có địa chỉ";
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Package className="h-5 w-5" />
						{mode === "create" ? t("previewOrder") : t("previewUpdate")}
					</DialogTitle>
					<DialogDescription>
						{mode === "create" ? t("previewOrderDescription") : t("previewUpdateDescription")}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Customer Information */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-lg">
								<User className="h-5 w-5" />
								{t("customerInformation")}
							</CardTitle>
						</CardHeader>
						<CardContent>
							{selectedCustomer ? (
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<span className="font-medium text-muted-foreground">
											{t("customerName")}:
										</span>{" "}
										<span className="font-medium">{selectedCustomer.name}</span>
									</div>
									<div>
										<span className="font-medium text-muted-foreground">
											{t("phoneNumber")}:
										</span>{" "}
										{selectedCustomer.phone_number}
									</div>
									<div>
										<span className="font-medium text-muted-foreground">
											Email:
										</span>{" "}
										{selectedCustomer.email || "N/A"}
									</div>
									<div>
										<span className="font-medium text-muted-foreground">
											{t("customerCode")}:
										</span>{" "}
										{selectedCustomer.customer_code || "N/A"}
									</div>
								</div>
							) : (
								<div className="text-muted-foreground">
									{t("noCustomerSelected")}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Order Status */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-lg">
								<CreditCard className="h-5 w-5" />
								{t("orderStatus")}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-3 gap-4">
								<div className="text-center">
									<div className="text-sm text-muted-foreground mb-1">
										{t("status")}
									</div>
									<Badge variant={getStatusVariant(orderData.status!)}>
										{getStatusDisplay(orderData.status!, "order")}
									</Badge>
								</div>
								<div className="text-center">
									<div className="text-sm text-muted-foreground mb-1">
										{t("fulfillmentStatus")}
									</div>
									<Badge variant={getStatusVariant(orderData.fulfillment_status!)}>
										{getStatusDisplay(orderData.fulfillment_status!, "fulfillment")}
									</Badge>
								</div>
								<div className="text-center">
									<div className="text-sm text-muted-foreground mb-1">
										{t("paymentStatus")}
									</div>
									<Badge variant={getStatusVariant(orderData.payment_status!)}>
										{getStatusDisplay(orderData.payment_status!, "payment")}
									</Badge>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Shipping Address */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-lg">
								<MapPin className="h-5 w-5" />
								{t("shippingAddress")}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div className="text-sm">
									<span className="font-medium text-muted-foreground">
										{t("address")}:
									</span>{" "}
									{formatAddress()}
								</div>
								{orderData.delivery_notes && (
									<div className="text-sm">
										<span className="font-medium text-muted-foreground">
											{t("deliveryNotes")}:
										</span>{" "}
										{orderData.delivery_notes}
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Order Items */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-lg">
								<Truck className="h-5 w-5" />
								{t("orderItems")} ({orderData.order_items?.length || 0} {t("items")})
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{orderData.order_items?.map((item, index) => (
									<div
										key={index}
										className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
									>
										<div className="flex-1">
											<div className="font-medium">
												{t("product")} #{index + 1}
											</div>
											<div className="text-sm text-muted-foreground">
												{t("quantity")}: {item.quantity} | {t("unitPrice")}: $
												{item.unit_price?.toFixed(2)}
											</div>
										</div>
										<div className="text-right">
											<div className="font-medium">
												${item.total_price?.toFixed(2)}
											</div>
										</div>
									</div>
								))}
								
								<Separator />
								
								<div className="flex items-center justify-between text-lg font-medium">
									<span>{t("orderTotal")}:</span>
									<span>${calculateOrderTotal().toFixed(2)}</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<DialogFooter className="gap-2">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isLoading}
					>
						{t("cancel")}
					</Button>
					<Button onClick={onConfirm} disabled={isLoading}>
						{isLoading ? t("processing") : (mode === "create" ? t("confirmCreate") : t("confirmUpdate"))}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}