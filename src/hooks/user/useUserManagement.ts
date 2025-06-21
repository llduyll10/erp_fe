import { useGetUserList } from "@/services/user";
import { type ColDef, type ICellRendererParams } from "ag-grid-community";
import dayjs from "dayjs";
import { useEffect } from "react";
import type { User } from "@/models/user.model";

const useUserManagement = () => {
	const {
		data: userList,
		isPending: isGetUserListPending,
		mutate: getUserList,
	} = useGetUserList();

	useEffect(() => {
		getUserList();
	}, []);

	const colDefs: ColDef<User>[] = [
		{
			headerName: "Name",
			field: "name",
			flex: 1,
		},
		{
			headerName: "Email",
			field: "email",
			flex: 1,
		},
		{
			headerName: "Role",
			field: "role",
			width: 120,
		},
		{
			headerName: "Created At",
			field: "created_at",
			width: 120,
			cellRenderer: (params: ICellRendererParams) =>
				params.data.created_at ?
					dayjs(params.data.created_at).format("DD/MM/YYYY")
				:	"",
		},
		{
			headerName: "Updated At",
			field: "updated_at",
			width: 120,
			cellRenderer: (params: ICellRendererParams) =>
				params.data.updated_at ?
					dayjs(params.data.updated_at).format("DD/MM/YYYY")
				:	"",
		},
	];

	return { userList, isGetUserListPending, colDefs };
};

export default useUserManagement;
