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
import { useTranslation } from "react-i18next";
import { useRegisterCompanyForm } from "@/hooks/company/useRegisterCompanyForm";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

export function RegisterCompanyForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const { t } = useTranslation("company");
	const { form, onSubmit } = useRegisterCompanyForm();

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>{t("register.title")}</CardTitle>
					<CardDescription>{t("register.description")}</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)}>
							<div className="flex flex-col gap-6">
								{/* Company Information */}
								<div className="grid gap-3">
									<FormField
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("register.name")}</FormLabel>
												<FormControl>
													<Input {...field} id="name" required />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("register.email")}</FormLabel>
												<FormControl>
													<Input {...field} id="email" type="email" required />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="phone"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("register.phone")}</FormLabel>
												<FormControl>
													<Input {...field} id="phone" type="tel" required />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="address"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("register.address")}</FormLabel>
												<FormControl>
													<Input {...field} id="address" required />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="tax_code"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("register.tax_code")}</FormLabel>
												<FormControl>
													<Input {...field} id="tax_code" required />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{/* Admin Information */}
								<div className="grid gap-3">
									<FormField
										control={form.control}
										name="admin_name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("register.admin_name")}</FormLabel>
												<FormControl>
													<Input {...field} id="admin_name" required />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="admin_email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("register.admin_email")}</FormLabel>
												<FormControl>
													<Input
														{...field}
														id="admin_email"
														type="email"
														required
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="admin_password"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("register.admin_password")}</FormLabel>
												<FormControl>
													<Input
														{...field}
														id="admin_password"
														type="password"
														required
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="flex flex-col gap-3">
									<Button type="submit" className="w-full">
										{t("register.submit")}
									</Button>
								</div>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
