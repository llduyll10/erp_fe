import type { User } from "./user.model";

type Company = {
	id: string;
	name: string;
	email: string;
	phone: string;
	address: string;
	logo_url: string;
	isActive: boolean;
	users: User[];
	createdAt: Date;
	updatedAt: Date;
	deleted_at: Date;
};

export type { Company };
