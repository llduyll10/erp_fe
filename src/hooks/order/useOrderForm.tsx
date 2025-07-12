import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	OrderStatus,
	FulfillmentStatus,
	PaymentStatus,
	ProductionStatus,
} from "@/enums/order.enum";
import {
	OrderResponse,
	CreateOrderRequest,
	CreateOrderItemRequest,
} from "@/interfaces/order.interface";
import {
	useCreateOrder,
	useGetOrderDetail,
	useUpdateOrder,
} from "@/services/order";
import { useGetCustomerList } from "@/services/customer";
import { Customer } from "@/models/customer.model";
import { useGetUserList } from "@/services/user";
import { User } from "@/models/user.model";

// Order Item Schema
export const OrderItemSchema = z
	.object({
		product_id: z.string().optional(),
		variant_id: z.string().optional(),
		custom_product_id: z.string().optional(),
		quantity: z.number().min(1, "Quantity must be at least 1"),
		unit_price: z.number().min(0, "Unit price must be positive"),
		total_price: z.number().min(0, "Total price must be positive"),
		production_status: z.nativeEnum(ProductionStatus).optional(),
	})
	.refine(
		(data) => data.product_id || data.variant_id || data.custom_product_id,
		{
			message:
				"At least one of product_id, variant_id, or custom_product_id is required",
		}
	);

// Order Form Schema
export const OrderFormSchema = z.object({
	customer_id: z.string().min(1, "Customer is required"),
	sales_representative_id: z
		.string()
		.min(1, "Sales representative is required"),
	status: z.nativeEnum(OrderStatus).optional(),
	fulfillment_status: z.nativeEnum(FulfillmentStatus).optional(),
	payment_status: z.nativeEnum(PaymentStatus).optional(),

	// Shipping Address (Optional)
	shipping_street_address: z.string().optional(),
	shipping_country: z.string().optional(),
	shipping_state_province: z.string().optional(),
	shipping_district: z.string().optional(),
	shipping_ward: z.string().optional(),
	shipping_postal_code: z.string().optional(),
	shipping_city: z.string().optional(),
	delivery_notes: z.string().optional(),

	order_items: z
		.array(OrderItemSchema)
		.min(1, "At least one order item is required"),
});

export const getOrderFormDefault = (
	order?: OrderResponse
): CreateOrderRequest => {
	return {
		customer_id: order?.customer_id || "",
		sales_representative_id: order?.sales_representative_id || "",
		status: order?.status || OrderStatus.NEW,
		fulfillment_status: order?.fulfillment_status || FulfillmentStatus.PENDING,
		payment_status: order?.payment_status || PaymentStatus.UNPAID,

		// Shipping Address
		shipping_street_address: order?.shipping_street_address || "",
		shipping_country: order?.shipping_country || "Việt Nam",
		shipping_state_province: order?.shipping_state_province || "",
		shipping_district: order?.shipping_district || "",
		shipping_ward: order?.shipping_ward || "",
		shipping_postal_code: order?.shipping_postal_code || "",
		shipping_city: order?.shipping_city || "",
		delivery_notes: order?.delivery_notes || "",

		order_items:
			order?.order_items?.map((item) => ({
				product_id: item.product_id || undefined,
				variant_id: item.variant_id || undefined,
				custom_product_id: item.custom_product_id || undefined,
				quantity: item.quantity || 1,
				unit_price: item.unit_price || 0,
				total_price: item.total_price || 0,
				production_status: item.production_status || ProductionStatus.PENDING,
			})) || [],
	};
};

export const useOrderForm = () => {
	const { mutate: createOrder } = useCreateOrder();
	const { mutate: updateOrder } = useUpdateOrder();
	const { id } = useParams();
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { data: orderDetail } = useGetOrderDetail(id!);

	// Customer search state
	const [customerSearchQuery, setCustomerSearchQuery] = useState("");
	const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
		null
	);

	// Sales representative state
	const [selectedSalesRep, setSelectedSalesRep] = useState<User | null>(null);

	// Selected variants state for display (includes image info)
	const [selectedVariants, setSelectedVariants] = useState<
		Record<number, OrderVariant>
	>({});

	// Fetch customers for search (debounced)
	const { data: customerListResponse } = useGetCustomerList(
		{
			q: customerSearchQuery,
			limit: 10,
			page: 1,
		},
		customerSearchQuery.length >= 3 // Only search when query is at least 3 characters
	);

	// Fetch users for finding sales representative
	const { data: userListResponse } = useGetUserList(
		{ limit: 100, page: 1 },
		!!orderDetail?.sales_representative_id // Only fetch when we have a sales rep ID
	);

	const form = useForm<z.infer<typeof OrderFormSchema>>({
		resolver: zodResolver(OrderFormSchema),
		defaultValues: getOrderFormDefault(), // TODO: Get from auth store
	});

	// Handle customer selection
	const handleCustomerSelect = (customer: Customer) => {
		setSelectedCustomer(customer);
		form.setValue("customer_id", customer.id!);

		// Auto-fill shipping address from customer default address
		if (customer.shipping_street_address) {
			form.setValue(
				"shipping_street_address",
				customer.shipping_street_address
			);
			form.setValue(
				"shipping_country",
				customer.shipping_country || "Việt Nam"
			);
			form.setValue(
				"shipping_state_province",
				customer.shipping_state_province || ""
			);
			form.setValue("shipping_district", customer.shipping_district || "");
			form.setValue("shipping_ward", customer.shipping_ward || "");
			form.setValue(
				"shipping_postal_code",
				customer.shipping_postal_code || ""
			);
			form.setValue(
				"shipping_city",
				customer.shipping_city || customer.shipping_state_province || ""
			);
		} else if (customer.street_address) {
			// Fallback to billing address if no shipping address
			form.setValue("shipping_street_address", customer.street_address);
			form.setValue("shipping_country", customer.country || "Việt Nam");
			form.setValue("shipping_state_province", customer.state_province || "");
			form.setValue("shipping_district", customer.district || "");
			form.setValue("shipping_ward", customer.ward || "");
			form.setValue("shipping_postal_code", customer.postal_code || "");
			form.setValue(
				"shipping_city",
				customer.city || customer.state_province || ""
			);
		}
	};

	// Handle customer not found - navigate to create customer
	const handleCreateNewCustomer = () => {
		navigate("/dashboard/customers/create", {
			state: {
				returnTo: "/dashboard/orders/create",
				phone: customerSearchQuery,
			},
		});
	};

	// Handle sales representative selection
	const handleSalesRepSelect = (userId: string) => {
		form.setValue("sales_representative_id", userId);
		
		// We need to get the user data from the sales representative query
		// This will be handled by the AutocompleteSearch component's internal state
		// For now, we'll clear the selected sales rep and let the modal fetch it
		if (!userId) {
			setSelectedSalesRep(null);
		}
	};

	const onSubmit = (data: z.infer<typeof OrderFormSchema>) => {
		const payload = {
			...data,
			shipping_city: data.shipping_state_province, // Map for BE compatibility
		};

		if (id) {
			updateOrder(
				{
					id,
					data: payload,
				},
				{
					onSuccess: () => {
						toast.success(t("orders.updateSuccess"));
					},
				}
			);
		} else {
			createOrder(payload, {
				onSuccess: (response) => {
					toast.success(t("orders.createSuccess"));
					form.reset();
					navigate(`/dashboard/orders/detail/${response.id}`);
				},
			});
		}
	};

	useEffect(() => {
		if (!orderDetail) {
			form.reset(getOrderFormDefault()); // TODO: Get from auth store
			setSelectedCustomer(null);
			setSelectedSalesRep(null);
			return;
		}
		
		// Reset form with order detail data
		const formData = getOrderFormDefault(orderDetail);
		form.reset(formData); // TODO: Get from auth store
		
		// Set selected customer
		if (orderDetail.customer) {
			setSelectedCustomer(orderDetail.customer);
		}
		
		// Set selected sales representative
		if (orderDetail.sales_representative && orderDetail.sales_representative_id) {
			setSelectedSalesRep(orderDetail.sales_representative);
		} else if (orderDetail.sales_representative_id && userListResponse?.data) {
			// Find sales rep from user list if not directly available
			const foundSalesRep = userListResponse.data.find(
				(user: User) => user.id === orderDetail.sales_representative_id
			);
			if (foundSalesRep) {
				setSelectedSalesRep(foundSalesRep);
			}
		}
	}, [orderDetail, userListResponse]);

	return {
		form,
		onSubmit,
		orderDetail,
		selectedCustomer,
		selectedSalesRep,
		handleCustomerSelect,
		handleSalesRepSelect,
		handleCreateNewCustomer,
		customerSearchQuery,
		setCustomerSearchQuery,
		customerList: customerListResponse?.data || [],
		isCustomerListLoading: false, // We can add loading state later
	};
};
