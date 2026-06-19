import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetVariantList, useUpdateVariant, useDeleteVariant } from "@/services/product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VariantModal } from "../VariantModal";
import { Trash2, Pencil, Check, X, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── helpers ────────────────────────────────────────────────────────────────
function fmt(n: number | string | null | undefined) {
  return Number(n ?? 0).toLocaleString("vi-VN");
}
function parseNum(s: string) {
  return parseFloat(s.replace(/\./g, "").replace(/,/g, "")) || 0;
}

type Row = {
  id: string;
  size: string;
  sku: string;
  price: string;   // display string while editing
  cost: string;
  quantity: number;
  status: string;
  dirty: boolean;  // has unsaved changes
};

// ─── Component ──────────────────────────────────────────────────────────────
export function VariantTable() {
  const { id: productId } = useParams<{ id: string }>();
  const { data, isLoading, refetch } = useGetVariantList({ product_id: productId, limit: 100, page: 1 });
  const { mutate: updateVariant, isPending: updating } = useUpdateVariant();
  const { mutate: deleteVariant, isPending: deleting } = useDeleteVariant();

  const [rows, setRows] = useState<Row[]>([]);
  const [bulkEdit, setBulkEdit] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Sync rows from API data
  useEffect(() => {
    if (!data?.data) return;
    setRows(
      data.data.map((v) => ({
        id: v.id,
        size: v.size,
        sku: v.sku,
        price: fmt(v.price),
        cost: fmt(v.cost),
        quantity: v.quantity ?? 0,
        status: v.status,
        dirty: false,
      })),
    );
    setBulkEdit(false);
  }, [data]);

  const setField = (id: string, field: "price" | "cost", value: string) => {
    setRows((prev) =>
      prev.map((r) => r.id === id ? { ...r, [field]: value, dirty: true } : r),
    );
  };

  // ── Bulk save ──────────────────────────────────────────────────────────
  const handleBulkSave = async () => {
    const dirty = rows.filter((r) => r.dirty);
    if (!dirty.length) { setBulkEdit(false); return; }

    let ok = 0;
    let fail = 0;
    for (const r of dirty) {
      await new Promise<void>((resolve) => {
        updateVariant(
          { id: r.id, data: { price: parseNum(r.price), cost: parseNum(r.cost) } },
          { onSuccess: () => { ok++; resolve(); }, onError: () => { fail++; resolve(); } },
        );
      });
    }

    if (ok > 0) toast.success(`Đã cập nhật ${ok} biến thể`);
    if (fail > 0) toast.error(`${fail} biến thể lỗi`);
    refetch();
    setBulkEdit(false);
  };

  const cancelBulkEdit = () => {
    // Reset to original values
    if (data?.data) {
      setRows(
        data.data.map((v) => ({
          id: v.id, size: v.size, sku: v.sku,
          price: fmt(v.price), cost: fmt(v.cost),
          quantity: v.quantity ?? 0, status: v.status, dirty: false,
        })),
      );
    }
    setBulkEdit(false);
  };

  const handleDelete = (id: string) => {
    deleteVariant(id, {
      onSuccess: () => { toast.success("Đã xóa"); setDeleteConfirm(null); refetch(); },
      onError: () => toast.error("Xóa thất bại"),
    });
  };

  const dirtyCount = rows.filter((r) => r.dirty).length;

  if (isLoading) return (
    <div className="py-12 text-center text-sm text-muted-foreground">Đang tải...</div>
  );

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{rows.length} biến thể</p>
        <div className="flex items-center gap-2">
          {bulkEdit ? (
            <>
              <span className="text-xs text-muted-foreground">
                {dirtyCount > 0 && `${dirtyCount} thay đổi`}
              </span>
              <Button size="sm" variant="outline" onClick={cancelBulkEdit} disabled={updating}>
                <X size={13} className="mr-1" /> Hủy
              </Button>
              <Button size="sm" onClick={handleBulkSave} disabled={updating}>
                {updating
                  ? <Loader2 size={13} className="animate-spin mr-1" />
                  : <Save size={13} className="mr-1" />}
                Lưu tất cả {dirtyCount > 0 && `(${dirtyCount})`}
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={() => setBulkEdit(true)} disabled={rows.length === 0}>
                <Pencil size={13} className="mr-1" /> Sửa hàng loạt
              </Button>
              <VariantModal onSuccess={refetch} />
            </>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-sm border rounded-lg">
          Chưa có biến thể nào
        </div>
      ) : (
        <div className={cn("border rounded-lg overflow-hidden", bulkEdit && "ring-2 ring-primary/30")}>
          {bulkEdit && (
            <div className="bg-primary/5 border-b px-4 py-2 text-xs text-primary font-medium">
              Chế độ sửa hàng loạt — chỉnh giá trực tiếp, nhấn "Lưu tất cả" khi xong
            </div>
          )}
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-20">Size</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">SKU</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-40">Giá bán (đ)</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-40">Giá vốn (đ)</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-20">Tồn</th>
                <th className="text-center px-4 py-2.5 font-medium text-muted-foreground w-24">Trạng thái</th>
                {!bulkEdit && <th className="w-16" />}
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "transition-colors group",
                    bulkEdit
                      ? row.dirty ? "bg-amber-50/50" : "hover:bg-muted/10"
                      : "hover:bg-muted/20",
                  )}
                >
                  {/* Size */}
                  <td className="px-4 py-2.5">
                    <span className="font-semibold">{row.size}</span>
                    {bulkEdit && row.dirty && (
                      <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                    )}
                  </td>

                  {/* SKU */}
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{row.sku}</td>

                  {/* Price */}
                  <td className="px-4 py-2.5 text-right">
                    {bulkEdit ? (
                      <Input
                        value={row.price}
                        onChange={(e) => setField(row.id, "price", e.target.value)}
                        className={cn(
                          "h-8 text-right text-sm w-full",
                          row.dirty && "border-amber-400 focus-visible:ring-amber-300",
                        )}
                        inputMode="numeric"
                      />
                    ) : (
                      <span className={cn("font-medium", Number(row.quantity) === 0 && row.price === "0" ? "text-muted-foreground/50" : "")}>
                        {row.price}
                      </span>
                    )}
                  </td>

                  {/* Cost */}
                  <td className="px-4 py-2.5 text-right">
                    {bulkEdit ? (
                      <Input
                        value={row.cost}
                        onChange={(e) => setField(row.id, "cost", e.target.value)}
                        className={cn(
                          "h-8 text-right text-sm w-full",
                          row.dirty && "border-amber-400 focus-visible:ring-amber-300",
                        )}
                        inputMode="numeric"
                      />
                    ) : (
                      <span className="text-muted-foreground">{row.cost}</span>
                    )}
                  </td>

                  {/* Quantity */}
                  <td className="px-4 py-2.5 text-right">
                    <span className={row.quantity === 0 ? "text-muted-foreground/50" : "font-medium"}>
                      {row.quantity}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-2.5 text-center">
                    <Badge variant={row.status === "active" ? "default" : "secondary"} className="text-xs">
                      {row.status === "active" ? "Đang bán" : "Ngừng"}
                    </Badge>
                  </td>

                  {/* Delete (only in normal mode) */}
                  {!bulkEdit && (
                    <td className="px-4 py-2.5 text-center">
                      {deleteConfirm === row.id ? (
                        <div className="flex items-center gap-1 justify-center">
                          <button
                            onClick={() => handleDelete(row.id)}
                            disabled={deleting}
                            className="text-xs text-red-600 font-medium hover:text-red-700">
                            {deleting ? <Loader2 size={12} className="animate-spin" /> : "Xóa"}
                          </button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-xs text-muted-foreground">
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(row.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-opacity">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
