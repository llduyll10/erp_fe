type LoginRequest = {
	email: string;
	password: string;
};
type LoginResponse = {
	access_token: string;
	refresh_token: string;
};

export type { LoginRequest, LoginResponse };
