import type { Department } from "./department.model";

export type EmployeeStatus = "active" | "inactive";

export type Employee = {
  id: string;
  company_id: string;
  user_id: string | null;
  department_id: string | null;
  name: string;
  phone: string | null;
  status: EmployeeStatus;
  joined_at: string | null;
  department: Department | null;
  created_at: string;
  updated_at: string;
};
