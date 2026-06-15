export type PackingJobStatus = "waiting" | "packed" | "shipped";

export type PackingJob = {
  id: string;
  company_id: string;
  sales_order_id: string;
  status: PackingJobStatus;
  packed_by: string | null;
  packed_at: string | null;
  shipped_by: string | null;
  shipped_at: string | null;
  sales_order?: {
    id: string;
    external_order_id: string;
    product_name: string;
    size: string | null;
    color: string | null;
    quantity: number;
    has_print: boolean;
    print_name: string | null;
    print_number: string | null;
    status: string;
  } | null;
  print_warning?: string | null;
  packed_by_user?: { name: string } | null;
  shipped_by_user?: { name: string } | null;
};

export type PackingStats = {
  waiting: number;
  packed: number;
  shipped_today: number;
};
