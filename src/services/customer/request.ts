import {
	CustomerResponse,
	CreateCustomerRequest,
	CustomerListResponse,
	UpdateCustomerRequest,
	GetCustomerListRequest,
} from "@/interfaces/customer.interface";
import { request } from "../../utils/request.util";

export const createCustomer = async (
	data: CreateCustomerRequest
): Promise<CustomerResponse> => {
	return await request({
		url: "/customers",
		method: "POST",
		data,
	});
};

export const getCustomerList = async (
	params?: GetCustomerListRequest
): Promise<CustomerListResponse> => {
	return await request({
		url: "/customers",
		method: "GET",
		params,
	});
};

export const getCustomerDetail = async (
	id: string
): Promise<CustomerResponse> => {
	return await request({
		url: `/customers/${id}`,
		method: "GET",
	});
};

export const updateCustomer = async (
	id: string,
	data: UpdateCustomerRequest
): Promise<CustomerResponse> => {
	return await request({
		url: `/customers/${id}`,
		method: "PUT",
		data,
	});
};
