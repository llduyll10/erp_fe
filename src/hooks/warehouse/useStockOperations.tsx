/**
 * Stock Operations Hook
 * Form handling for stock in/out operations
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useCreateStockIn, useCreateStockOut } from "@/services/warehouse";
import { StockMovementReason } from "@/enums/warehouse.enum";

// Stock In Form Schema
export const StockInFormSchema = z.object({
	variant_id: z.string().min(1, "Vui lòng chọn sản phẩm"),
	quantity: z.number().min(0.01, "Số lượng phải lớn hơn 0"),
	reason: z.string().optional(),
	reason_type: z.nativeEnum(StockMovementReason).optional(),
});

// Stock Out Form Schema
export const StockOutFormSchema = z.object({
	variant_id: z.string().min(1, "Vui lòng chọn sản phẩm"),
	quantity: z.number().min(0.01, "Số lượng phải lớn hơn 0"),
	reason: z.string().optional(),
	reason_type: z.nativeEnum(StockMovementReason).optional(),
	order_id: z.string().optional(),
});

export type StockInFormData = z.infer<typeof StockInFormSchema>;
export type StockOutFormData = z.infer<typeof StockOutFormSchema>;

const getStockInDefaults = (): StockInFormData => ({
	variant_id: "",
	quantity: 1,
	reason: "",
	reason_type: StockMovementReason.SUPPLIER_DELIVERY,
});

const getStockOutDefaults = (): StockOutFormData => ({
	variant_id: "",
	quantity: 1,
	reason: "",
	reason_type: StockMovementReason.SALES_ORDER,
	order_id: "",
});

export const useStockInForm = () => {
	const { t } = useTranslation();
	const { mutate: stockIn, isPending: isStockInPending } = useCreateStockIn();

	const form = useForm<StockInFormData>({
		resolver: zodResolver(StockInFormSchema),
		defaultValues: getStockInDefaults(),
	});

	const onSubmit = (data: StockInFormData) => {
		stockIn({
			variant_id: data.variant_id,
			quantity: data.quantity,
			reason: data.reason,
			reason_type: data.reason_type,
		}, {
			onSuccess: () => {
				form.reset(getStockInDefaults());
			},
		});
	};

	return {
		form,
		onSubmit: form.handleSubmit(onSubmit),
		isSubmitting: isStockInPending,
	};
};

export const useStockOutForm = () => {
	const { t } = useTranslation();
	const { mutate: stockOut, isPending: isStockOutPending } = useCreateStockOut();

	const form = useForm<StockOutFormData>({
		resolver: zodResolver(StockOutFormSchema),
		defaultValues: getStockOutDefaults(),
	});

	const onSubmit = (data: StockOutFormData) => {
		stockOut({
			variant_id: data.variant_id,
			quantity: data.quantity,
			reason: data.reason,
			reason_type: data.reason_type,
			order_id: data.order_id || undefined,
		}, {
			onSuccess: () => {
				form.reset(getStockOutDefaults());
			},
		});
	};

	return {
		form,
		onSubmit: form.handleSubmit(onSubmit),
		isSubmitting: isStockOutPending,
	};
};