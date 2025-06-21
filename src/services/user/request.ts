import type {
	InviteUserChangePasswordRequest,
	LoginRequest,
} from "../../interfaces/auth.interface";
import type { AuthResponse } from "@/interfaces/auth.interface";
import { request } from "@/utils/request.util";
import type { User } from "@/models/user.model";

export const inviteUserChangePassword = async (
	data: InviteUserChangePasswordRequest
): Promise<{ data: User }> => {
	return await request({
		url: "/users/invite/change-password",
		method: "PUT",
		data,
	});
};
