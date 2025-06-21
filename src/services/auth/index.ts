import { useMutation } from "@tanstack/react-query";
import { login } from "./request";
import { LoginRequest } from "@/interfaces/auth.interface";

export const useLogin = () => {
	return useMutation({
		mutationFn: async (data: LoginRequest) => {
			const response = await login(data);
			return response;
		},
	});
};
