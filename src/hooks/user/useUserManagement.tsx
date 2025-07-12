import { useGetUserList } from "@/services/user";
import { type ColDef, type ICellRendererParams } from "ag-grid-community";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import type { User } from "@/models/user.model";
import type { GetUserListRequest } from "@/interfaces/auth.interface";
import { usePagination } from "../common/usePagination";
import { useTranslation } from "react-i18next";

const useUserManagement = () => {
	const { t } = useTranslation("common");
	const [searchParams, setSearchParams] = useState<
		Omit<GetUserListRequest, "page" | "limit" | "offset">
	>({});

	const pagination = usePagination({
		initialPage: 1,
		initialLimit: 10,
	});

	// Prepare query parameters
	const queryParams: GetUserListRequest = {
		page: pagination.paginationState.current_page,
		limit: pagination.paginationState.records_per_page,
		...searchParams,
	};

	const {
		data: userListResponse,
		isLoading: isGetUserListPending,
		error,
		refetch,
	} = useGetUserList(queryParams);

	// Update pagination state when data changes
	useEffect(() => {
		if (userListResponse) {
			pagination.updatePagination({
				current_page: userListResponse.pagination?.current_page || 1,
				records_per_page: userListResponse.pagination?.records_per_page || 10,
				total_pages: userListResponse.pagination?.total_pages || 0,
				total_records: userListResponse.pagination?.total_records || 0,
			});
		}
	}, [userListResponse, pagination.updatePagination]);

	const colDefs: ColDef<User>[] = [
		{
			headerName: t("modules.users.columns.name"),
			field: "name",
			flex: 1,
		},
		{
			headerName: t("modules.users.columns.email"),
			field: "email",
			flex: 1,
		},
		{
			headerName: t("modules.users.columns.role"),
			field: "role",
			width: 120,
		},
		{
			headerName: t("modules.users.columns.createdAt"),
			field: "created_at",
			width: 120,
			cellRenderer: (params: ICellRendererParams) =>
				params.data.created_at ?
					dayjs(params.data.created_at).format("DD/MM/YYYY")
				:	"",
		},
		{
			headerName: t("modules.users.columns.updatedAt"),
			field: "updated_at",
			width: 120,
			cellRenderer: (params: ICellRendererParams) =>
				params.data.updated_at ?
					dayjs(params.data.updated_at).format("DD/MM/YYYY")
				:	"",
		},
	];

	// Search and filter functions
	const setSearch = (search: string) => {
		setSearchParams((prev) => ({ ...prev, q: search }));
		pagination.setPage(1); // Reset to first page when searching
	};

	const setRoleFilter = (role: string) => {
		setSearchParams((prev) => ({ ...prev, role }));
		pagination.setPage(1); // Reset to first page when filtering
	};

	const setStatusFilter = (status: string) => {
		setSearchParams((prev) => ({ ...prev, status }));
		pagination.setPage(1); // Reset to first page when filtering
	};

	const setSortBy = (sortBy: string, sortOrder: "asc" | "desc") => {
		setSearchParams((prev) => ({ ...prev, sortBy, sortOrder }));
	};

	const clearFilters = () => {
		setSearchParams({});
		pagination.setPage(1);
	};

	return {
		// Data
		userList: userListResponse?.data || [],
		total: userListResponse?.pagination?.total_records || 0,
		isGetUserListPending,
		error,
		colDefs,

		// Pagination
		pagination: pagination.paginationState,
		setPage: pagination.setPage,
		setLimit: pagination.setLimit,
		nextPage: pagination.nextPage,
		prevPage: pagination.prevPage,
		goToFirstPage: pagination.goToFirstPage,
		goToLastPage: pagination.goToLastPage,
		canGoNext: pagination.canGoNext,
		canGoPrev: pagination.canGoPrev,

		// Search and filters
		searchParams,
		setSearch,
		setRoleFilter,
		setStatusFilter,
		setSortBy,
		clearFilters,

		// Actions
		refetch,
	};
};

export default useUserManagement;
