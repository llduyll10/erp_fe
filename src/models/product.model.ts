import type { Company } from "./company.model";
import { ProductItemType, ProductStatus } from "@/enums/product.enum";
import { ProductVariant } from "./product-variant.model";
import { Category } from "./category.model";

type Product = {
	id: string;
	company_id: string;
	category_id: string;
	name: string;
	description: string;
	image_url: string;
	item_type: ProductItemType;
	status: ProductStatus;
	created_at: Date;
	updated_at: Date;
	company: Company;
	category: Category;
	variants: ProductVariant[];
};

export type { Product };
