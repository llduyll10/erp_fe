import { User } from "@/models/user.model";

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

type InviteUserChangePasswordRequest = {
	new_password: string;
};

export type {
	LoginRequest,
	LoginResponse,
	AuthTokens,
	AuthResponse,
	InviteUserChangePasswordRequest,
};
