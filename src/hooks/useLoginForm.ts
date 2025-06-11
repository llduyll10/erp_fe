import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createRequiredEmailSchema } from "@/utils/schema.util";
import { createRequiredInputSchema } from "@/utils/schema.util";
import { useLogin } from "@/services/auth";

export const LoginFormSchema = z.object({
	email: createRequiredEmailSchema(),
	password: createRequiredInputSchema("Password"),
});

const defaultValues = {
	email: "",
	password: "",
};

export const useLoginForm = () => {
	const { mutate: login } = useLogin();
	const form = useForm<z.infer<typeof LoginFormSchema>>({
		resolver: zodResolver(LoginFormSchema),
		defaultValues,
	});

	const onSubmit = (data: z.infer<typeof LoginFormSchema>) => {
		console.log(data);
		login(data);
	};

	return { form, onSubmit };
};
