import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OptimizedImage } from "@/components/molecules/optimized-image";
import { ImageIcon, ArrowLeft, Printer, Pencil } from "lucide-react";
import { useGetTeamOrder, useUpdateTeamOrder } from "@/services/team-order";
import { getViewUrl } from "@/services/file";
import type { TeamOrderHistory, TeamOrderStatus } from "@/models/team-order.model";

const STATUS_CONFIG: Record<TeamOrderStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft:         { label: "Mới tạo",       variant: "secondary" },
  confirmed:     { label: "Đã chốt",       variant: "default" },
  in_production: { label: "Đang sản xuất", variant: "default" },
  done:          { label: "Hoàn thành",    variant: "outline" },
  cancelled:     { label: "Đã hủy",        variant: "destructive" },
};

const FIELD_LABELS: Record<string, string> = {
  status:           "Trạng thái",
  style_name:       "Tên mẫu áo",
  contact:          "Liên hệ",
  notes:            "Ghi chú",
  logo_key:         "Logo đội",
  mockup_key:       "Mockup",
  delivery_address: "Địa chỉ giao hàng",
  recipient_phone:  "SĐT nhận hàng",
  deposit_amount:   "Tiền cọc",
  cod_amount:       "Thu COD",
  delivery_note:    "Ghi chú giao hàng",
  items:            "Danh sách thành viên",
};

const ITEM_FIELD_LABELS: Record<string, string> = {
  jersey_number: "số áo",
  size:          "size",
  note:          "ghi chú",
};

const CURRENCY_FIELDS = new Set(["deposit_amount", "cod_amount"]);
const FILE_FIELDS = new Set(["logo_key", "mockup_key"]);

type ItemSnap = { member_name: string; jersey_number: string; size: string; note?: string };

function formatHistoryValue(field: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (field === "status") return STATUS_CONFIG[value as TeamOrderStatus]?.label ?? String(value);
  if (CURRENCY_FIELDS.has(field)) return `${Number(value).toLocaleString("vi-VN")} đ`;
  return String(value);
}

function formatFileChange(oldVal: unknown, newVal: unknown): string {
  if (!oldVal && newVal) return "Đã thêm";
  if (oldVal && newVal) return "Đã cập nhật";
  if (oldVal && !newVal) return "Đã xóa";
  return "—";
}

function ItemsDiffView({ oldItems, newItems }: { oldItems: ItemSnap[]; newItems: ItemSnap[] }) {
  const oldMap = new Map(oldItems.map((i) => [i.member_name, i]));
  const newMap = new Map(newItems.map((i) => [i.member_name, i]));

  // Build merged row list: removed → modified/unchanged → added
  type Row =
    | { type: "removed"; item: ItemSnap }
    | { type: "added"; item: ItemSnap }
    | { type: "unchanged"; item: ItemSnap }
    | { type: "modified"; old: ItemSnap; new: ItemSnap; diffs: string[] };

  const rows: Row[] = [];

  for (const old of oldItems) {
    const nw = newMap.get(old.member_name);
    if (!nw) {
      rows.push({ type: "removed", item: old });
    } else {
      const diffs: string[] = [];
      if (old.jersey_number !== nw.jersey_number)
        diffs.push(`số áo: ${old.jersey_number || "—"} → ${nw.jersey_number || "—"}`);
      if (old.size !== nw.size)
        diffs.push(`size: ${old.size} → ${nw.size}`);
      if ((old.note ?? "") !== (nw.note ?? ""))
        diffs.push(`ghi chú: "${old.note || ""}" → "${nw.note || ""}"`);
      if (diffs.length > 0) rows.push({ type: "modified", old, new: nw, diffs });
      else rows.push({ type: "unchanged", item: old });
    }
  }
  for (const nw of newItems) {
    if (!oldMap.has(nw.member_name)) rows.push({ type: "added", item: nw });
  }

  return (
    <ul className="ml-3 mt-0.5 space-y-0.5">
      {rows.map((row, i) => {
        if (row.type === "removed") {
          return (
            <li key={i} className="text-red-400 line-through">
              {row.item.member_name}
              <span className="no-underline"> (#{row.item.jersey_number || "—"}, {row.item.size})</span>
            </li>
          );
        }
        if (row.type === "added") {
          return (
            <li key={i} className="text-green-600">
              + {row.item.member_name} (#{row.item.jersey_number || "—"}, {row.item.size}
              {row.item.note ? `, ${row.item.note}` : ""})
            </li>
          );
        }
        if (row.type === "modified") {
          return (
            <li key={i}>
              <span className="font-medium text-amber-700">{row.new.member_name}</span>
              <span className="text-muted-foreground">: {row.diffs.join(", ")}</span>
            </li>
          );
        }
        // unchanged — dimmed
        return (
          <li key={i} className="text-muted-foreground/50">
            {row.item.member_name} (#{row.item.jersey_number || "—"}, {row.item.size})
          </li>
        );
      })}
    </ul>
  );
}

function HistoryChangeRow({ field, oldVal, newVal }: { field: string; oldVal: any; newVal: any }) {
  const label = FIELD_LABELS[field] ?? field;

  if (FILE_FIELDS.has(field)) {
    return (
      <li className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{label}:</span>{" "}
        <span className="text-sky-600">{formatFileChange(oldVal, newVal)}</span>
      </li>
    );
  }

  if (field === "items") {
    const oldItems: ItemSnap[] = oldVal ?? [];
    const newItems: ItemSnap[] = newVal ?? [];
    return (
      <li className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">
          {label} ({oldItems.length} → {newItems.length} người):
        </span>
        <ItemsDiffView oldItems={oldItems} newItems={newItems} />
      </li>
    );
  }

  return (
    <li className="text-xs text-muted-foreground">
      <span className="font-medium text-foreground">{label}:</span>{" "}
      <span className="line-through text-red-400">{formatHistoryValue(field, oldVal)}</span>
      {" → "}
      <span className="text-green-600">{formatHistoryValue(field, newVal)}</span>
    </li>
  );
}

const NEXT_STATUS: Record<TeamOrderStatus, TeamOrderStatus[]> = {
  draft:         ["confirmed", "cancelled"],
  confirmed:     ["in_production", "cancelled"],
  in_production: ["done", "cancelled"],
  done:          [],
  cancelled:     [],
};

export function TeamOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading } = useGetTeamOrder(id!);
  const { mutate: update } = useUpdateTeamOrder();
  const [printing, setPrinting] = useState(false);

  const handlePrint = async () => {
    if (!order) return;
    setPrinting(true);

    // Fetch presigned URLs — put directly in <img src>, no base64 needed
    let mockupUrl = "";
    let logoUrl = "";
    try {
      if (order.mockup_key?.trim()) mockupUrl = (await getViewUrl(order.mockup_key)).url;
    } catch { /* skip */ }
    try {
      if (order.logo_key?.trim()) logoUrl = (await getViewUrl(order.logo_key)).url;
    } catch { /* skip */ }

    const items = (order.items ?? []).sort((a, b) => a.sort_order - b.sort_order);
    const today = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    const title = `ĐƠN IN TÊN SỐ MẪU ${order.style_name.toUpperCase()}${order.contact ? ` - ZALO ${order.contact.toUpperCase()}` : ""}`;
    const noteLines = order.notes?.split("\n").filter(Boolean) ?? [];

    const th = "border:1px solid #333;padding:6px 8px;font-weight:bold;text-align:center;background:#FFFF00";
    const td = "border:1px solid #aaa;padding:6px 8px";

    // Ghi chú merged cell — order-level bullet notes
    const bulletNotes = noteLines
      .map((l) => `<li style="margin:3px 0">${l.replace(/^-\s*/, "")}</li>`)
      .join("");
    const noteCell = `
      <td rowspan="${items.length}" style="${td};vertical-align:top;width:160px">
        ${bulletNotes ? `<ul style="margin:0;padding-left:16px;list-style-type:disc">${bulletNotes}</ul>` : ""}
      </td>`;

    // Hình ảnh merged cell — mockup + logo
    const imgCell = `
      <td rowspan="${items.length}" style="${td};vertical-align:middle;text-align:center;width:160px">
        ${mockupUrl
          ? `<img src="${mockupUrl}" style="width:148px;max-height:210px;object-fit:contain;display:block;margin:0 auto" />`
          : `<span style="color:#aaa;font-size:11px">Chưa có mockup</span>`}
        ${logoUrl
          ? `<img src="${logoUrl}" style="width:90px;max-height:80px;object-fit:contain;display:block;margin:10px auto 0" />`
          : ""}
      </td>`;

    const rowsHtml = items.map((item, idx) => `
      <tr>
        <td style="${td}">${item.member_name || "&nbsp;"}</td>
        <td style="${td};text-align:center;font-weight:bold;font-size:14px">${item.jersey_number || "&nbsp;"}</td>
        <td style="${td};text-align:center">${item.size}</td>
        ${idx === 0 ? noteCell : ""}
        ${idx === 0 ? imgCell : ""}
      </tr>`).join("");

    const deliveryLines = [
      order.recipient_phone   ? `SĐT nhận hàng: <b>${order.recipient_phone}</b>` : "",
      order.delivery_address  ? `Địa chỉ: <b>${order.delivery_address}</b>` : "",
      Number(order.deposit_amount) > 0 ? `Đã cọc: <b style="color:green">${Number(order.deposit_amount).toLocaleString("vi-VN")} đ</b>` : "",
      Number(order.cod_amount) > 0    ? `Thu COD còn lại: <b style="color:#c55">${Number(order.cod_amount).toLocaleString("vi-VN")} đ</b>` : "",
      order.delivery_note     ? `Ghi chú giao hàng: <b>${order.delivery_note}</b>` : "",
    ].filter(Boolean);

    const html = `<!DOCTYPE html>
<html><head><title>${title}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; padding: 24px; color: #000; }
  table { width: 100%; border-collapse: collapse; }
  @media print { @page { size: A4 landscape; margin: 12mm; } }
</style></head>
<body>
  <div style="text-align:center;font-weight:bold;font-size:14px;text-transform:uppercase;margin-bottom:16px">
    ${title}
  </div>

  <table>
    <thead>
      <tr>
        <th style="${th}">TÊN</th>
        <th style="${th}">Số trên áo</th>
        <th style="${th}">Size</th>
        <th style="${th}">Ghi chú</th>
        <th style="${th}">Hình ảnh</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>

  ${deliveryLines.length > 0 ? `
  <div style="margin-top:12px;font-size:12px;line-height:2;border-top:1px solid #ddd;padding-top:8px">
    ${deliveryLines.map((l) => `<div>${l}</div>`).join("")}
  </div>` : ""}

  <div style="margin-top:16px;text-align:right;font-size:11px;color:#666">
    Ngày ${today} · ${order.created_by_user?.name ?? ""}
  </div>
  <script>window.onload = function() { window.print(); };</script>
</body></html>`;

    const w = window.open("", "_blank", "width=820,height=700");
    if (w) {
      w.document.write(html);
      w.document.close();
      setPrinting(false);
    } else {
      setPrinting(false);
    }
  };

  if (isLoading || !order)
    return <div className="p-8 text-muted-foreground">Đang tải...</div>;

  const cfg = STATUS_CONFIG[order.status];
  const nextStatuses = NEXT_STATUS[order.status];
  const items = (order.items ?? []).sort((a, b) => a.sort_order - b.sort_order);
  const noteLines = order.notes?.split("\n").filter(Boolean) ?? [];

  return (
    <div className="p-8 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} className="mr-1" /> Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-mono">{order.order_number}</h1>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{order.style_name}</span>
              {order.contact && <> · Zalo: {order.contact}</>}
              {" · "}Tạo bởi {order.created_by_user?.name} · {new Date(order.created_at).toLocaleDateString("vi-VN")}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/team-orders/${order.id}/edit`)}>
            <Pencil size={14} className="mr-1" /> Chỉnh sửa
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} disabled={printing}>
            <Printer size={14} className="mr-1" />
            {printing ? "Đang chuẩn bị..." : "In phiếu"}
          </Button>
        </div>
      </div>

      {/* Status */}
      <Card>
        <CardHeader className="flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Trạng thái</CardTitle>
          <Badge variant={cfg.variant}>{cfg.label}</Badge>
        </CardHeader>
        {(nextStatuses.length > 0 || noteLines.length > 0) && (
          <CardContent className="space-y-2">
            {nextStatuses.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {nextStatuses.map((s) => (
                  <Button key={s} variant="outline" size="sm"
                    onClick={() => update({ id: order.id, data: { status: s } })}>
                    → {STATUS_CONFIG[s].label}
                  </Button>
                ))}
              </div>
            )}
            {noteLines.length > 0 && (
              <ul className="text-sm text-muted-foreground space-y-0.5 mt-1">
                {noteLines.map((line, i) => (
                  <li key={i}>{line.startsWith("-") ? line : `- ${line}`}</li>
                ))}
              </ul>
            )}
          </CardContent>
        )}
      </Card>

      {/* Images */}
      {(order.mockup_key || order.logo_key) && (
        <div className="grid grid-cols-2 gap-4">
          {order.mockup_key && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Mockup mẫu đã chốt</CardTitle></CardHeader>
              <CardContent>
                <div className="rounded-md overflow-hidden border h-56 flex items-center justify-center bg-muted">
                  <OptimizedImage fileKey={order.mockup_key} alt="Mockup"
                    className="w-full h-full object-contain" showLoading
                    fallbackComponent={<ImageIcon size={32} className="text-muted-foreground" />}
                  />
                </div>
              </CardContent>
            </Card>
          )}
          {order.logo_key && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Logo đội</CardTitle></CardHeader>
              <CardContent>
                <div className="rounded-md overflow-hidden border h-56 flex items-center justify-center bg-muted">
                  <OptimizedImage fileKey={order.logo_key} alt="Logo đội"
                    className="w-full h-full object-contain" showLoading
                    fallbackComponent={<ImageIcon size={32} className="text-muted-foreground" />}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Delivery & Payment */}
      {(order.recipient_phone || order.delivery_address || Number(order.deposit_amount) > 0 || Number(order.cod_amount) > 0 || order.delivery_note) && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Giao hàng & Thanh toán</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {order.recipient_phone && (
                <><dt className="text-muted-foreground">SĐT nhận hàng</dt><dd className="font-medium">{order.recipient_phone}</dd></>
              )}
              {order.delivery_address && (
                <><dt className="text-muted-foreground">Địa chỉ giao hàng</dt><dd className="font-medium">{order.delivery_address}</dd></>
              )}
              {Number(order.deposit_amount) > 0 && (
                <><dt className="text-muted-foreground">Đã cọc</dt><dd className="font-medium text-green-600">{Number(order.deposit_amount).toLocaleString("vi-VN")} đ</dd></>
              )}
              {Number(order.cod_amount) > 0 && (
                <><dt className="text-muted-foreground">Thu COD còn lại</dt><dd className="font-medium text-orange-600">{Number(order.cod_amount).toLocaleString("vi-VN")} đ</dd></>
              )}
              {order.delivery_note && (
                <><dt className="text-muted-foreground">Ghi chú giao hàng</dt><dd className="font-medium">{order.delivery_note}</dd></>
              )}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Member list */}
      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-base">Danh sách thành viên</CardTitle>
          <span className="text-sm text-muted-foreground">{items.length} người</span>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-yellow-50">
                <TableHead className="w-8 text-center">#</TableHead>
                <TableHead>Tên in lên áo</TableHead>
                <TableHead className="text-center w-24">Số áo</TableHead>
                <TableHead className="w-20">Size</TableHead>
                <TableHead>Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center text-muted-foreground text-sm">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{item.member_name || "—"}</TableCell>
                  <TableCell className="text-center font-bold text-lg">{item.jersey_number || "—"}</TableCell>
                  <TableCell><Badge variant="outline">{item.size}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{item.note || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Audit History */}
      {(order.history?.length ?? 0) > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Lịch sử thay đổi</CardTitle></CardHeader>
          <CardContent>
            <ol className="relative border-l border-muted-foreground/20 space-y-4 ml-2">
              {order.history!.map((h: TeamOrderHistory) => (
                <li key={h.id} className="pl-5 relative">
                  <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-sky-400 border-2 border-background" />
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      {new Date(h.created_at).toLocaleString("vi-VN", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                    <span className="text-xs font-medium text-sky-600">
                      {h.changed_by_name ?? h.changed_by_user?.name ?? "—"}
                    </span>
                  </div>
                  <p className="text-sm mt-0.5">{h.summary}</p>
                  {h.changes && Object.keys(h.changes).length > 0 && (
                    <ul className="mt-1 space-y-1">
                      {Object.entries(h.changes).map(([field, { old: oldVal, new: newVal }]) => (
                        <HistoryChangeRow key={field} field={field} oldVal={oldVal} newVal={newVal} />
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
