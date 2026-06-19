import { request } from "@/utils/request.util";
import type { Department } from "@/models/department.model";
import type { Employee } from "@/models/employee.model";

type PaginatedResponse<T> = {
	data: T[];
	pagination: {
		current_page: number;
		records_per_page: number;
		total_pages: number;
		total_records: number;
	};
};

// ── Departments ────────────────────────────────────────────────────────

export const getDepartments = (params?: {
	q?: string;
	page?: number;
	limit?: number;
}): Promise<PaginatedResponse<Department>> =>
	request({ url: "/departments", method: "GET", params });

export const getDepartment = (id: string): Promise<Department> =>
	request({ url: `/departments/${id}`, method: "GET" });

export const createDepartment = (data: {
	name: string;
	code: string;
	description?: string;
}): Promise<Department> =>
	request({ url: "/departments", method: "POST", data });

export const updateDepartment = (
	id: string,
	data: { name?: string; description?: string }
): Promise<Department> =>
	request({ url: `/departments/${id}`, method: "PUT", data });

export const deleteDepartment = (id: string): Promise<void> =>
	request({ url: `/departments/${id}`, method: "DELETE" });

// ── Employees ─────────────────────────────────────────────────────────

export const getEmployees = (params?: {
	q?: string;
	page?: number;
	limit?: number;
	department_id?: string;
	status?: string;
}): Promise<PaginatedResponse<Employee>> =>
	request({ url: "/employees", method: "GET", params });

export const getEmployee = (id: string): Promise<Employee> =>
	request({ url: `/employees/${id}`, method: "GET" });

export const createEmployee = (data: {
	name: string;
	department_id?: string;
	user_id?: string;
	phone?: string;
	joined_at?: string;
}): Promise<Employee> =>
	request({ url: "/employees", method: "POST", data });

export const updateEmployee = (
	id: string,
	data: {
		name?: string;
		department_id?: string;
		user_id?: string;
		phone?: string;
		status?: string;
		joined_at?: string;
	}
): Promise<Employee> =>
	request({ url: `/employees/${id}`, method: "PUT", data });

export const deleteEmployee = (id: string): Promise<void> =>
	request({ url: `/employees/${id}`, method: "DELETE" });

// ── Audit Logs ────────────────────────────────────────────────────────

export const getAuditLogs = (params?: {
	q?: string;
	page?: number;
	limit?: number;
	entity_type?: string;
	action?: string;
}) =>
	request({ url: "/audit-logs", method: "GET", params });

export const addEmployeeDocument = (
	employeeId: string,
	data: { type: string; name: string; file_key: string }
) => request({ url: `/employees/${employeeId}/documents`, method: "POST", data });

export const deleteEmployeeDocument = (employeeId: string, docId: string) =>
	request({ url: `/employees/${employeeId}/documents/${docId}`, method: "DELETE" });
