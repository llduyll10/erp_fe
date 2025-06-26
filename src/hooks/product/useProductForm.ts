import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createOptionalInputSchema } from "@/utils/schema.util";
import { createRequiredInputSchema } from "@/utils/schema.util";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ProductItemType, ProductStatus } from "@/enums/product.enum";
import { useCreateProduct } from "@/services/product";

export const ProductFormSchema = z.object({
	name: createRequiredInputSchema("Name"),
	description: createOptionalInputSchema(),
	image_url: createOptionalInputSchema(),
	item_type: createRequiredInputSchema("Item Type"),
	status: createRequiredInputSchema("Status"),
});

const defaultValues = {
	name: "",
	description: "",
	image_url: "",
	item_type: ProductItemType.CLOTHING,
	status: ProductStatus.ACTIVE,
};

export const useProductForm = () => {
	const { mutate: createProduct, isPending } = useCreateProduct();
	const { t } = useTranslation();
	const form = useForm<z.infer<typeof ProductFormSchema>>({
		resolver: zodResolver(ProductFormSchema),
		defaultValues,
	});

	const onSubmit = (data: z.infer<typeof ProductFormSchema>) => {
		console.log(data);
	};

	return { form, onSubmit, isPending };
};
