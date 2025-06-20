import { AuthTokens, AuthResponse } from "@/interfaces/auth.interface";
import { User } from "@/models/user.model";

const TOKEN_KEY = "auth_tokens";
const USER_KEY = "auth_user";

export const setAuthTokens = (tokens: AuthTokens) => {
	localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
};

export const getAuthTokens = (): AuthTokens | null => {
	const tokens = localStorage.getItem(TOKEN_KEY);
	return tokens ? JSON.parse(tokens) : null;
};

export const removeAuthTokens = () => {
	localStorage.removeItem(TOKEN_KEY);
};

export const setAuthUser = (user: User) => {
	localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getAuthUser = (): User | null => {
	const user = localStorage.getItem(USER_KEY);
	return user ? JSON.parse(user) : null;
};

export const removeAuthUser = () => {
	localStorage.removeItem(USER_KEY);
};

export const handleAuthResponse = (response: AuthResponse) => {
	const { access_token, refresh_token, token_type, expires_in, user } =
		response;

	setAuthTokens({
		access_token,
		refresh_token,
		token_type,
		expires_in,
	});

	setAuthUser(user);

	return response;
};

export const clearAuth = () => {
	removeAuthTokens();
	removeAuthUser();
};
