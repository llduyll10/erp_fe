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
import { useLoginForm } from "@/hooks/useLoginForm";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const { t } = useTranslation();
	const { form, onSubmit } = useLoginForm();
	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>{t("login.title")}</CardTitle>
					<CardDescription>{t("login.description")}</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)}>
							<div className="flex flex-col gap-6">
								<div className="grid gap-3">
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("login.email")}</FormLabel>
												<FormControl>
													<Input
														{...field}
														id="email"
														type="email"
														placeholder="m@example.com"
														required
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="grid gap-3">
									<FormField
										control={form.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("login.password")}</FormLabel>
												<FormControl>
													<Input
														{...field}
														id="password"
														type="password"
														required
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<div className="flex items-center">
										<a
											href="#"
											className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
											{t("login.forgotPassword")}
										</a>
									</div>
								</div>
								<div className="flex flex-col gap-3">
									<Button type="submit" className="w-full">
										{t("login.button")}
									</Button>
								</div>
							</div>
							<div className="mt-4 text-center text-sm">
								{t("login.noAccount")}{" "}
								<a href="#" className="underline underline-offset-4">
									{t("login.signUp")}
								</a>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
