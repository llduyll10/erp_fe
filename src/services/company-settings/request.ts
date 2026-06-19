import { request } from "@/utils/request.util";
import type { CompanySettings } from "@/models/company-settings.model";

export const getSettings = async (): Promise<CompanySettings> =>
	request({ url: "/settings", method: "GET" });

export const updateCompanyInfo = async (data: {
	name?: string;
	tax_code?: string;
	phone?: string;
	address?: string;
	logo_url?: string;
}): Promise<CompanySettings> =>
	request({ url: "/settings/company", method: "PUT", data });

export const updateProductSettings = async (data: {
	sizes?: string[];
	item_types?: string[];
	low_stock_threshold?: number;
	product_code_prefix?: string;
	product_code_pad?: number;
	production_order_code_prefix?: string;
	production_order_code_pad?: number;
	print_job_code_prefix?: string;
	print_job_code_pad?: number;
	stock_in_code_prefix?: string;
	stock_in_code_pad?: number;
}): Promise<CompanySettings> =>
	request({ url: "/settings/product", method: "PUT", data });

export const updateStorageSettings = async (data: {
	s3_bucket?: string;
	s3_region?: string;
	s3_endpoint?: string;
	s3_access_key?: string;
	s3_secret_key?: string;
}): Promise<CompanySettings> =>
	request({ url: "/settings/storage", method: "PUT", data });
