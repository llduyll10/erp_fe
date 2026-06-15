import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getDepartments,
	getDepartment,
	createDepartment,
	updateDepartment,
	deleteDepartment,
	getEmployees,
	getEmployee,
	createEmployee,
	updateEmployee,
	deleteEmployee,
	getAuditLogs,
} from "./request";
import { QUERY_KEYS } from "@/constants/query.constant";
import { toast } from "sonner";

// ── Departments ────────────────────────────────────────────────────────

export const useGetDepartments = (params?: {
	q?: string;
	page?: number;
	limit?: number;
}) =>
	useQuery({
		queryKey: [QUERY_KEYS.HR.DEPARTMENTS, params],
		queryFn: () => getDepartments(params),
		staleTime: 5 * 60 * 1000,
	});

export const useGetDepartment = (id: string) =>
	useQuery({
		queryKey: [QUERY_KEYS.HR.DEPARTMENT_DETAIL, id],
		queryFn: () => getDepartment(id),
		enabled: !!id,
	});

export const useCreateDepartment = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: createDepartment,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.HR.DEPARTMENTS] });
			toast.success("Đã tạo phòng ban");
		},
	});
};

export const useUpdateDepartment = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateDepartment>[1] }) =>
			updateDepartment(id, data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.HR.DEPARTMENTS] });
			toast.success("Đã cập nhật phòng ban");
		},
	});
};

export const useDeleteDepartment = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: deleteDepartment,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.HR.DEPARTMENTS] });
			toast.success("Đã xóa phòng ban");
		},
	});
};

// ── Employees ─────────────────────────────────────────────────────────

export const useGetEmployees = (params?: {
	q?: string;
	page?: number;
	limit?: number;
	department_id?: string;
	status?: string;
}) =>
	useQuery({
		queryKey: [QUERY_KEYS.HR.EMPLOYEES, params],
		queryFn: () => getEmployees(params),
		staleTime: 5 * 60 * 1000,
	});

export const useGetEmployee = (id: string) =>
	useQuery({
		queryKey: [QUERY_KEYS.HR.EMPLOYEE_DETAIL, id],
		queryFn: () => getEmployee(id),
		enabled: !!id,
	});

export const useCreateEmployee = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: createEmployee,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.HR.EMPLOYEES] });
			toast.success("Đã thêm nhân viên");
		},
	});
};

export const useUpdateEmployee = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateEmployee>[1] }) =>
			updateEmployee(id, data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.HR.EMPLOYEES] });
			toast.success("Đã cập nhật nhân viên");
		},
	});
};

export const useDeleteEmployee = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: deleteEmployee,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [QUERY_KEYS.HR.EMPLOYEES] });
			toast.success("Đã xóa nhân viên");
		},
	});
};

// ── Audit Logs ────────────────────────────────────────────────────────

export const useGetAuditLogs = (params?: {
	q?: string;
	page?: number;
	limit?: number;
	entity_type?: string;
	action?: string;
}) =>
	useQuery({
		queryKey: [QUERY_KEYS.HR.AUDIT_LOGS, params],
		queryFn: () => getAuditLogs(params),
		staleTime: 60 * 1000,
	});
