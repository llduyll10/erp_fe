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
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const { t } = useTranslation();
	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>{t("login.title")}</CardTitle>
					<CardDescription>{t("login.description")}</CardDescription>
				</CardHeader>
				<CardContent>
					<form>
						<div className="flex flex-col gap-6">
							<div className="grid gap-3">
								<Label htmlFor="email">{t("login.email")}</Label>
								<Input
									id="email"
									type="email"
									placeholder="m@example.com"
									required
								/>
							</div>
							<div className="grid gap-3">
								<div className="flex items-center">
									<Label htmlFor="password">{t("login.password")}</Label>
									<a
										href="#"
										className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
										{t("login.forgotPassword")}
									</a>
								</div>
								<Input id="password" type="password" required />
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
				</CardContent>
			</Card>
		</div>
	);
}
