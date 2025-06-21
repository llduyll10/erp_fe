import { User } from "@/models/user.model";
import type { ApiListResponse, PaginationParams } from "./common.interface";

type LoginRequest = {
	email: string;
	password: string;
};
type LoginResponse = {
	access_token: string;
	refresh_token: string;
};

type AuthTokens = {
	access_token: string;
	refresh_token: string;
	token_type: string;
	expires_in: string;
};

type AuthResponse = {
	access_token: string;
	refresh_token: string;
	token_type: string;
	expires_in: string;
	user: User;
};

type InviteUserRequest = {
	email: string;
	role: string;
	name: string;
};

type InviteUserChangePasswordRequest = {
	new_password: string;
	confirm_password: string;
};

type GetUserListRequest = {
	q?: string;
	role?: string;
	status?: string;
} & PaginationParams;

type GetUserListResponse = ApiListResponse<User>;

export type {
	LoginRequest,
	LoginResponse,
	AuthTokens,
	AuthResponse,
	InviteUserChangePasswordRequest,
	InviteUserRequest,
	GetUserListRequest,
	GetUserListResponse,
};
