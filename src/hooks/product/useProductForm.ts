import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createOptionalInputSchema } from "@/utils/schema.util";
import { createRequiredInputSchema } from "@/utils/schema.util";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ProductItemType, ProductStatus } from "@/enums/product.enum";
import { useCreateProduct } from "@/services/product";
import { toast } from "sonner";

export const ProductFormSchema = z.object({
	name: createRequiredInputSchema("Name"),
	description: createOptionalInputSchema(),
	file_key: createOptionalInputSchema(),
	item_type: z.nativeEnum(ProductItemType, {
		required_error: "Item Type is required",
	}),
	status: z.nativeEnum(ProductStatus, {
		required_error: "Status is required",
	}),
	category_id: createRequiredInputSchema(),
});

const defaultValues = {
	name: "",
	description: "",
	category_id: "",
	file_key: "",
	item_type: ProductItemType.CLOTHING,
	status: ProductStatus.ACTIVE,
};

export const useProductForm = () => {
	const { mutate: createProduct, isPending } = useCreateProduct();
	const { t } = useTranslation();
	const navigate = useNavigate();

	const form = useForm<z.infer<typeof ProductFormSchema>>({
		resolver: zodResolver(ProductFormSchema),
		defaultValues,
	});

	const onSubmit = (data: z.infer<typeof ProductFormSchema>) => {
		console.log(data);
		createProduct(data, {
			onSuccess: (response) => {
				toast.success(t("products.createSuccess"));
				form.reset();
				navigate(`/dashboard/products/detail/${response.id}`);
			},
			onError: (error) => {
				toast.error(t("products.createError"));
				console.error("Create product error:", error);
			},
		});
	};

	return { form, onSubmit, isPending };
};
