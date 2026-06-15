export type MediaType = "mockup" | "real_photo" | "size_chart" | "video";

export type ProductMedia = {
  id: string;
  product_id: string;
  variant_id: string | null;
  type: MediaType;
  file_key: string;
  thumbnail_key: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export type SalesCatalogItem = {
  id: string;
  name: string;
  description: string | null;
  primary_image: string | null;
  visible_for_sales: boolean;
  stock_by_color: Record<string, Record<string, number>>;
  total_stock: number;
};

export type InventoryOverviewRow = {
  product_id: string;
  product_name: string;
  color: string | null;
  sizes: Record<string, number>;
  total: number;
};
