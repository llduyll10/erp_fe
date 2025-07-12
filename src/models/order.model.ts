import type { User } from "./user.model";
import type { Customer } from "./customer.model";
import type { Product } from "./product.model";
import type { ProductVariant } from "./product-variant.model";
import {
	OrderStatus,
	FulfillmentStatus,
	PaymentStatus,
	ProductionStatus,
} from "@/enums/order.enum";

type Order = {
	id?: string | null;
	company_id?: string | null;
	customer_id?: string | null;
	sales_representative_id?: string | null;
	created_by_id?: string | null;
	updated_by_id?: string | null;
	order_number?: string | null;
	status?: OrderStatus | null;
	fulfillment_status?: FulfillmentStatus | null;
	payment_status?: PaymentStatus | null;

	// Shipping Address (Optional)
	shipping_street_address?: string | null;
	shipping_country?: string | null;
	shipping_state_province?: string | null;
	shipping_district?: string | null;
	shipping_ward?: string | null;
	shipping_postal_code?: string | null;
	shipping_city?: string | null;
	delivery_notes?: string | null;

	created_at?: Date | null;
	updated_at?: Date | null;
	deleted_at?: Date | null;

	// Relations
	customer?: Customer | null;
	sales_representative?: User | null;
	order_items?: OrderItem[] | null;
	created_by?: User | null;
	updated_by?: User | null;
};

type OrderItem = {
	id?: string | null;
	order_id?: string | null;
	product_id?: string | null;
	variant_id?: string | null;
	custom_product_id?: string | null;
	quantity?: number | null;
	unit_price?: number | null;
	total_price?: number | null;
	production_status?: ProductionStatus | null;

	// Relations
	order?: Order | null;
	product?: Product | null;
	variant?: ProductVariant | null;
	// custom_product?: CustomProduct | null; // Will be added when custom product module is implemented
};

export type { Order, OrderItem };
