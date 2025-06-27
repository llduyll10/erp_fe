import { FormMode } from "@/constants/common.constant";
import { ProductForm } from "../ProductForm";

export function ProductDetailPage() {
	return <ProductForm mode={FormMode.DETAILS} />;
}
