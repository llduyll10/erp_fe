import { ProductColor, ProductGender, ProductSize } from "@/enums/product.enum";

export const PRODUCT_SIZE_OPTIONS = Object.values(ProductSize).map((size) => ({
	value: size,
	label: size,
}));

export const PRODUCT_COLOR_OPTIONS = Object.values(ProductColor).map(
	(color) => ({
		value: color,
		label: color,
	})
);

export const PRODUCT_GENDER_OPTIONS = Object.values(ProductGender).map(
	(gender) => ({
		value: gender,
		label: gender,
	})
);
