import { Company } from "@/models/company.model";

type CreateCompanyRequest = {
	name: string;
	email: string;
	phone: string;
	address: string;
	tax_code: string;
	admin_name: string;
	admin_email: string;
	admin_password: string;
};
type CompanyResponse = Company;

export type { CreateCompanyRequest, CompanyResponse };
