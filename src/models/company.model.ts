import type { User } from "./user.model";
import { CompanyStatus, SubscriptionPlan } from "@/enums/company.enum";

type Company = {
	id: string;
	created_at: Date;
	updated_at: Date;
	name: string;
	email: string;
	phone: string;
	address: string;
	logo_url: string;
	timezone: string;
	language: string;
	users: User[];
	status: CompanyStatus;
	subscription_plan: SubscriptionPlan;
	features_config: Record<string, any>;
	deleted_at: Date;
};

export type { Company };
