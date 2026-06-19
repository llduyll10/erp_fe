import type { Department } from "./department.model";

export type EmployeeStatus = "active" | "inactive";
export type EmployeeDocumentType = "id_card" | "contract" | "degree" | "certificate" | "other";

export type EmployeeDocument = {
  id: string;
  employee_id: string;
  company_id: string;
  type: EmployeeDocumentType;
  name: string;
  file_key: string;
  uploaded_by: string | null;
  uploaded_by_user?: { name: string } | null;
  created_at: string;
};

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
  // Extended fields
  avatar_key: string | null;
  id_number: string | null;
  id_issued_date: string | null;
  id_issued_place: string | null;
  birth_date: string | null;
  address: string | null;
  bank_account: string | null;
  bank_name: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  notes: string | null;
  documents?: EmployeeDocument[];
  created_at: string;
  updated_at: string;
};
