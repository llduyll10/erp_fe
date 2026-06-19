import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCatalogFolders, useCatalogImages,
  useDeleteCatalogImage, useCreateCatalogFolder,
  useRenameCatalogFolder, useDeleteCatalogFolder,
  type CatalogImage,
} from "@/services/catalog-images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import {
  Folder, FolderOpen, FolderPlus, Images, X, ChevronLeft, ChevronRight,
  Loader2, Upload, Download, Trash2, Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function CatalogImagesPage() {
  const qc = useQueryClient();

  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<CatalogImage | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteFolderConfirm, setDeleteFolderConfirm] = useState<string | null>(null);

  const { data: foldersData, isLoading: loadingFolders } = useCatalogFolders();
  const { data: imagesData, isLoading: loadingImages } = useCatalogImages(selectedFolder);
  const { mutate: deleteImage, isPending: deleting } = useDeleteCatalogImage();
  const { mutate: createFolder, isPending: creatingFolder } = useCreateCatalogFolder();
  const { mutate: renameFolder, isPending: renaming } = useRenameCatalogFolder();
  const { mutate: deleteFolder, isPending: deletingFolder } = useDeleteCatalogFolder();

  const folders = foldersData?.folders ?? [];
  const images = imagesData?.images ?? [];

  const selectFolder = (folder: string) => {
    setSelectedFolder(folder);
    setShowUpload(false);
  };

  // --- Download ---
  const downloadImage = async (img: CatalogImage) => {
    try {
      const res = await fetch(img.url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = img.name;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      toast.error("Tải về thất bại");
    }
  };

  // --- Delete ---
  const confirmDelete = () => {
    if (!deleteConfirm) return;
    deleteImage(deleteConfirm.key, {
      onSuccess: () => {
        toast.success(`Đã xóa ${deleteConfirm.name}`);
        if (lightbox !== null) setLightbox(null);
        setDeleteConfirm(null);
      },
      onError: () => toast.error("Xóa thất bại"),
    });
  };

  const prev = () => setLightbox((i) => (i! > 0 ? i! - 1 : images.length - 1));
  const next = () => setLightbox((i) => (i! < images.length - 1 ? i! + 1 : 0));

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">

      {/* ── Left panel ── */}
      <aside className="w-60 shrink-0 border-r bg-muted/30 flex flex-col">
        <div className="px-4 py-3 border-b space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Ảnh sản phẩm bán sàn</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{folders.length} mẫu</p>
            </div>
            <Button
              size="icon" variant="ghost"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Tạo thư mục mới"
              onClick={() => { setShowNewFolder(true); setNewFolderName(""); }}>
              <FolderPlus size={16} />
            </Button>
          </div>

          {showNewFolder && (
            <div className="flex gap-1">
              <Input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newFolderName.trim()) {
                    createFolder(newFolderName.trim(), {
                      onSuccess: (res) => { setShowNewFolder(false); selectFolder(res.folder); },
                    });
                  }
                  if (e.key === "Escape") setShowNewFolder(false);
                }}
                placeholder="Tên thư mục..."
                className="h-7 text-xs flex-1"
              />
              <Button
                size="sm" className="h-7 px-2 text-xs"
                disabled={!newFolderName.trim() || creatingFolder}
                onClick={() => createFolder(newFolderName.trim(), {
                  onSuccess: (res) => { setShowNewFolder(false); selectFolder(res.folder); },
                })}>
                {creatingFolder ? <Loader2 size={11} className="animate-spin" /> : "Tạo"}
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {loadingFolders && (
            <div className="flex items-center gap-2 px-4 py-3 text-muted-foreground text-sm">
              <Loader2 size={14} className="animate-spin" /> Đang tải...
            </div>
          )}
          {!loadingFolders && folders.length === 0 && (
            <div className="px-4 py-6 text-xs text-muted-foreground text-center">
              Chưa có thư mục nào.<br />
              Nhấn <FolderPlus size={11} className="inline" /> để tạo mới.
            </div>
          )}
          {folders.map((folder) => (
            <div key={folder} className="group relative">
              {renamingFolder === folder ? (
                /* Inline rename input */
                <div className="flex items-center gap-1 px-3 py-1.5">
                  <Input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && renameValue.trim() && renameValue !== folder) {
                        renameFolder({ oldName: folder, newName: renameValue.trim() }, {
                          onSuccess: (res) => {
                            if (selectedFolder === folder) setSelectedFolder(res.folder);
                            setRenamingFolder(null);
                          },
                        });
                      }
                      if (e.key === "Escape") setRenamingFolder(null);
                    }}
                    className="h-7 text-xs flex-1"
                    disabled={renaming}
                  />
                  {renaming
                    ? <Loader2 size={13} className="animate-spin text-muted-foreground" />
                    : <button onClick={() => setRenamingFolder(null)} className="text-muted-foreground hover:text-foreground"><X size={13} /></button>
                  }
                </div>
              ) : (
                <button
                  onClick={() => selectFolder(folder)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left transition-colors hover:bg-accent pr-16",
                    selectedFolder === folder
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "text-foreground",
                  )}>
                  {selectedFolder === folder
                    ? <FolderOpen size={15} className="shrink-0" />
                    : <Folder size={15} className="shrink-0 text-amber-500" />}
                  <span className="truncate">{folder}</span>
                </button>
              )}

              {/* Hover actions */}
              {renamingFolder !== folder && (
                <div className={cn(
                  "absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity",
                  selectedFolder === folder ? "opacity-100" : "",
                )}>
                  <button
                    title="Đổi tên"
                    onClick={(e) => { e.stopPropagation(); setRenamingFolder(folder); setRenameValue(folder); }}
                    className={cn(
                      "p-1 rounded hover:bg-black/10",
                      selectedFolder === folder ? "text-primary-foreground/70 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    )}>
                    <Pencil size={12} />
                  </button>
                  <button
                    title="Xóa thư mục"
                    onClick={(e) => { e.stopPropagation(); setDeleteFolderConfirm(folder); }}
                    className={cn(
                      "p-1 rounded hover:bg-red-500/20",
                      selectedFolder === folder ? "text-primary-foreground/70 hover:text-red-300" : "text-muted-foreground hover:text-red-500",
                    )}>
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* ── Right panel ── */}
      <main className="flex-1 overflow-y-auto">
        {!selectedFolder ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <Images size={48} className="opacity-30" />
            <p className="text-sm">Chọn một mẫu để xem ảnh</p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen size={16} className="text-amber-500" />
                <h3 className="font-semibold text-base">{selectedFolder}</h3>
                {!loadingImages && (
                  <span className="text-muted-foreground text-sm">· {images.length} ảnh</span>
                )}
              </div>
              <Button
                size="sm"
                variant={showUpload ? "secondary" : "default"}
                onClick={() => setShowUpload((v) => !v)}>
                <Upload size={14} className="mr-1.5" />
                {showUpload ? "Đóng" : "Tải ảnh lên"}
              </Button>
            </div>

            {/* Upload panel */}
            {showUpload && (
              <div className="border rounded-xl p-4 bg-muted/20">
                <MultiImageUpload
                  folder={selectedFolder}
                  concurrency={3}
                  onUploaded={() =>
                    qc.refetchQueries({ queryKey: ["catalog-images", "images", selectedFolder] })
                  }
                  onAllDone={(done, failed) => {
                    if (done > 0) toast.success(`Đã upload ${done} ảnh${failed > 0 ? `, ${failed} lỗi` : ""}`);
                    else if (failed > 0) toast.error(`${failed} ảnh lỗi`);
                  }}
                />
              </div>
            )}

            {/* Image grid */}
            {loadingImages && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm py-16">
                <Loader2 size={16} className="animate-spin" /> Đang tải ảnh...
              </div>
            )}
            {!loadingImages && images.length === 0 && !showUpload && (
              <div className="text-center py-16 text-muted-foreground text-sm">
                Thư mục này chưa có ảnh — nhấn "Tải ảnh lên" để bắt đầu
              </div>
            )}

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {images.map((img, idx) => (
                <div key={img.key} className="group relative aspect-square rounded-lg overflow-hidden border bg-muted">
                  <img
                    src={img.url}
                    alt={img.name}
                    onClick={() => setLightbox(idx)}
                    className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors pointer-events-none" />
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => downloadImage(img)}
                      className="p-1 rounded bg-black/60 text-white hover:bg-black/80">
                      <Download size={13} />
                    </button>
                    <button onClick={() => setDeleteConfirm(img)}
                      className="p-1 rounded bg-black/60 text-white hover:bg-red-600/80">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <p className="text-white text-[10px] truncate">{img.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Lightbox ── */}
      {lightbox !== null && images[lightbox] && (
        <div className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center"
          onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10">
            <X size={22} />
          </button>
          {images.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10">
              <ChevronLeft size={32} />
            </button>
          )}
          <img src={images[lightbox].url} alt={images[lightbox].name}
            className="max-h-[88vh] max-w-[88vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} />
          {images.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10">
              <ChevronRight size={32} />
            </button>
          )}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <p className="text-white/60 text-sm">{images[lightbox].name}</p>
            <p className="text-white/40 text-xs">{lightbox + 1} / {images.length}</p>
            <div className="flex gap-2 mt-1">
              <Button size="sm" variant="secondary"
                onClick={(e) => { e.stopPropagation(); downloadImage(images[lightbox]); }}>
                <Download size={14} className="mr-1.5" /> Tải về
              </Button>
              <Button size="sm" variant="destructive"
                onClick={(e) => { e.stopPropagation(); setDeleteConfirm(images[lightbox]); }}>
                <Trash2 size={14} className="mr-1.5" /> Xóa
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete folder confirm ── */}
      {deleteFolderConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4"
          onClick={() => setDeleteFolderConfirm(null)}>
          <div className="bg-background rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-base">Xóa thư mục?</h3>
            <p className="text-sm text-muted-foreground">
              Xóa <span className="font-medium text-foreground">"{deleteFolderConfirm}"</span> và tất cả ảnh bên trong khỏi S3. Không thể hoàn tác.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setDeleteFolderConfirm(null)}>Hủy</Button>
              <Button variant="destructive" size="sm" disabled={deletingFolder}
                onClick={() => deleteFolder(deleteFolderConfirm, {
                  onSuccess: () => {
                    if (selectedFolder === deleteFolderConfirm) setSelectedFolder(null);
                    setDeleteFolderConfirm(null);
                  },
                })}>
                {deletingFolder ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
                Xóa thư mục
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete image confirm ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4"
          onClick={() => setDeleteConfirm(null)}>
          <div className="bg-background rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-base">Xóa ảnh?</h3>
            <p className="text-sm text-muted-foreground">
              Xóa <span className="font-medium text-foreground">{deleteConfirm.name}</span> khỏi S3. Không thể hoàn tác.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>Hủy</Button>
              <Button variant="destructive" size="sm" disabled={deleting} onClick={confirmDelete}>
                {deleting ? <Loader2 size={14} className="animate-spin mr-1" /> : null} Xóa
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
