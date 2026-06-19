import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetProductList, useDeleteProduct } from "@/services/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/molecules/optimized-image";
import { ImageIcon, Plus, Search, Trash2, Pencil, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function ProductManagementPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useGetProductList({ q: search, page, limit: 20 });
  const { mutate: deleteProduct, isPending: deleting } = useDeleteProduct();

  const products = data?.data ?? [];
  const total = data?.pagination?.total_records ?? 0;

  const handleDelete = (id: string) => {
    deleteProduct(id, {
      onSuccess: () => { toast.success("Đã xóa sản phẩm"); setDeleteConfirm(null); refetch(); },
      onError: () => toast.error("Xóa thất bại"),
    });
  };

  return (
    <div className="p-6 max-w-5xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sản phẩm</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{total} sản phẩm</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </Button>
          <Button size="sm" onClick={() => navigate("/dashboard/products/create")}>
            <Plus size={14} className="mr-1.5" /> Thêm sản phẩm
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setSearch(q); setPage(1); } }}
            placeholder="Tìm tên sản phẩm..."
            className="pl-9 h-9"
          />
        </div>
        <Button size="sm" onClick={() => { setSearch(q); setPage(1); }}>Tìm</Button>
        {search && (
          <Button size="sm" variant="ghost" onClick={() => { setQ(""); setSearch(""); setPage(1); }}>Xóa</Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 size={16} className="animate-spin" /> Đang tải...
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm border rounded-lg">
          {search ? `Không tìm thấy "${search}"` : "Chưa có sản phẩm nào"}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-12"></th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Tên sản phẩm</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-32">Loại</th>
                <th className="text-center px-4 py-2.5 font-medium text-muted-foreground w-24">Biến thể</th>
                <th className="text-center px-4 py-2.5 font-medium text-muted-foreground w-24">Tổng tồn</th>
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p) => {
                const totalQty = (p.variants ?? []).reduce((s: number, v: any) => s + (v.quantity ?? 0), 0);
                return (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors group">
                    {/* Thumbnail */}
                    <td className="px-4 py-2.5">
                      <div className="w-10 h-10 rounded-md overflow-hidden border bg-muted flex items-center justify-center shrink-0">
                        {p.file_key ? (
                          <OptimizedImage fileKey={p.file_key} alt={p.name}
                            className="w-full h-full object-cover" showLoading={false}
                            fallbackComponent={<ImageIcon size={16} className="text-muted-foreground" />} />
                        ) : (
                          <ImageIcon size={16} className="text-muted-foreground" />
                        )}
                      </div>
                    </td>

                    {/* Name */}
                    <td className="px-4 py-2.5">
                      <p className="font-medium leading-tight">{p.name}</p>
                      {p.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.description}</p>
                      )}
                    </td>

                    {/* Type */}
                    <td className="px-4 py-2.5">
                      {p.item_type && (
                        <Badge variant="outline" className="text-xs font-normal">{p.item_type}</Badge>
                      )}
                    </td>

                    {/* Variants count */}
                    <td className="px-4 py-2.5 text-center">
                      <span className="text-sm font-medium">{(p.variants ?? []).length}</span>
                    </td>

                    {/* Total stock */}
                    <td className="px-4 py-2.5 text-center">
                      <span className={totalQty === 0 ? "text-muted-foreground/50" : "font-medium"}>
                        {totalQty}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-7 w-7"
                          onClick={() => navigate(`/dashboard/products/detail/${p.id}`)}>
                          <Pencil size={13} />
                        </Button>
                        {deleteConfirm === p.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(p.id)} disabled={deleting}
                              className="text-xs text-red-600 font-medium hover:text-red-700 px-1">
                              {deleting ? <Loader2 size={12} className="animate-spin" /> : "Xóa"}
                            </button>
                            <button onClick={() => setDeleteConfirm(null)}
                              className="text-xs text-muted-foreground px-1">Hủy</button>
                          </div>
                        ) : (
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-red-500"
                            onClick={() => setDeleteConfirm(p.id)}>
                            <Trash2 size={13} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Trang {page} · {total} sản phẩm</span>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</Button>
            <Button size="sm" variant="outline" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>→</Button>
          </div>
        </div>
      )}
    </div>
  );
}
