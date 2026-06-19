import { useCallback, useRef, useState } from "react";
import { Upload, X, CheckCircle2, AlertCircle, Loader2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { request } from "@/utils/request.util";

// ─── Types ──────────────────────────────────────────────────────────────────
type FileStatus = "pending" | "uploading" | "done" | "error";

type FileItem = {
  id: string;
  file: File;
  preview: string;
  status: FileStatus;
  progress: number;
  error?: string;
};

interface MultiImageUploadProps {
  folder: string;
  /** Called after every single successful upload */
  onUploaded?: () => void;
  /** Called when the entire current queue finishes (done + error) */
  onAllDone?: (done: number, failed: number) => void;
  concurrency?: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
async function getUploadUrl(folder: string, fileName: string, contentType: string) {
  return request<{ uploadUrl: string; fileKey: string }>({
    url: "/catalog-images/upload-url",
    method: "POST",
    data: { folder, fileName, contentType },
  });
}

function uploadWithProgress(
  url: string,
  file: File,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`HTTP ${xhr.status}`)));
    xhr.onerror = () => reject(new Error("Lỗi mạng"));
    xhr.ontimeout = () => reject(new Error("Timeout"));
    xhr.timeout = 120_000;
    xhr.open("PUT", url);
    xhr.send(file);
  });
}

let _id = 0;
const uid = () => `f${++_id}`;

function fmt(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const ACCEPT = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/avif"];

// ─── Component ──────────────────────────────────────────────────────────────
export function MultiImageUpload({
  folder,
  onUploaded,
  onAllDone,
  concurrency = 3,
}: MultiImageUploadProps) {
  const [items, setItems] = useState<FileItem[]>([]);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ref-based counters — not affected by React 18 batching
  const runningRef  = useRef(0);
  const queueRef    = useRef<string[]>([]);
  const pendingRef  = useRef(0); // total files not yet finished (pending + uploading)
  const doneRef     = useRef(0);
  const errorRef    = useRef(0);

  const setItemField = useCallback((id: string, patch: Partial<FileItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }, []);

  const processQueue = useCallback(() => {
    const next = () => {
      if (runningRef.current >= concurrency) return;
      const id = queueRef.current.shift();
      if (!id) return;

      runningRef.current++;
      setItemField(id, { status: "uploading", progress: 0 });

      // Capture file ref from DOM state — get it from items state is tricky
      // so we store it in a separate map
      const file = fileMapRef.current.get(id);
      if (!file) { runningRef.current--; next(); return; }

      getUploadUrl(folder, file.name, file.type || "image/jpeg")
        .then(({ uploadUrl }) =>
          uploadWithProgress(uploadUrl, file, (pct) =>
            setItemField(id, { progress: pct }),
          ),
        )
        .then(() => {
          doneRef.current++;
          setItemField(id, { status: "done", progress: 100 });
          onUploaded?.();           // ← called immediately after each file
        })
        .catch((e) => {
          errorRef.current++;
          setItemField(id, { status: "error", error: e.message ?? "Lỗi" });
        })
        .finally(() => {
          runningRef.current--;
          pendingRef.current--;
          next();

          // All queued files finished?
          if (pendingRef.current === 0 && queueRef.current.length === 0) {
            onAllDone?.(doneRef.current, errorRef.current);
            doneRef.current = 0;
            errorRef.current = 0;
          }
        });

      next(); // fill concurrency slots
    };
    next();
  }, [folder, concurrency, onUploaded, onAllDone, setItemField]);

  // Store files separately to avoid closure-over-stale-state problem
  const fileMapRef = useRef<Map<string, File>>(new Map());

  const addFiles = useCallback(
    (files: File[]) => {
      const valid = files.filter((f) => ACCEPT.includes(f.type));
      if (!valid.length) return;

      const newItems: FileItem[] = valid.map((file) => {
        const id = uid();
        fileMapRef.current.set(id, file);
        return {
          id,
          file,
          preview: URL.createObjectURL(file),
          status: "pending" as const,
          progress: 0,
        };
      });

      pendingRef.current += newItems.length;
      queueRef.current.push(...newItems.map((i) => i.id));
      setItems((prev) => [...prev, ...newItems]);
      processQueue();
    },
    [processQueue],
  );

  const removeItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.preview.startsWith("blob:")) URL.revokeObjectURL(item.preview);
      fileMapRef.current.delete(id);
      queueRef.current = queueRef.current.filter((q) => q !== id);
      // If pending, adjust counter
      if (item?.status === "pending") pendingRef.current--;
      return prev.filter((i) => i.id !== id);
    });
  };

  const clearDone = () => {
    setItems((prev) => {
      prev.filter((i) => i.status === "done" || i.status === "error").forEach((i) => {
        if (i.preview.startsWith("blob:")) URL.revokeObjectURL(i.preview);
        fileMapRef.current.delete(i.id);
      });
      return prev.filter((i) => i.status !== "done" && i.status !== "error");
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const stats = {
    total:     items.length,
    done:      items.filter((i) => i.status === "done").length,
    uploading: items.filter((i) => i.status === "uploading").length,
    error:     items.filter((i) => i.status === "error").length,
    pending:   items.filter((i) => i.status === "pending").length,
  };
  const allSettled = stats.total > 0 && stats.pending + stats.uploading === 0;

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => { e.preventDefault(); setDrag(true); }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-colors py-8",
          drag
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 bg-muted/30 hover:bg-muted/50 hover:border-muted-foreground/40",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT.join(",")}
          className="hidden"
          onChange={(e) => { addFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }}
        />
        <Upload size={28} className="text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium">Kéo thả hoặc click để chọn ảnh</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            JPG, PNG, WebP, GIF — nhiều file cùng lúc, upload {concurrency} file song song
          </p>
        </div>
      </div>

      {/* File list */}
      {items.length > 0 && (
        <div className="border rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b text-xs text-muted-foreground">
            <span>
              {stats.done}/{stats.total} ảnh xong
              {stats.uploading > 0 && ` · đang upload ${stats.uploading}`}
              {stats.error > 0 && <span className="text-red-500"> · {stats.error} lỗi</span>}
            </span>
            {allSettled && (
              <button
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                onClick={clearDone}>
                Xóa danh sách
              </button>
            )}
          </div>

          {/* Overall progress bar */}
          {!allSettled && stats.total > 0 && (
            <div className="h-1 bg-muted">
              <div
                className="h-1 bg-primary transition-all duration-300"
                style={{ width: `${(stats.done / stats.total) * 100}%` }}
              />
            </div>
          )}

          {/* Items */}
          <div className="divide-y max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-3 py-2">
                {/* Thumbnail */}
                <div className="w-9 h-9 rounded-md overflow-hidden border bg-muted shrink-0 flex items-center justify-center">
                  {item.preview
                    ? <img src={item.preview} alt="" className="w-full h-full object-cover" />
                    : <ImageIcon size={14} className="text-muted-foreground" />}
                </div>

                {/* Name + progress */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{item.file.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground shrink-0">{fmt(item.file.size)}</span>
                    {item.status === "uploading" && (
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-150"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                    {item.status === "error" && (
                      <span className="text-[10px] text-red-500 truncate">{item.error}</span>
                    )}
                    {item.status === "pending" && (
                      <span className="text-[10px] text-muted-foreground">Đang chờ...</span>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="shrink-0 w-5 flex justify-center">
                  {item.status === "done"      && <CheckCircle2 size={16} className="text-green-500" />}
                  {item.status === "uploading" && <Loader2 size={16} className="text-primary animate-spin" />}
                  {item.status === "error"     && <AlertCircle size={16} className="text-red-500" />}
                  {item.status === "pending"   && <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />}
                </div>

                {/* Remove (only non-uploading) */}
                {item.status !== "uploading" && (
                  <button
                    onClick={() => removeItem(item.id)}
                    className="shrink-0 text-muted-foreground/40 hover:text-muted-foreground">
                    <X size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
