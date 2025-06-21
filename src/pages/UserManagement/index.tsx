import Table from "@/components/molecules/table";
import { cn } from "@/lib/utils";
import { AddUserModal } from "./AddUserModal";
import useUserManagement from "@/hooks/user/useUserManagement";
import Loading from "@/components/layout/loading";

export function UserManagementPage() {
	const { userList, isGetUserListPending, colDefs } = useUserManagement();

	if (isGetUserListPending) {
		return <Loading />;
	}

	return (
		<div className="flex flex-col gap-4">
			<h1 className="text-2xl font-bold">Users Management</h1>
			<AddUserModal />
			<div className="w-full">
				<div className="flex flex-col border border-none rounded-md">
					<Table
						className={cn(
							"mt-[12px] gray-highlight-table",
							!userList?.data?.length && "h-[150px]"
						)}
						rowData={userList?.data}
						columnDefs={colDefs}
						pagination={false}
						onSortChanged={() => {}}
						onFirstDataRendered={() => {}}
						isLoading={false}
						popupParent={null}
						suppressRowHoverHighlight={false}
						noRowsOverlayClassName="top-[50px]"
						gridOptions={{
							headerHeight: 60,
							rowHeight: 72,
							suppressRowHoverHighlight: true,
							defaultColDef: {
								sortable: true,
								editable: false,
								resizable: true,
								headerClass: [
									"!text-lg",
									"text-text-default",
									"bg-background-grayDark",
									"text-left",
									"[&_.ag-header-cell-label]:justify-start",
									"[&_.ag-header-cell-label]:pl-[16px]",
								],
							},
						}}
						domLayout={
							userList?.data && userList?.data?.length > 0 ?
								"autoHeight"
							:	"normal"
						}
					/>
				</div>
			</div>
		</div>
	);
}
