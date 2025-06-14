import type { UserRoleEnum } from "../enums/user.enums";
import type { Company } from "./company.model";

type User = {
	id: string;
	created_at: Date;
	updated_at: Date;
	email: string;
	password: string;
	name: string;
	role: UserRoleEnum;
	company_id: string;
	company: Company;
};

export type { User };
