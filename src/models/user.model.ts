import type { UserRoleEnum } from "../enums/user.enums";
import type { Company } from "./company.model";

type User = {
	id: string;
	created_at: Date;
	updated_at: Date;
	encrypted_password: string;
	email: string;
	name: string;
	reset_password_token?: string;
	reset_password_sent_at?: Date;
	current_sign_in_at?: Date;
	last_sign_in_at?: Date;
	current_sign_in_ip?: string;
	last_sign_in_ip?: string;
	sign_in_count: number;
	password?: string;
	password_confirmation?: string;
	locked_at?: Date;
	failed_attempts: number;
	unlock_token?: string;
	role?: UserRoleEnum;
	password_generated_at?: Date;
	company_id?: string;
	company?: Company;
	invite_token?: string;
	invite_token_expires_at?: Date;
	must_change_password: boolean;
};

export type { User };
