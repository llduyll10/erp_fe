import type { User } from "./user.model";
import {
	CustomerGroup,
	CustomerSource,
	CustomerStatus,
	CustomerType,
} from "@/enums/customer.enum";

type Customer = {
	id?: string | null;
	company_id?: string | null;
	customer_code?: string | null;
	name?: string | null;
	email?: string | null;
	phone_number?: string | null;
	customer_group?: CustomerGroup | null;
	customer_type?: CustomerType | null;
	customer_source?: CustomerSource | null;
	status?: CustomerStatus | null;
	sales_representative_id?: string | null;
	sales_representative?: User | null;
	street_address?: string | null;
	country?: string | null;
	state_province?: string | null;
	district?: string | null;
	ward?: string | null;
	postal_code?: string | null;
	city?: string | null; // For BE compatibility - mapped from state_province
	shipping_street_address?: string | null;
	shipping_country?: string | null;
	shipping_state_province?: string | null;
	shipping_district?: string | null;
	shipping_ward?: string | null;
	shipping_postal_code?: string | null;
	shipping_city?: string | null; // For BE compatibility - mapped from shipping_state_province
	note?: string | null;
	created_at?: Date | null;
	updated_at?: Date | null;
};

export type { Customer };
