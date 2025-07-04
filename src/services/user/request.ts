import type {
	InviteUserChangePasswordRequest,
	InviteUserRequest,
	GetUserListRequest,
	GetUserListResponse,
} from "../../interfaces/auth.interface";
import { request } from "@/utils/request.util";
import type { User } from "@/models/user.model";

export const inviteUser = async (
	data: InviteUserRequest
): Promise<{ data: User }> => {
	return await request({
		url: "/users/invite",
		method: "POST",
		data,
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

export const getUserList = async (
	params?: GetUserListRequest
): Promise<GetUserListResponse> => {
	return await request({
		url: "/users",
		method: "GET",
		params,
	});
};
