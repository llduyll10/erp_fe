import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { CheckCircle2, AlertTriangle, Package } from "lucide-react";
import { scanAndPack } from "@/services/packing/request";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query.constant";

type ScanResult = {
  status: "packed" | "duplicate";
  external_order_id: string;
  packed_at: string;
  packed_by_name: string | null;
};

type LogEntry = ScanResult & { key: number };

export function PackingScanPage() {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const clearTimer = useRef<ReturnType<typeof setTimeout>>();
  const [log, setLog] = useState<LogEntry[]>([]);
  const keyRef = useRef(0);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const refocus = useCallback(() => {
    setValue("");
    setResult(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleScan = useCallback(async (raw: string) => {
    const id = raw.trim();
    if (!id || loading) return;

    setLoading(true);
    clearTimeout(clearTimer.current);

    try {
      const res = await scanAndPack(id);
      setResult(res);
      setLog((prev) => [{ ...res, key: ++keyRef.current }, ...prev.slice(0, 19)]);
      if (res.status === "packed") {
        qc.invalidateQueries({ queryKey: [QUERY_KEYS.PACKING.QUEUE] });
        qc.invalidateQueries({ queryKey: [QUERY_KEYS.PACKING.STATS] });
      }
      clearTimer.current = setTimeout(refocus, 2000);
    } catch {
      setResult({ status: "packed", external_order_id: id, packed_at: "", packed_by_name: null });
      // treat error as "not found"
      setResult(null);
      // show error briefly
      const errResult: ScanResult = {
        status: "duplicate",
        external_order_id: id,
        packed_at: "",
        packed_by_name: "Lỗi — không tìm thấy / không thể tạo đơn",
      };
      setResult(errResult);
      clearTimer.current = setTimeout(refocus, 2500);
    } finally {
      setLoading(false);
    }
  }, [loading, qc, refocus]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleScan(value);
  };

  // Barcode scanners often fire rapid keypresses then Enter — this handles both
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const packedCount = log.filter((l) => l.status === "packed").length;
  const dupCount    = log.filter((l) => l.status === "duplicate").length;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-start p-4 pt-10 gap-6">
      {/* Header */}
      <div className="text-center">
        <Package className="mx-auto mb-2 text-green-400" size={32} />
        <h1 className="text-2xl font-bold tracking-tight">Scan đóng gói</h1>
        <p className="text-gray-400 text-sm mt-1">Quét mã đơn TikTok để ghi nhận đóng gói</p>
      </div>

      {/* Input */}
      <div className="w-full max-w-sm">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Quét hoặc nhập mã đơn..."
          className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 text-xl h-14 text-center tracking-widest font-mono"
          autoComplete="off"
          disabled={loading}
        />
      </div>

      {/* Result card */}
      <div className="w-full max-w-sm min-h-[100px] flex items-center justify-center">
        {loading && (
          <div className="text-gray-400 text-sm animate-pulse">Đang xử lý...</div>
        )}

        {!loading && result?.status === "packed" && (
          <div className="w-full bg-green-900/50 border-2 border-green-500 rounded-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <CheckCircle2 size={40} className="mx-auto text-green-400 mb-3" />
            <p className="text-green-300 text-xs uppercase tracking-widest mb-1">Đã đóng gói</p>
            <p className="text-white text-2xl font-black font-mono">{result.external_order_id}</p>
          </div>
        )}

        {!loading && result?.status === "duplicate" && (
          <div className="w-full bg-orange-900/40 border-2 border-orange-500 rounded-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <AlertTriangle size={40} className="mx-auto text-orange-400 mb-3" />
            <p className="text-orange-300 text-xs uppercase tracking-widest mb-1">Đã quét trước đó</p>
            <p className="text-white text-2xl font-black font-mono">{result.external_order_id}</p>
            {result.packed_at && (
              <p className="text-orange-300 text-sm mt-2">
                {result.packed_by_name && <span>{result.packed_by_name} · </span>}
                {new Date(result.packed_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
            {!result.packed_at && result.packed_by_name && (
              <p className="text-orange-300 text-sm mt-2">{result.packed_by_name}</p>
            )}
          </div>
        )}

        {!loading && !result && (
          <div className="text-gray-700 text-sm select-none">—</div>
        )}
      </div>

      {/* Session stats */}
      {log.length > 0 && (
        <div className="w-full max-w-sm flex gap-3 text-center">
          <div className="flex-1 bg-gray-900 rounded-xl py-3">
            <p className="text-3xl font-black text-green-400">{packedCount}</p>
            <p className="text-gray-500 text-xs mt-0.5">Đã đóng gói</p>
          </div>
          {dupCount > 0 && (
            <div className="flex-1 bg-gray-900 rounded-xl py-3">
              <p className="text-3xl font-black text-orange-400">{dupCount}</p>
              <p className="text-gray-500 text-xs mt-0.5">Trùng</p>
            </div>
          )}
        </div>
      )}

      {/* Recent log */}
      {log.length > 0 && (
        <div className="w-full max-w-sm space-y-1">
          <p className="text-gray-600 text-xs uppercase tracking-widest mb-2">Vừa quét</p>
          {log.map((entry) => (
            <div key={entry.key}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-mono ${
                entry.status === "packed"
                  ? "bg-green-900/20 text-green-300"
                  : "bg-orange-900/20 text-orange-300"
              }`}>
              <span>{entry.external_order_id}</span>
              <span className="text-xs opacity-60">
                {entry.status === "packed" ? "✓" : "⚠"}
                {entry.packed_at
                  ? " " + new Date(entry.packed_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
                  : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
