import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, Trash2, X } from "lucide-react";
import { MoneyInput } from "@/components/ui/money-input";
import { useGetTeamOrder, useUpdateTeamOrder } from "@/services/team-order";
import { useGetSettings } from "@/services/company-settings";
import { useGetProductList } from "@/services/product";
import { FileUploadPurpose } from "@/enums/file.enum";
import { OptimizedImage } from "@/components/molecules/optimized-image";
import { ImageIcon } from "lucide-react";
import { AutocompleteSearch } from "@/components/molecules/autocomplete-search";
import { useAutocompleteSearch, useProductAutocomplete } from "@/hooks/common/useAutocompleteSearch";
import type { Product } from "@/models/product.model";

type ItemRow = { member_name: string; jersey_number: string; size: string; note: string };

const schema = z.object({
  style_name: z.string().min(1, "Vui lòng nhập tên mẫu"),
  contact: z.string().optional(),
  logo_key: z.string().optional(),
  mockup_key: z.string().optional(),
  delivery_address: z.string().optional(),
  recipient_phone: z.string().optional(),
  deposit_amount: z.coerce.number().min(0).optional(),
  cod_amount: z.coerce.number().min(0).optional(),
  delivery_note: z.string().optional(),
});

export function EditTeamOrderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading } = useGetTeamOrder(id!);
  const { mutate: update, isPending } = useUpdateTeamOrder();
  const { data: settings } = useGetSettings();
  const sizes = settings?.sizes ?? ["S", "M", "L", "XL", "2XL", "3XL"];

  const [items, setItems] = useState<ItemRow[]>([]);
  const [noteLines, setNoteLines] = useState<string[]>([""]);
  const [selectedProductName, setSelectedProductName] = useState("");
  const [itemsError, setItemsError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      style_name: "", contact: "", logo_key: "", mockup_key: "",
      delivery_address: "", recipient_phone: "",
      deposit_amount: 0, cod_amount: 0, delivery_note: "",
    },
  });

  // Pre-fill form when order loads
  useEffect(() => {
    if (!order) return;
    form.reset({
      style_name: order.style_name ?? "",
      contact: order.contact ?? "",
      logo_key: order.logo_key ?? "",
      mockup_key: order.mockup_key ?? "",
      delivery_address: order.delivery_address ?? "",
      recipient_phone: order.recipient_phone ?? "",
      deposit_amount: Number(order.deposit_amount) || 0,
      cod_amount: Number(order.cod_amount) || 0,
      delivery_note: order.delivery_note ?? "",
    });
    setSelectedProductName(order.style_name ?? "");
    // Restore bullet notes
    const lines = order.notes?.split("\n").filter(Boolean) ?? [];
    setNoteLines(lines.length > 0 ? lines.map((l) => l.replace(/^-\s*/, "")) : [""]);
    // Restore members
    setItems(
      (order.items ?? [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((i) => ({
          member_name: i.member_name,
          jersey_number: i.jersey_number,
          size: i.size,
          note: i.note ?? "",
        }))
    );
  }, [order]);

  const addRow = () => setItems((p) => [...p, { member_name: "", jersey_number: "", size: sizes[2] ?? "L", note: "" }]);
  const removeRow = (i: number) => setItems((p) => p.filter((_, idx) => idx !== i));
  const updateRow = (i: number, key: keyof ItemRow, val: string) => {
    setItems((p) => p.map((r, idx) => idx === i ? { ...r, [key]: val } : r));
    if (key === "member_name" || key === "jersey_number") setItemsError(null);
  };

  const onSubmit = (data: z.infer<typeof schema>) => {
    const emptyRows = items.filter((r) => !r.member_name.trim() || !r.jersey_number.trim());
    if (emptyRows.length > 0) {
      setItemsError("Vui lòng điền đầy đủ Tên và Số áo cho tất cả thành viên");
      return;
    }
    setItemsError(null);
    const notesStr = noteLines
      .map((l) => l.trim()).filter(Boolean)
      .map((l) => `- ${l}`).join("\n");
    const payload: Parameters<typeof update>[0]["data"] = {
      ...data,
      mockup_key: data.mockup_key?.trim() || undefined,
      logo_key: data.logo_key?.trim() || undefined,
      notes: notesStr || undefined,
      items,
    };
    update(
      { id: id!, data: payload },
      { onSuccess: () => navigate(`/dashboard/team-orders/${id}`) }
    );
  };

  const mockupKey = form.watch("mockup_key");
  const logoKey = form.watch("logo_key");
  const { fieldConfig } = useProductAutocomplete();
  const { useQuery: useProductQuery } = useAutocompleteSearch(useGetProductList, fieldConfig);

  if (isLoading || !order)
    return <div className="p-8 text-muted-foreground">Đang tải...</div>;

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} className="mr-1" /> Quay lại
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Chỉnh sửa đơn đội</h1>
          <p className="text-sm text-muted-foreground font-mono">{order.order_number}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Mẫu áo */}
          <FormField control={form.control} name="style_name" render={({ field }) => (
            <FormItem>
              <FormLabel required>Mẫu áo</FormLabel>
              {selectedProductName ? (
                <div className="flex items-center gap-3 border rounded-lg p-3 bg-muted/30">
                  <p className="font-semibold flex-1">{selectedProductName}</p>
                  <Button type="button" variant="ghost" size="sm"
                    className="text-muted-foreground hover:text-red-500"
                    onClick={() => { setSelectedProductName(""); field.onChange(""); }}>
                    <X size={14} className="mr-1" /> Đổi mẫu
                  </Button>
                </div>
              ) : (
                <FormControl>
                  <AutocompleteSearch<Product>
                    useQuery={useProductQuery}
                    fieldConfig={fieldConfig}
                    value=""
                    onValueChange={(_, item) => {
                      if (item) {
                        const p = item as Product;
                        setSelectedProductName(p.name);
                        field.onChange(p.name);
                      }
                    }}
                    placeholder="Chọn mẫu áo từ shop..."
                    searchPlaceholder="Tìm tên mẫu..."
                    emptyMessage="Không tìm thấy"
                  />
                </FormControl>
              )}
              <FormMessage />
            </FormItem>
          )} />

          {/* Contact */}
          <FormField control={form.control} name="contact" render={({ field }) => (
            <FormItem>
              <FormLabel>Zalo / Liên hệ</FormLabel>
              <FormControl><Input placeholder="VD: Nguyễn Trọng Minh" className="max-w-sm" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Ghi chú chung — bullet list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Ghi chú chung</p>
                <p className="text-xs text-muted-foreground mt-0.5">Mỗi dòng là một yêu cầu riêng</p>
              </div>
              <Button type="button" variant="outline" size="sm"
                onClick={() => setNoteLines((p) => [...p, ""])}>
                <Plus size={13} className="mr-1" /> Thêm ghi chú
              </Button>
            </div>
            <div className="space-y-2">
              {noteLines.map((line, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-muted-foreground font-bold w-4 text-center select-none">•</span>
                  <Input
                    value={line}
                    onChange={(e) => setNoteLines((p) => p.map((l, idx) => idx === i ? e.target.value : l))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); setNoteLines((p) => [...p.slice(0, i + 1), "", ...p.slice(i + 1)]); }
                      if (e.key === "Backspace" && line === "" && noteLines.length > 1) { e.preventDefault(); setNoteLines((p) => p.filter((_, idx) => idx !== i)); }
                    }}
                    placeholder={i === 0 ? "VD: Có số quần" : i === 1 ? "VD: Logo đội ngực trái" : "VD: Logo xxx vai trái"}
                    className="h-8 text-sm flex-1"
                  />
                  {noteLines.length > 1 && (
                    <Button type="button" variant="ghost" size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                      onClick={() => setNoteLines((p) => p.filter((_, idx) => idx !== i))}>
                      <X size={13} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Payment */}
          <div className="space-y-3 border rounded-lg p-4 bg-muted/20">
            <p className="text-sm font-semibold">Giao hàng & Thanh toán</p>
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="recipient_phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>SĐT nhận hàng</FormLabel>
                  <FormControl><Input placeholder="0909..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="delivery_address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ giao hàng</FormLabel>
                  <FormControl><Input placeholder="Số nhà, đường, quận..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="deposit_amount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Khách đã cọc (VNĐ)</FormLabel>
                  <FormControl>
                    <MoneyInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="cod_amount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Thu COD còn lại (VNĐ)</FormLabel>
                  <FormControl>
                    <MoneyInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="delivery_note" render={({ field }) => (
              <FormItem>
                <FormLabel>Ghi chú giao hàng của khách</FormLabel>
                <FormControl><Input placeholder="VD: Giao buổi sáng, gọi trước 30 phút..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          {/* Images */}
          <div className="grid grid-cols-2 gap-6">
            <FormField control={form.control} name="mockup_key" render={({ field }) => (
              <FormItem>
                <FormLabel>Mockup mẫu đã chốt</FormLabel>
                {mockupKey && (
                  <div className="mb-2 rounded-md overflow-hidden border w-full h-48 bg-muted flex items-center justify-center">
                    <OptimizedImage fileKey={mockupKey} alt="Mockup"
                      className="w-full h-full object-contain" showLoading
                      fallbackComponent={<ImageIcon size={28} className="text-muted-foreground" />}
                    />
                  </div>
                )}
                <FormControl>
                  <ImageUpload purpose={FileUploadPurpose.PRODUCT_IMAGE} value={field.value}
                    onUploadComplete={(r) => field.onChange(r.fileKey)}
                    placeholder={mockupKey ? "Thay ảnh khác" : "Tải mockup mẫu đã chốt"} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="logo_key" render={({ field }) => (
              <FormItem>
                <FormLabel>Logo đội</FormLabel>
                {logoKey && (
                  <div className="mb-2 rounded-md overflow-hidden border w-full h-48 bg-muted flex items-center justify-center">
                    <OptimizedImage fileKey={logoKey} alt="Logo"
                      className="w-full h-full object-contain" showLoading
                      fallbackComponent={<ImageIcon size={28} className="text-muted-foreground" />}
                    />
                  </div>
                )}
                <FormControl>
                  <ImageUpload purpose={FileUploadPurpose.PRODUCT_IMAGE} value={field.value}
                    onUploadComplete={(r) => field.onChange(r.fileKey)}
                    placeholder={logoKey ? "Thay logo khác" : "Tải logo đội"} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          {/* Member table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Danh sách thành viên</p>
                <p className="text-xs text-muted-foreground mt-0.5">{items.length} người</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addRow}>
                <Plus size={13} className="mr-1" /> Thêm dòng
              </Button>
            </div>
            {itemsError && (
              <p className="text-xs text-red-500">{itemsError}</p>
            )}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-yellow-50">
                    <TableHead className="w-8 text-center">#</TableHead>
                    <TableHead>
                      Tên in lên áo
                      <span className="block text-xs font-normal text-muted-foreground">Tên từng người</span>
                    </TableHead>
                    <TableHead className="w-28 text-center">Số trên áo</TableHead>
                    <TableHead className="w-28">Size</TableHead>
                    <TableHead>Ghi chú</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row, i) => {
                    const rowError = !!itemsError && (!row.member_name.trim() || !row.jersey_number.trim());
                    return (
                      <TableRow key={i} className={rowError ? "bg-red-50" : ""}>
                        <TableCell className="text-center text-muted-foreground text-sm">{i + 1}</TableCell>
                        <TableCell>
                          <Input value={row.member_name}
                            onChange={(e) => updateRow(i, "member_name", e.target.value)}
                            placeholder="Tên in lên áo..."
                            className={`h-8 text-sm ${rowError && !row.member_name.trim() ? "border-red-400" : ""}`} />
                        </TableCell>
                        <TableCell>
                          <Input value={row.jersey_number}
                            onChange={(e) => updateRow(i, "jersey_number", e.target.value)}
                            placeholder="21"
                            className={`h-8 text-sm text-center ${rowError && !row.jersey_number.trim() ? "border-red-400" : ""}`} />
                        </TableCell>
                        <TableCell>
                          <select className="border rounded px-2 py-1 text-sm w-full" value={row.size}
                            onChange={(e) => updateRow(i, "size", e.target.value)}>
                            {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </TableCell>
                        <TableCell>
                          <Input value={row.note}
                            onChange={(e) => updateRow(i, "note", e.target.value)}
                            placeholder="Ghi chú..." className="h-8 text-sm" />
                        </TableCell>
                        <TableCell>
                          <Button type="button" variant="ghost" size="sm"
                            onClick={() => removeRow(i)}
                            className="text-red-400 hover:text-red-600 h-7 w-7 p-0">
                            <Trash2 size={12} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Hủy</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
