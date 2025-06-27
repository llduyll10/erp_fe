import { FormMode } from "@/constants/common.constant";
import { ProductForm } from "../ProductForm";

export function CreateProductPage() {
	return <ProductForm mode={FormMode.CREATE} />;
}
