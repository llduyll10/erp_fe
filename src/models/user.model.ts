import type { UserRoleEnum } from "../enums/user.enums";
import type { Company } from "./company.model";
import type { AccessToken } from "./access-token.model";
type User = {
	id: string;
	full_name: string;
	email: string;
	password: string;
	role: UserRoleEnum;
	refresh_token: string;
	company_id: string;
	last_login_at: Date;
	company: Company;
	access_tokens: AccessToken[];
	created_at: Date;
	updated_at: Date;
	password_reset_token: string;
	password_reset_expires: Date;
};

export type { User };
