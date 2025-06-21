import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createRequiredInputSchema } from "@/utils/schema.util";
import { useInviteUserChangePassword } from "@/services/user";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const InviteUserChangePasswordFormSchema = z.object({
	new_password: createRequiredInputSchema("New Password"),
	confirm_password: createRequiredInputSchema("Confirm Password"),
});

const defaultValues = {
	new_password: "",
	confirm_password: "",
};

export const useInviteUserChangePasswordForm = () => {
	const navigate = useNavigate();
	const { mutate: inviteUserChangePassword, isPending } =
		useInviteUserChangePassword();
	const { t } = useTranslation();
	const form = useForm<z.infer<typeof InviteUserChangePasswordFormSchema>>({
		resolver: zodResolver(InviteUserChangePasswordFormSchema),
		defaultValues,
	});

	const onSubmit = (
		data: z.infer<typeof InviteUserChangePasswordFormSchema>
	) => {
		inviteUserChangePassword(data, {
			onSuccess: () => {
				toast.success(t("common.success"));
				navigate("/login");
			},
		});
	};

	return { form, onSubmit, isPending };
};
