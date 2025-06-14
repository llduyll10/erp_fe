import { useMutation } from "@tanstack/react-query";
import { registerCompany } from "./request";
import { CreateCompanyRequest } from "@/interfaces/company.interface";

export const useRegisterCompany = () => {
	return useMutation({
		mutationFn: async (data: CreateCompanyRequest) => {
			const response = await registerCompany(data);
			return response;
		},
	});
};
