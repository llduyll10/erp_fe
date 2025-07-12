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
import {
	ProductColor,
	ProductGender,
	ProductSize,
	ProductUnit,
} from "@/enums/product.enum";
import { useCreateVariant, useGetProductDetail } from "@/services/product";
import { toast } from "sonner";
import { VariantResponse } from "@/interfaces/product.interface";

export const VariantFormSchema = z.object({
	size: createRequiredEnumSchema(ProductSize, "Size is required"),
	color: createRequiredEnumSchema(ProductColor, "Color is required"),
	gender: createRequiredEnumSchema(ProductGender, "Gender is required"),
	unit: createRequiredEnumSchema(ProductUnit, "Unit is required"),
	price: createRequiredNumberSchema("Price"),
	cost: createRequiredNumberSchema("Cost"),
	quantity: createOptionalNumberSchema(),
	file_key: createOptionalInputSchema(),
});

export const getVariantFormDefault = (variant?: VariantResponse) => {
	return {
		size: variant?.size || ProductSize.M,
		color: variant?.color || ProductColor.RED,
		gender: variant?.gender || ProductGender.MALE,
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
		console.log(data);
		const payload = {
			product_id: productDetail?.id || "",
			size: data.size || ProductSize.M,
			color: data.color || ProductColor.RED,
			gender: data.gender || ProductGender.MALE,
			price: Number(data.price),
			cost: Number(data.cost),
			unit: data.unit || ProductUnit.PIECE,
			file_key: data.file_key || "",
			quantity: data.quantity || 0,
		};

		createVariant(payload, {
			onSuccess: (response) => {
				toast.success(t("products.createSuccess"));
				form.reset();
				onSuccessCallback?.();
			},
			onError: (error) => {
				toast.error(t("products.createError"));
				console.error("Create product error:", error);
			},
		});
	};

	return { form, onSubmit, isPending, productDetail };
};
