import type { Company } from "./company.model";
import { ProductItemType, ProductStatus } from "@/enums/product.enum";
import { ProductVariant } from "./product-variant.model";
import { Category } from "./category.model";

type Product = {
	id: string;
	company_id: string;
	category_id?: string | null;
	name: string;
	description?: string | null;
	file_key?: string | null;
	item_type: ProductItemType;
	status: ProductStatus;
	created_at: Date;
	updated_at: Date;
	company: Company;
	category?: Category | null;
	variants?: ProductVariant[] | null;
};

export type { Product };
export type { ProductVariant } from "./product-variant.model";
