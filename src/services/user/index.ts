import { useMutation } from "@tanstack/react-query";
import { inviteUser, inviteUserChangePassword } from "./request";
import {
	InviteUserChangePasswordRequest,
	InviteUserRequest,
} from "@/interfaces/auth.interface";

export const useInviteUser = () => {
	return useMutation({
		mutationFn: async (data: InviteUserRequest) => {
			const response = await inviteUser(data);
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
