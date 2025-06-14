import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createRequiredEmailSchema } from "@/utils/schema.util";
import { createRequiredInputSchema } from "@/utils/schema.util";
import { useLogin } from "@/services/auth";
import { handleAuthResponse } from "@/utils/auth.util";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const LoginFormSchema = z.object({
	email: createRequiredEmailSchema(),
	password: createRequiredInputSchema("Password"),
});

const defaultValues = {
	email: "",
	password: "",
};

export const useLoginForm = () => {
	const navigate = useNavigate();
	const { mutate: login, isPending } = useLogin();
	const { t } = useTranslation();
	const form = useForm<z.infer<typeof LoginFormSchema>>({
		resolver: zodResolver(LoginFormSchema),
		defaultValues,
	});

	const onSubmit = (data: z.infer<typeof LoginFormSchema>) => {
		login(data, {
			onSuccess: (response) => {
				handleAuthResponse(response);
				toast.success(t("login.success"));
				navigate("/dashboard");
			},
		});
	};

	return { form, onSubmit, isPending };
};
