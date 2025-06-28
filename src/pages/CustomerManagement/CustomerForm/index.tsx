import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

import { FormMode } from "@/constants/common.constant";
import { useCustomerForm } from "@/hooks/customer/useCustomerForm";
import {
	CustomerGroup,
	CustomerSource,
	CustomerStatus,
	CustomerType,
} from "@/enums/customer.enum";
import { AddressForm } from "@/components/molecules/address-form";
import { useState } from "react";

interface CustomerFormProps extends React.ComponentProps<"div"> {
	mode: FormMode;
}

export function CustomerForm({ mode, ...props }: CustomerFormProps) {
	const { t } = useTranslation("customer");
	const { form, onSubmit, customerDetail } = useCustomerForm();
	const [sameAsBilling, setSameAsBilling] = useState(false);

	const handleCopyBillingAddress = (checked: boolean) => {
		setSameAsBilling(checked);
		if (checked) {
			// Copy billing address to shipping address
			const billingValues = form.getValues();
			form.setValue(
				"shipping_street_address",
				billingValues.street_address || ""
			);
			form.setValue("shipping_country", billingValues.country || "");
			form.setValue(
				"shipping_state_province",
				billingValues.state_province || ""
			);
			form.setValue("shipping_district", billingValues.district || "");
			form.setValue("shipping_ward", billingValues.ward || "");
			form.setValue("shipping_postal_code", billingValues.postal_code || "");
			form.setValue(
				"shipping_city",
				billingValues.city || billingValues.state_province || ""
			);
		} else {
			// Clear all shipping address fields when unchecked
			form.setValue("shipping_street_address", "");
			form.setValue("shipping_country", "Việt Nam"); // Reset to default
			form.setValue("shipping_state_province", "");
			form.setValue("shipping_district", "");
			form.setValue("shipping_ward", "");
			form.setValue("shipping_postal_code", "");
			form.setValue("shipping_city", "");
		}
	};

	return (
		<div className={cn("flex flex-col gap-6")} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>
						{mode === FormMode.CREATE ? t("create") : t("update")}
					</CardTitle>
					<CardDescription className="text-red-500">
						{t("importantPhoneNumber")}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							{/* Basic Information */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Name */}
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("name")}</FormLabel>
											<FormControl>
												<Input {...field} placeholder={t("namePlaceholder")} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Email */}
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("email")}</FormLabel>
											<FormControl>
												<Input
													{...field}
													type="email"
													placeholder={t("emailPlaceholder")}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Phone Number */}
								<FormField
									control={form.control}
									name="phone_number"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("phoneNumber")} *</FormLabel>
											<FormControl>
												<Input
													{...field}
													placeholder={t("phoneNumberPlaceholder")}
													disabled={mode === FormMode.DETAILS}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Customer Group */}
								<FormField
									control={form.control}
									name="customer_group"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("customerGroup")}</FormLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue
															placeholder={t("selectCustomerGroup")}
														/>
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{Object.values(CustomerGroup).map((group) => (
														<SelectItem key={group} value={group}>
															{t(`groups.${group.toLowerCase()}`)}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Customer Type */}
								<FormField
									control={form.control}
									name="customer_type"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("customerType")}</FormLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue
															placeholder={t("selectCustomerType")}
														/>
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{Object.values(CustomerType).map((type) => (
														<SelectItem key={type} value={type}>
															{t(`types.${type.toLowerCase()}`)}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Customer Source */}
								<FormField
									control={form.control}
									name="customer_source"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("customerSource")}</FormLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue
															placeholder={t("selectCustomerSource")}
														/>
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{Object.values(CustomerSource).map((source) => (
														<SelectItem key={source} value={source}>
															{t(`sources.${source.toLowerCase()}`)}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Status */}
								<FormField
									control={form.control}
									name="status"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("status")}</FormLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder={t("selectStatus")} />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{Object.values(CustomerStatus).map((status) => (
														<SelectItem key={status} value={status}>
															{t(`statuses.${status.toLowerCase()}`)}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Billing Address */}
							<AddressForm control={form.control} titleKey="billingAddress" />

							{/* Shipping Address */}
							<div className="space-y-4">
								<div className="flex items-center space-x-2">
									<Checkbox
										id="same-as-billing"
										checked={sameAsBilling}
										onCheckedChange={handleCopyBillingAddress}
									/>
									<label
										htmlFor="same-as-billing"
										className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
										{t("sameAsBillingAddress")}
									</label>
								</div>

								<AddressForm
									key={sameAsBilling ? "shipping-copied" : "shipping-empty"}
									control={form.control}
									prefix="shipping"
									titleKey="shippingAddress"
								/>
							</div>

							{/* Note */}
							<div>
								<FormField
									control={form.control}
									name="note"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("note")}</FormLabel>
											<FormControl>
												<Textarea
													{...field}
													placeholder={t("notePlaceholder")}
													rows={4}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Submit Button */}
							<div className="flex justify-center items-center">
								<Button type="submit">
									{mode === FormMode.CREATE ? t("create") : t("update")}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
