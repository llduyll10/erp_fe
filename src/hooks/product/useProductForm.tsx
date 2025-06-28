import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createOptionalInputSchema } from "@/utils/schema.util";
import { createRequiredInputSchema } from "@/utils/schema.util";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ProductItemType, ProductStatus } from "@/enums/product.enum";
import {
	useCreateProduct,
	useGetProductDetail,
	useUpdateProduct,
} from "@/services/product";
import { toast } from "sonner";
import { ProductResponse } from "@/interfaces/product.interface";
import { useEffect } from "react";

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

export const getProductFormDefault = (product?: ProductResponse) => {
	return {
		name: product?.name || "",
		description: product?.description || "",
		category_id: product?.category_id || "",
		file_key: product?.file_key || "",
		item_type: product?.item_type || ProductItemType.CLOTHING,
		status: product?.status || ProductStatus.ACTIVE,
	};
};

export const useProductForm = () => {
	const { mutate: createProduct, isPending } = useCreateProduct();
	const { mutate: updateProduct } = useUpdateProduct();
	const { id } = useParams();
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { data: productDetail } = useGetProductDetail(id!);

	const form = useForm<z.infer<typeof ProductFormSchema>>({
		resolver: zodResolver(ProductFormSchema),
	});

	const onSubmit = (data: z.infer<typeof ProductFormSchema>) => {
		console.log(data);
		if (id) {
			updateProduct(
				{
					id: id!,
					data: {
						...data,
						id: id!,
					},
				},
				{
					onSuccess: () => {
						toast.success(t("products.updateSuccess"));
					},
				}
			);
		} else {
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
		}
	};

	useEffect(() => {
		if (!productDetail) {
			form.reset(getProductFormDefault());
			return;
		}
		form.reset(getProductFormDefault(productDetail));
	}, [productDetail]);

	return { form, onSubmit, isPending, productDetail };
};
