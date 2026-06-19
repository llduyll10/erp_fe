import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getTeamOrders, getTeamOrder, createTeamOrder,
  updateTeamOrder,
} from "./request";
import { toast } from "sonner";

const KEY = { LIST: "teamOrderList", DETAIL: "teamOrderDetail" };

export const useGetTeamOrders = (params?: { q?: string; page?: number; limit?: number; status?: string }) =>
  useQuery({ queryKey: [KEY.LIST, params], queryFn: () => getTeamOrders(params) });

export const useGetTeamOrder = (id: string) =>
  useQuery({ queryKey: [KEY.DETAIL, id], queryFn: () => getTeamOrder(id), enabled: !!id });

export const useCreateTeamOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTeamOrder,
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY.LIST] }); toast.success("Đã tạo đơn đội"); },
  });
};

export const useUpdateTeamOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateTeamOrder>[1] }) =>
      updateTeamOrder(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [KEY.LIST] });
      qc.invalidateQueries({ queryKey: [KEY.DETAIL, id] });
      toast.success("Đã cập nhật");
    },
  });
};

