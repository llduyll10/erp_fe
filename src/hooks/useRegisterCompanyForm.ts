import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createRequiredEmailSchema } from "@/utils/schema.util";
import { createRequiredInputSchema } from "@/utils/schema.util";
import { useRegisterCompany } from "@/services/company";

export const RegisterCompanyFormSchema = z.object({
	name: createRequiredInputSchema("Name"),
	email: createRequiredEmailSchema(),
	phone: createRequiredInputSchema("Phone"),
	address: createRequiredInputSchema("Address"),
	tax_code: createRequiredInputSchema("Tax Code"),
	admin_name: createRequiredInputSchema("Admin Name"),
	admin_email: createRequiredEmailSchema(),
	admin_password: createRequiredInputSchema("Admin Password"),
});

const defaultValues = {
	email: "",
	password: "",
};

export const useRegisterCompanyForm = () => {
	const { mutate: registerCompany } = useRegisterCompany();
	const form = useForm<z.infer<typeof RegisterCompanyFormSchema>>({
		resolver: zodResolver(RegisterCompanyFormSchema),
		defaultValues,
	});

	const onSubmit = (data: z.infer<typeof RegisterCompanyFormSchema>) => {
		registerCompany(data);
	};

	return { form, onSubmit };
};
