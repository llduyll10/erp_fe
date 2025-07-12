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
import { User as UserModel } from "@/models/user.model";
import { CreateOrderRequest } from "@/interfaces/order.interface";
import { 
	OrderStatus, 
	FulfillmentStatus, 
	PaymentStatus,
	ProductionStatus 
} from "@/enums/order.enum";
import { ProductUnit } from "@/enums/product.enum";
import { Package, User, MapPin, CreditCard, Truck } from "lucide-react";
import { useGetUserList } from "@/services/user";
import { UserRoleEnum } from "@/enums/user.enums";
import { useMemo } from "react";

interface OrderPreviewModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	orderData: CreateOrderRequest;
	selectedCustomer: Customer | null;
	selectedSalesRep?: UserModel | null;
	onConfirm: () => void;
	isLoading?: boolean;
	mode: "create" | "update";
}

export function OrderPreviewModal({
	open,
	onOpenChange,
	orderData,
	selectedCustomer,
	selectedSalesRep,
	onConfirm,
	isLoading = false,
	mode,
}: OrderPreviewModalProps) {
	const { t } = useTranslation("order");
	
	// Get sales representative data if we have sales_representative_id
	const { data: userListData } = useGetUserList(
		{ limit: 100, page: 1 }, // Get all users to find the selected one
		!!orderData.sales_representative_id
	);
	
	// Find the selected sales representative from user list
	const actualSelectedSalesRep = useMemo(() => {
		if (!orderData.sales_representative_id || !userListData?.data) return null;
		
		return userListData.data.find(
			(user: UserModel) => user.id === orderData.sales_representative_id
		) || null;
	}, [orderData.sales_representative_id, userListData]);
	

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
			return total + (Number(item.total_price) || 0);
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
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scroll-smooth">
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
					{/* Customer & Sales Information */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
									<div className="space-y-2 text-sm">
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

						{/* Sales Representative Information */}
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 text-lg">
									<User className="h-5 w-5" />
									{t("salesRepresentative")}
								</CardTitle>
							</CardHeader>
							<CardContent>
								{actualSelectedSalesRep ? (
									<div className="space-y-2 text-sm">
										<div>
											<span className="font-medium text-muted-foreground">
												Name:
											</span>{" "}
											<span className="font-medium">{actualSelectedSalesRep.name}</span>
										</div>
										<div>
											<span className="font-medium text-muted-foreground">
												Email:
											</span>{" "}
											{actualSelectedSalesRep.email}
										</div>
										<div>
											<span className="font-medium text-muted-foreground">
												Role:
											</span>{" "}
											{actualSelectedSalesRep.role === UserRoleEnum.SALE_ADMIN ? "Sales Admin" : "Sales Member"}
										</div>
									</div>
								) : (
									<div className="text-muted-foreground">
										No sales representative selected
									</div>
								)}
							</CardContent>
						</Card>
					</div>

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
												{t("quantity")}: {item.quantity} 
												{item.unit && (
													<span> ({item.unit === ProductUnit.PIECE ? "Cái" : 
															item.unit === ProductUnit.SET ? "Bộ" : 
															item.unit === ProductUnit.PAIR ? "Đôi" : item.unit})</span>
												)} 
												| {t("unitPrice")}: $
												{(Number(item.unit_price) || 0).toFixed(2)}
											</div>
										</div>
										<div className="text-right">
											<div className="font-medium">
												${(Number(item.total_price) || 0).toFixed(2)}
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