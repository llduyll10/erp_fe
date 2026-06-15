export type PrintJobStatus = "pending" | "printed" | "error" | "missing_shirt";

export type PrintJob = {
  id: string;
  company_id: string;
  sales_order_id: string;
  barcode: string;
  product_model: string;
  size: string | null;
  print_name: string | null;
  print_number: string | null;
  fc: string | null;
  status: PrintJobStatus;
  printed_by: string | null;
  printed_at: string | null;
  error_note: string | null;
  printed_by_user?: { name: string } | null;
  sales_order?: { external_order_id: string; has_print: boolean } | null;
  created_at: string;
  updated_at: string;
};

export type PrintJobStats = {
  pending: number;
  printed: number;
  error: number;
  missing: number;
};
