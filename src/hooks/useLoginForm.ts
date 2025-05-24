import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const LoginFormSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
	password: z.string().min(1, {
		message: "Password is required",
	}),
});

export const useLoginForm = () => {
	const form = useForm<z.infer<typeof LoginFormSchema>>({
		resolver: zodResolver(LoginFormSchema),
	});

	return form;
};

export type LoginFormData = z.infer<typeof LoginFormSchema>;
