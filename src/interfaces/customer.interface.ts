import {
	CustomerGroup,
	CustomerSource,
	CustomerStatus,
	CustomerType,
} from "@/enums/customer.enum";
import { Customer } from "@/models/customer.model";
import { ApiListResponse, PaginationParams } from "./common.interface";

type CreateCustomerRequest = {
	name?: string;
	email?: string;
	phone_number?: string;
	customer_group?: CustomerGroup;
	customer_type?: CustomerType;
	customer_source?: CustomerSource;
	status?: CustomerStatus;
	sales_representative_id?: string;
	street_address?: string;
	country?: string;
	state_province?: string;
	district?: string;
	ward?: string;
	postal_code?: string;
	city?: string; // For BE compatibility - mapped from state_province
	shipping_street_address?: string;
	shipping_country?: string;
	shipping_state_province?: string;
	shipping_district?: string;
	shipping_ward?: string;
	shipping_postal_code?: string;
	shipping_city?: string; // For BE compatibility - mapped from shipping_state_province
	note?: string;
};
type CustomerResponse = Customer;
type UpdateCustomerRequest = CreateCustomerRequest;

type CustomerListResponse = ApiListResponse<Customer>;
type GetCustomerListRequest = {
	q?: string;
} & PaginationParams;

export type {
	CustomerResponse,
	CreateCustomerRequest,
	UpdateCustomerRequest,
	CustomerListResponse,
	GetCustomerListRequest,
};
