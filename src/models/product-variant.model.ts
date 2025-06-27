import type { Company } from "./company.model";
import { Product } from "./product.model";
import {
	ProductSize,
	ProductColor,
	ProductGender,
	ProductUnit,
	ProductStatus,
} from "@/enums/product.enum";

type ProductVariant = {
	id: string;
	company_id: string;
	product_id: string;
	sku: string;
	variant_name?: string | null;
	size: ProductSize | null;
	color?: ProductColor | null;
	gender: ProductGender | null;
	price: number | null;
	cost?: number | null;
	unit?: ProductUnit | null;
	quantity?: number | null;
	status?: ProductStatus | null;
	created_at: Date;
	updated_at: Date;
	company?: Company | null;
	product?: Product | null;
	file_key?: string | null;
};

export type { ProductVariant };
