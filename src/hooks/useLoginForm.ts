import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

export type LoginFormData = {
	email: string;
	password: string;
};

export const useLoginForm = () => {
	const { t } = useTranslation();

	const LoginFormSchema = z.object({
		email: z.string().email({ message: t("validation.email") }),
		password: z.string().min(1, {
			message: t("validation.required", { field: t("login.password") }),
		}),
	});

	const form = useForm<LoginFormData>({
		resolver: zodResolver(LoginFormSchema),
	});

	return form;
};
