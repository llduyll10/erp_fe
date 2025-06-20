import { useMutation } from "@tanstack/react-query";
import { inviteUserChangePassword, login } from "./request";
import {
	InviteUserChangePasswordRequest,
	LoginRequest,
} from "@/interfaces/auth.interface";

export const useLogin = () => {
	return useMutation({
		mutationFn: async (data: LoginRequest) => {
			const response = await login(data);
			return response;
		},
	});
};

export const useInviteUserChangePassword = () => {
	return useMutation({
		mutationFn: async (data: InviteUserChangePasswordRequest) => {
			const response = await inviteUserChangePassword(data);
			return response;
		},
	});
};
