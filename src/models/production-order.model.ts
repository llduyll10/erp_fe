export type ProductionOrderStatus =
  | "draft" | "in_progress" | "done" | "stocked" | "cancelled";

export type ProductionOrderItem = {
  id: string;
  production_order_id: string;
  product_id: string | null;
  variant_id: string | null;
  size: string;
  color: string | null;
  qty_planned: number;
  qty_stocked: number;
  product?: { id: string; name: string; file_key?: string | null } | null;
  variant?: { id: string; sku: string } | null;
};

export type ProductionOrder = {
  id: string;
  company_id: string;
  order_number: string;
  product_id: string | null;
  status: ProductionOrderStatus;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  product?: { id: string; name: string } | null;
  items?: ProductionOrderItem[];
  created_by_user?: { name: string; email: string } | null;
};
