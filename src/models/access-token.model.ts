import type { User } from "./user.model";

type AccessToken = {
	id: string;
	token: string;
	user_agent: string;
	ip_address: string;
	is_revoked: boolean;
	expires_at: Date;
	user_id: string;
	user: User;
	created_at: Date;
	updated_at: Date;
};

export type { AccessToken };
