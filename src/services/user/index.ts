import { useMutation, useQuery } from "@tanstack/react-query";
import { getUserList, inviteUser, inviteUserChangePassword } from "./request";
import {
	InviteUserChangePasswordRequest,
	InviteUserRequest,
	GetUserListRequest,
} from "@/interfaces/auth.interface";
import { QUERY_KEYS } from "@/constants/query.constant";
import { UserRoleEnum } from "@/enums/user.enums";
import { User } from "@/models/user.model";

export const useInviteUser = () => {
	return useMutation({
		mutationFn: async (data: InviteUserRequest) => {
			const response = await inviteUser(data);
			return response;
		},
	});
};

export const useInviteUserChangePassword = () => {
	return useMutation({
		mutationFn: async (data: InviteUserChangePasswordRequest) => {
			const response = await inviteUserChangePassword(data);
			return response;
		},
	});
};

export const useGetUserList = (params?: GetUserListRequest, enabled = true) => {
	return useQuery({
		queryKey: [QUERY_KEYS.USER.LIST, params],
		queryFn: () => getUserList(params),
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

export const useSalesRepresentativeQuery = (searchQuery: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.USER.SALES_REPS, searchQuery],
		queryFn: async () => {
			const response = await getUserList({
				q: searchQuery.trim() || undefined,
				limit: 50, // Get more items to filter on frontend
				page: 1,
			});
			
			// Filter to only sales representatives
			const salesRepresentatives = response.data.filter(
				(user: User) =>
					user.role === UserRoleEnum.SALE_ADMIN ||
					user.role === UserRoleEnum.SALE_MEMBER
			);
			
			return salesRepresentatives;
		},
		enabled: true,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};
