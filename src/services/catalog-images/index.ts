import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "@/utils/request.util";
import { toast } from "sonner";

export type CatalogImage = { key: string; name: string; url: string };

const getFolders = (): Promise<{ folders: string[] }> =>
  request({ url: "/catalog-images/folders", method: "GET" });

const getImages = (folder: string): Promise<{ images: CatalogImage[] }> =>
  request({ url: "/catalog-images/images", method: "GET", params: { folder } });

const getUploadUrl = (folder: string, fileName: string, contentType: string): Promise<{ uploadUrl: string; fileKey: string }> =>
  request({ url: "/catalog-images/upload-url", method: "POST", data: { folder, fileName, contentType } });

const deleteImage = (key: string): Promise<void> =>
  request({ url: "/catalog-images/image", method: "DELETE", data: { key } });

const createFolder = (name: string): Promise<{ folder: string }> =>
  request({ url: "/catalog-images/folder", method: "POST", data: { name } });

const renameFolder = (oldName: string, newName: string): Promise<{ folder: string }> =>
  request({ url: "/catalog-images/folder/rename", method: "PATCH", data: { oldName, newName } });

const deleteFolder = (name: string): Promise<{ deleted: number }> =>
  request({ url: "/catalog-images/folder", method: "DELETE", params: { name } });

export const useCatalogFolders = () =>
  useQuery({
    queryKey: ["catalog-images", "folders"],
    queryFn: getFolders,
    staleTime: 5 * 60 * 1000,
  });

export const useCatalogImages = (folder: string | null) =>
  useQuery({
    queryKey: ["catalog-images", "images", folder],
    queryFn: () => getImages(folder!),
    enabled: !!folder,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

export async function uploadCatalogImages(
  folder: string,
  files: File[],
  onProgress?: (done: number, total: number) => void,
) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const { uploadUrl } = await getUploadUrl(folder, file.name, file.type || "image/jpeg");
    await fetch(uploadUrl, { method: "PUT", body: file });
    onProgress?.(i + 1, files.length);
  }
}

export const useDeleteCatalogImage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => deleteImage(key),
    onSuccess: () => qc.refetchQueries({ queryKey: ["catalog-images", "images"] }),
  });
};

export const useCreateCatalogFolder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createFolder(name),
    onSuccess: (res) => {
      qc.refetchQueries({ queryKey: ["catalog-images", "folders"] });
      toast.success(`Đã tạo thư mục "${res.folder}"`);
    },
    onError: () => toast.error("Tạo thư mục thất bại"),
  });
};

export const useRenameCatalogFolder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ oldName, newName }: { oldName: string; newName: string }) =>
      renameFolder(oldName, newName),
    onSuccess: () => qc.refetchQueries({ queryKey: ["catalog-images", "folders"] }),
    onError: () => toast.error("Đổi tên thất bại"),
  });
};

export const useDeleteCatalogFolder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => deleteFolder(name),
    onSuccess: (res) => {
      qc.refetchQueries({ queryKey: ["catalog-images", "folders"] });
      toast.success(`Đã xóa thư mục (${res.deleted} ảnh)`);
    },
    onError: () => toast.error("Xóa thư mục thất bại"),
  });
};
