import { useMutation } from "@tanstack/react-query";
import { inviteUserChangePassword } from "./request";
import { InviteUserChangePasswordRequest } from "@/interfaces/auth.interface";

export const useInviteUserChangePassword = () => {
	return useMutation({
		mutationFn: async (data: InviteUserChangePasswordRequest) => {
			const response = await inviteUserChangePassword(data);
			return response;
		},
	});
};
