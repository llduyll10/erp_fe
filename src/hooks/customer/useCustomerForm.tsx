import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createRequiredPhoneNumberSchema } from "@/utils/schema.util";
import {
	CustomerGroup,
	CustomerSource,
	CustomerStatus,
	CustomerType,
} from "@/enums/customer.enum";
import {
	CustomerResponse,
	CreateCustomerRequest,
} from "@/interfaces/customer.interface";
import {
	useCreateCustomer,
	useGetCustomerDetail,
	useUpdateCustomer,
} from "@/services/customer";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { toast } from "sonner";

export const CustomerFormSchema = z.object({
	name: z.string().optional(),
	email: z.string().optional(),
	phone_number: createRequiredPhoneNumberSchema("Phone Number"),
	customer_group: z.nativeEnum(CustomerGroup).optional(),
	customer_type: z.nativeEnum(CustomerType).optional(),
	customer_source: z.nativeEnum(CustomerSource).optional(),
	status: z.nativeEnum(CustomerStatus).optional(),
	sales_representative_id: z.string().optional(),
	street_address: z.string().optional(),
	country: z.string().optional(),
	state_province: z.string().optional(),
	district: z.string().optional(),
	ward: z.string().optional(),
	postal_code: z.string().optional(),
	city: z.string().optional(), // Mapped from state_province for BE compatibility
	shipping_street_address: z.string().optional(),
	shipping_country: z.string().optional(),
	shipping_state_province: z.string().optional(),
	shipping_district: z.string().optional(),
	shipping_ward: z.string().optional(),
	shipping_postal_code: z.string().optional(),
	shipping_city: z.string().optional(), // Mapped from shipping_state_province
	note: z.string().optional(),
});

export const getCustomerFormDefault = (
	customer?: CustomerResponse
): CreateCustomerRequest => {
	return {
		name: customer?.name || "",
		email: customer?.email || "",
		phone_number: customer?.phone_number || "",
		customer_group: customer?.customer_group || CustomerGroup.INTERNAL,
		customer_type: customer?.customer_type || CustomerType.NEW,
		customer_source: customer?.customer_source || CustomerSource.INTERNAL,
		status: customer?.status || CustomerStatus.ACTIVE,
		street_address: customer?.street_address || "",
		country: customer?.country || "Việt Nam",
		state_province:
			customer?.state_province || customer?.city || "Thành phố Hồ Chí Minh", // For backward compatibility
		district: customer?.district || "",
		ward: customer?.ward || "",
		postal_code: customer?.postal_code || "",
		city: customer?.city || customer?.state_province || "Thành phố Hồ Chí Minh", // Map state_province to city for BE
		shipping_street_address: customer?.shipping_street_address || "",
		shipping_country: customer?.shipping_country || "Việt Nam",
		shipping_state_province:
			customer?.shipping_state_province || customer?.shipping_city || "",
		shipping_district: customer?.shipping_district || "",
		shipping_ward: customer?.shipping_ward || "",
		shipping_postal_code: customer?.shipping_postal_code || "",
		shipping_city:
			customer?.shipping_city || customer?.shipping_state_province || "", // Map shipping_state_province to shipping_city
		note: customer?.note || "",
	};
};

export const useCustomerForm = () => {
	const { mutate: createCustomer } = useCreateCustomer();
	const { mutate: updateCustomer } = useUpdateCustomer();
	const { id } = useParams();
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { data: customerDetail } = useGetCustomerDetail(id!);

	const form = useForm<z.infer<typeof CustomerFormSchema>>({
		resolver: zodResolver(CustomerFormSchema),
		defaultValues: getCustomerFormDefault(),
	});

	const onSubmit = (data: z.infer<typeof CustomerFormSchema>) => {
		// Sync city fields with state_province for BE compatibility
		const payload = {
			...data,
			city: data.state_province, // Map state_province to city for BE
			shipping_city: data.shipping_state_province, // Map shipping_state_province to shipping_city for BE
		};

		if (id) {
			updateCustomer(
				{
					id,
					data: payload,
				},
				{
					onSuccess: () => {
						toast.success(t("customers.updateSuccess"));
					},
				}
			);
		} else {
			createCustomer(payload, {
				onSuccess: (response) => {
					toast.success(t("customers.createSuccess"));
					form.reset();
					navigate(`/dashboard/customers/detail/${response.id}`);
				},
			});
		}
	};

	useEffect(() => {
		if (!customerDetail) {
			form.reset(getCustomerFormDefault());
			return;
		}
		form.reset(getCustomerFormDefault(customerDetail));
	}, [customerDetail]);

	return { form, onSubmit, customerDetail };
};
