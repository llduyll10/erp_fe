import Table from "@/components/molecules/table";
import { cn } from "@/lib/utils";
import { AddUserModal } from "./AddUserModal";

interface User {
	id: number;
	name: string;
	email: string;
	role: string;
}

const users: User[] = [
	{ id: 1, name: "Alice", email: "alice@example.com", role: "admin" },
	{ id: 2, name: "Bob", email: "bob@example.com", role: "user" },
	{ id: 3, name: "Charlie", email: "charlie@example.com", role: "user" },
];

const columns = [
	{ headerName: "ID", field: "id", width: 80 },
	{ headerName: "Name", field: "name", flex: 1 },
	{ headerName: "Email", field: "email", flex: 1 },
	{ headerName: "Role", field: "role", width: 120 },
];

export function UserManagementPage() {
	return (
		<div className="flex flex-col gap-4">
			<h1 className="text-2xl font-bold">Users Management</h1>
			<AddUserModal />
			<div className="w-full">
				<div className="flex flex-col border border-none rounded-md">
					<Table
						className={cn(
							"mt-[12px] gray-highlight-table",
							!users?.length && "h-[150px]"
						)}
						rowData={users}
						columnDefs={columns}
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
						domLayout={users && users.length > 0 ? "autoHeight" : "normal"}
					/>
				</div>
			</div>
		</div>
	);
}
