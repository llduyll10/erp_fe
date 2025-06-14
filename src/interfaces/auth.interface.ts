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

type AuthUser = {
	id: string;
	email: string;
	name: string;
	role: string;
	company_id: string;
};
type AuthResponse = {
	access_token: string;
	refresh_token: string;
	token_type: string;
	expires_in: string;
	user: AuthUser;
};

export type { LoginRequest, LoginResponse, AuthTokens, AuthUser, AuthResponse };
