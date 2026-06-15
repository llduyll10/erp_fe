"use client";

import * as React from "react";
import { NavLink } from "react-router-dom";
import {
	LayoutDashboard,
	Shirt,
	Warehouse,
	Factory,
	ShoppingCart,
	Printer,
	Package,
	Users,
	Settings,
	List,
	Plus,
	ArrowDown,
	ArrowUp,
	ClipboardList,
	ScanLine,
	AlertTriangle,
	Truck,
	CheckSquare,
	Image,
	BarChart3,
	History,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { UserRoleEnum } from "@/enums/user.enums";
import { hasMinimumRole } from "@/constants/user.constant";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";

function getCurrentRole(): UserRoleEnum {
	const storeUser = useAuthStore.getState().user;
	if (storeUser && storeUser.role) return storeUser.role as UserRoleEnum;
	try {
		const user = JSON.parse(localStorage.getItem("auth_user") || "null");
		return (user?.role as UserRoleEnum) || UserRoleEnum.USER;
	} catch {
		return UserRoleEnum.USER;
	}
}

const MENU_GROUPS = [
	{
		title: "Tổng quan",
		icon: LayoutDashboard,
		items: [
			{ title: "Dashboard", url: "/dashboard/products", icon: BarChart3 },
		],
	},
	{
		title: "Sản phẩm",
		icon: Shirt,
		items: [
			{ title: "Danh sách mẫu", url: "/dashboard/products", icon: List },
			{ title: "Tạo mẫu mới", url: "/dashboard/products/create", icon: Plus },
			{ title: "Catalog Sales", url: "/dashboard/sales-catalog", icon: Image },
		],
	},
	{
		title: "Kho hàng",
		icon: Warehouse,
		items: [
			{
				title: "Tồn kho",
				url: "/dashboard/warehouse/inventory",
				icon: BarChart3,
			},
			{
				title: "Nhập kho",
				url: "/dashboard/warehouse/import",
				icon: ArrowDown,
			},
			{ title: "Xuất kho", url: "/dashboard/warehouse/export", icon: ArrowUp },
			{
				title: "Lịch sử nhập",
				url: "/dashboard/warehouse/import/history",
				icon: History,
			},
			{
				title: "Lịch sử xuất",
				url: "/dashboard/warehouse/export/history",
				icon: History,
			},
		],
	},
	{
		title: "Sản xuất",
		icon: Factory,
		items: [
			{
				title: "Lệnh sản xuất",
				url: "/dashboard/production/orders",
				icon: ClipboardList,
			},
			{
				title: "Tạo lệnh SX",
				url: "/dashboard/production/orders/create",
				icon: Plus,
			},
			{
				title: "Nhập kho từ SX",
				url: "/dashboard/production/stock-in",
				icon: ArrowDown,
			},
		],
	},
	{
		title: "Đơn hàng",
		icon: ShoppingCart,
		items: [
			{
				title: "Import TikTok/Sheet",
				url: "/dashboard/orders/import",
				icon: ArrowDown,
			},
			{
				title: "Danh sách đơn",
				url: "/dashboard/orders",
				icon: List,
			},
		],
	},
	{
		title: "In tên số",
		icon: Printer,
		items: [
			{
				title: "Danh sách print job",
				url: "/dashboard/printing/jobs",
				icon: List,
			},
			{
				title: "Quét barcode",
				url: "/dashboard/printing/scan",
				icon: ScanLine,
			},
			{
				title: "Lỗi in",
				url: "/dashboard/printing/errors",
				icon: AlertTriangle,
			},
		],
	},
	{
		title: "Đóng gói",
		icon: Package,
		items: [
			{
				title: "Chờ đóng gói",
				url: "/dashboard/packing/queue",
				icon: ClipboardList,
			},
			{
				title: "Quét đóng gói",
				url: "/dashboard/packing/scan",
				icon: ScanLine,
			},
			{
				title: "Đã gửi bưu cục",
				url: "/dashboard/packing/shipped",
				icon: Truck,
			},
		],
	},
	{
		title: "Nhân sự",
		icon: Users,
		items: [
			{
				title: "Nhân viên",
				url: "/dashboard/hr/employees",
				icon: Users,
			},
			{
				title: "Phòng ban",
				url: "/dashboard/hr/departments",
				icon: CheckSquare,
			},
			{
				title: "Phân quyền",
				url: "/dashboard/users",
				icon: Settings,
			},
		],
	},
	{
		title: "Cài đặt",
		icon: Settings,
		items: [
			{
				title: "Thông tin công ty",
				url: "/dashboard/settings/company",
				icon: Settings,
			},
			{
				title: "Sản phẩm & Size",
				url: "/dashboard/settings/product",
				icon: Shirt,
			},
			{
				title: "Lưu trữ ảnh",
				url: "/dashboard/settings/storage",
				icon: Image,
			},
		],
	},
];

function SidebarMenu() {
	const role = getCurrentRole();
	const isAdmin = hasMinimumRole(role, UserRoleEnum.ADMIN);

	const groups = isAdmin
		? MENU_GROUPS
		: MENU_GROUPS.filter((g) =>
				["Tổng quan", "Sản phẩm"].includes(g.title)
			);

	return (
		<div className="flex flex-col gap-4 py-2">
			{groups.map((group) => (
				<div key={group.title}>
					<div className="flex items-center gap-2 px-4 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
						{React.createElement(group.icon, { size: 14 })}
						<span className="group-data-[collapsible=icon]:hidden">
							{group.title}
						</span>
					</div>
					<ul>
						{group.items.map((item) => (
							<li key={item.title}>
								<NavLink
									to={item.url}
									className={({ isActive }) =>
										`flex items-center gap-2 px-6 py-1.5 text-sm rounded-md mx-1 transition-colors ${
											isActive
												? "text-sky-600 font-medium bg-sky-50"
												: "text-gray-600 hover:text-sky-500 hover:bg-gray-50"
										}`
									}>
									{React.createElement(item.icon, { size: 14 })}
									<span className="group-data-[collapsible=icon]:hidden">
										{item.title}
									</span>
								</NavLink>
							</li>
						))}
					</ul>
				</div>
			))}
		</div>
	);
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<div className="px-4 py-3 group-data-[collapsible=icon]:hidden">
					<div className="text-base font-bold text-sky-700">Trường Phát Sport</div>
					<div className="text-xs text-muted-foreground">Quản lý nội bộ</div>
				</div>
			</SidebarHeader>
			<SidebarContent className="overflow-y-auto">
				<SidebarMenu />
			</SidebarContent>
			<SidebarFooter />
			<SidebarRail />
		</Sidebar>
	);
}
