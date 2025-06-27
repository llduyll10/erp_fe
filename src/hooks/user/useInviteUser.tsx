import { QUERY_KEYS } from "@/constants/query.constant";
import { useInviteUser } from "@/services/user";
import {
	createRequiredEmailSchema,
	createRequiredInputSchema,
} from "@/utils/schema.util";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

export const InviteUserFormSchema = z.object({
	email: createRequiredEmailSchema(),
	role: createRequiredInputSchema("Role"),
	name: createRequiredInputSchema("Name"),
});

const defaultValues = {
	email: "",
	role: "",
	name: "",
};

export const useInviteUserForm = () => {
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const { mutate: inviteUser, isPending } = useInviteUser();
	const { t } = useTranslation();
	const form = useForm<z.infer<typeof InviteUserFormSchema>>({
		resolver: zodResolver(InviteUserFormSchema),
		defaultValues,
	});

	const onSubmit = (data: z.infer<typeof InviteUserFormSchema>) => {
		inviteUser(data, {
			onSuccess: () => {
				toast.success(t("common.success"));
				form.reset();
				setOpen(false);
				queryClient.invalidateQueries({
					queryKey: [QUERY_KEYS.USER.LIST],
				});
			},
		});
	};

	return { form, onSubmit, isPending, open, setOpen };
};
