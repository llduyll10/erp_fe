import type {
	InviteUserChangePasswordRequest,
	LoginRequest,
} from "../../interfaces/auth.interface";
import type { AuthResponse } from "@/interfaces/auth.interface";
import { request } from "@/utils/request.util";
import type { User } from "@/models/user.model";

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
	return await request({
		url: "/auth/login",
		method: "POST",
		data,
	});
};

export const updatePassword = async ({
	password,
	password_confirmation,
}: {
	password: string;
	password_confirmation: string;
}): Promise<{ data: User }> => {
	return await request({
		url: "/auth/password",
		method: "PUT",
		data: {
			password,
			password_confirmation,
		},
	});
};

export const inviteUserChangePassword = async (
	data: InviteUserChangePasswordRequest
): Promise<{ data: User }> => {
	return await request({
		url: "/users/invite/change-password",
		method: "PUT",
		data,
	});
};
