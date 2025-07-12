import {
	OrderStatus,
	FulfillmentStatus,
	PaymentStatus,
	ProductionStatus,
} from "@/enums/order.enum";

export const ORDER_STATUS_OPTIONS = Object.values(OrderStatus).map(
	(status) => ({
		value: status,
		label: status,
	})
);

export const FULFILLMENT_STATUS_OPTIONS = Object.values(FulfillmentStatus).map(
	(status) => ({
		value: status,
		label: status,
	})
);

export const PAYMENT_STATUS_OPTIONS = Object.values(PaymentStatus).map(
	(status) => ({
		value: status,
		label: status,
	})
);

export const PRODUCTION_STATUS_OPTIONS = Object.values(ProductionStatus).map(
	(status) => ({
		value: status,
		label: status,
	})
);
