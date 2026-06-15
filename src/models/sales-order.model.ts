export type SalesOrderStatus =
  | "pending" | "printing" | "printed" | "packing" | "shipped" | "cancelled";

export type ImportBatchStatus = "pending" | "processing" | "done" | "failed";

export type SalesOrder = {
  id: string;
  company_id: string;
  import_batch_id: string | null;
  external_order_id: string;
  product_name: string;
  size: string | null;
  color: string | null;
  quantity: number;
  has_print: boolean;
  print_name: string | null;
  print_number: string | null;
  fc: string | null;
  status: SalesOrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ImportBatch = {
  id: string;
  company_id: string;
  filename: string;
  status: ImportBatchStatus;
  total_rows: number;
  success_rows: number;
  error_rows: number;
  created_at: string;
};

export type ImportError = {
  id: string;
  import_batch_id: string;
  row_number: number;
  error_message: string;
  raw_data: Record<string, string> | null;
};
