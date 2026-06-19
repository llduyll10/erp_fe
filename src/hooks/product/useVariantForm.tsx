import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	createOptionalInputSchema,
	createOptionalNumberSchema,
	createRequiredEnumSchema,
	createRequiredNumberSchema,
} from "@/utils/schema.util";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ProductSize, ProductUnit } from "@/enums/product.enum";
import { useCreateVariant, useGetProductDetail } from "@/services/product";
import { toast } from "sonner";
import { VariantResponse } from "@/interfaces/product.interface";

export const VariantFormSchema = z.object({
	size: createRequiredEnumSchema(ProductSize, "Vui lòng chọn size"),
	unit: createRequiredEnumSchema(ProductUnit, "Unit is required"),
	price: createRequiredNumberSchema("Price"),
	cost: createRequiredNumberSchema("Cost"),
	quantity: createOptionalNumberSchema(),
	file_key: createOptionalInputSchema(),
});

export const getVariantFormDefault = (variant?: VariantResponse) => {
	return {
		size: variant?.size || ProductSize.M,
		price: Number(variant?.price) || 0,
		cost: Number(variant?.cost) || 0,
		unit: variant?.unit || ProductUnit.PIECE,
		quantity: Number(variant?.quantity) || 0,
		file_key: variant?.file_key || "",
	};
};

export const useVariantForm = (onSuccessCallback?: () => void) => {
	const { mutate: createVariant, isPending } = useCreateVariant();
	const { id } = useParams();
	const { t } = useTranslation();
	const { data: productDetail } = useGetProductDetail(id!);

	const form = useForm<z.infer<typeof VariantFormSchema>>({
		resolver: zodResolver(VariantFormSchema),
		defaultValues: getVariantFormDefault(),
	});

	const onSubmit = (data: z.infer<typeof VariantFormSchema>) => {
		const payload = {
			product_id: productDetail?.id || "",
			size: data.size || ProductSize.M,
			price: Number(data.price),
			cost: Number(data.cost),
			unit: data.unit || ProductUnit.PIECE,
			file_key: data.file_key || "",
			quantity: data.quantity || 0,
		};

		createVariant(payload, {
			onSuccess: () => {
				toast.success(t("products.createSuccess"));
				form.reset(getVariantFormDefault());
				onSuccessCallback?.();
			},
			onError: (error) => {
				toast.error(t("products.createError"));
				console.error("Create variant error:", error);
			},
		});
	};

	return { form, onSubmit, isPending, productDetail };
};
