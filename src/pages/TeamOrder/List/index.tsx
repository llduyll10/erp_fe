import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, RefreshCw, Search } from "lucide-react";
import { useGetTeamOrders } from "@/services/team-order";
import type { TeamOrderStatus } from "@/models/team-order.model";

const STATUS_CONFIG: Record<TeamOrderStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft:         { label: "Mới tạo",       variant: "secondary" },
  confirmed:     { label: "Đã chốt",       variant: "default" },
  in_production: { label: "Đang sản xuất", variant: "default" },
  done:          { label: "Hoàn thành",    variant: "outline" },
  cancelled:     { label: "Đã hủy",        variant: "destructive" },
};

export function TeamOrderListPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useGetTeamOrders({ q: search || undefined, page, limit: 20 });
  const orders = data?.data ?? [];

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Đơn đội</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </Button>
          <Button size="sm" onClick={() => navigate("/dashboard/team-orders/create")}>
            <Plus size={14} className="mr-1" /> Tạo đơn đội
          </Button>
        </div>
      </div>

      <div className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8" placeholder="Tìm mã, tên mẫu, liên hệ..."
            value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setSearch(q), setPage(1))}
          />
        </div>
        <Button size="sm" onClick={() => { setSearch(q); setPage(1); }}>Tìm</Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Tên mẫu</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead className="text-center">Số người</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Đang tải...</TableCell></TableRow>
            ) : orders.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Chưa có đơn nào</TableCell></TableRow>
            ) : orders.map((o) => (
              <TableRow key={o.id} className="cursor-pointer hover:bg-muted/40"
                onClick={() => navigate(`/dashboard/team-orders/${o.id}`)}>
                <TableCell className="font-mono font-semibold">{o.order_number}</TableCell>
                <TableCell className="font-medium">{o.style_name}</TableCell>
                <TableCell className="text-muted-foreground">{o.contact ?? "—"}</TableCell>
                <TableCell className="text-center">{o.items?.length ?? 0} người</TableCell>
                <TableCell>
                  <Badge variant={STATUS_CONFIG[o.status].variant}>{STATUS_CONFIG[o.status].label}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(o.created_at).toLocaleDateString("vi-VN")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {(data?.total ?? 0) > 20 && (
        <div className="flex gap-2 justify-end text-sm">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Trước</Button>
          <span className="px-3 py-1 rounded border">{page}</span>
          <Button variant="outline" size="sm" disabled={orders.length < 20} onClick={() => setPage((p) => p + 1)}>Sau</Button>
        </div>
      )}
    </div>
  );
}
