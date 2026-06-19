export type TeamOrderStatus = 'draft' | 'confirmed' | 'in_production' | 'done' | 'cancelled';

export type TeamOrderItem = {
  id: string;
  team_order_id: string;
  member_name: string;
  jersey_number: string;
  size: string;
  note: string | null;
  sort_order: number;
};

export type TeamOrderHistory = {
  id: string;
  created_at: string;
  team_order_id: string;
  changed_by: string | null;
  changed_by_name: string | null;
  summary: string;
  changes: Record<string, { old: any; new: any }> | null;
  changed_by_user?: { name: string } | null;
};

export type TeamOrder = {
  id: string;
  company_id: string;
  order_number: string;
  style_name: string;
  contact: string | null;
  notes: string | null;
  logo_key: string | null;
  mockup_key: string | null;
  delivery_address: string | null;
  recipient_phone: string | null;
  deposit_amount: number;
  cod_amount: number;
  delivery_note: string | null;
  status: TeamOrderStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  items?: TeamOrderItem[];
  created_by_user?: { name: string; email: string } | null;
  history?: TeamOrderHistory[];
};
