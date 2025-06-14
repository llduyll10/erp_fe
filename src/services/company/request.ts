import {
	CompanyResponse,
	CreateCompanyRequest,
} from "@/interfaces/company.interface";
import { request } from "../../utils/request.util";

export const registerCompany = async (
	data: CreateCompanyRequest
): Promise<CompanyResponse> => {
	return await request({
		url: "/companies",
		method: "POST",
		data,
	});
};
