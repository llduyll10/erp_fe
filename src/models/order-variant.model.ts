// Enhanced product variant model for order creation
// This includes product info, category info, and stock status
export interface OrderVariant {
	id: string;
	product_id: string;
	sku: string;
	variant_name: string;
	size: string;
	color: string;
	gender: string;
	price: number;
	cost: number;
	unit: string;
	quantity: number;
	status: string;
	file_key?: string;

	// Enhanced product information
	product_name: string;
	product_description?: string;
	product_file_key?: string;

	// Category information
	category_name?: string;
	category_id?: string;

	// Computed fields
	display_name: string;
	is_in_stock: boolean;
}
