import { request } from "@/utils/request.util";
import type { TeamOrder, TeamOrderStatus } from "@/models/team-order.model";

type ListResponse = { data: TeamOrder[]; total: number; page: number; limit: number };

export const getTeamOrders = (params?: {
  q?: string; page?: number; limit?: number; status?: string;
}): Promise<ListResponse> => request({ url: "/team-orders", method: "GET", params });

export const getTeamOrder = (id: string): Promise<TeamOrder> =>
  request({ url: `/team-orders/${id}`, method: "GET" });

type TeamOrderPayload = {
  style_name: string;
  contact?: string;
  notes?: string;
  logo_key?: string;
  mockup_key?: string;
  delivery_address?: string;
  recipient_phone?: string;
  deposit_amount?: number;
  cod_amount?: number;
  delivery_note?: string;
  items: { member_name: string; jersey_number: string; size: string; note?: string }[];
};

export const createTeamOrder = (data: TeamOrderPayload): Promise<TeamOrder> =>
  request({ url: "/team-orders", method: "POST", data });

export const updateTeamOrder = (
  id: string,
  data: Partial<TeamOrderPayload & { status: TeamOrderStatus }>,
): Promise<TeamOrder> => request({ url: `/team-orders/${id}`, method: "PUT", data });
