"use client";

import * as React from "react";
import {
	ShoppingCart,
	Users,
	List,
	Grid,
	FileText,
	User,
	UserCheck,
	User2,
	CreditCard,
	Plus,
	Box,
	CheckSquare,
	Warehouse,
	ArrowUp,
	ArrowDown,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useTranslation } from "react-i18next";
import { UserRoleEnum } from "@/enums/user.enums";
import { hasMinimumRole, isInDepartment } from "@/constants/user.constant";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { useMemo } from "react";

// Helper to get role from store or localStorage
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

const adminMenu = (t: any) =>
	useMemo(
		() => [
			{
				title: t("products.title"),
				icon: Box,
				items: [
					{ title: t("products.list"), url: "/dashboard/products", icon: List },
					{
						title: t("products.create"),
						url: "/dashboard/products/create",
						icon: Plus,
					},
				],
			},
			{
				title: "Người dùng",
				icon: Users,
				items: [
					{
						title: "Danh sách người dùng",
						url: "/dashboard/users",
						icon: List,
					},
				],
			},
			{
				title: "Khách hàng",
				icon: User,
				items: [
					{
						title: "Danh sách khách hàng",
						url: "/dashboard/customers",
						icon: List,
					},
					{
						title: "Tạo khách hàng",
						url: "/dashboard/customers/create",
						icon: Plus,
					},
				],
			},
			{
				title: "Đơn hàng",
				icon: CreditCard,
				items: [
					{
						title: "Danh sách đơn hàng",
						url: "/dashboard/orders",
						icon: List,
					},
					{
						title: "Tạo đơn hàng",
						url: "/dashboard/orders/create",
						icon: Plus,
					},
				],
			},
			{
				title: "Kho hàng",
				icon: Warehouse,
				items: [
					{
						title: "Kiểm tra tồn kho",
						url: "/dashboard/warehouse/inventory",
						icon: Box,
					},
					{
						title: "Nhập kho",
						url: "/dashboard/warehouse/import",
						icon: ArrowDown,
					},
					{
						title: "Xuất kho",
						url: "/dashboard/warehouse/export",
						icon: ArrowUp,
					},
					{
						title: "Lịch sử nhập kho",
						url: "/dashboard/warehouse/import/history",
						icon: ArrowDown,
					},
					{
						title: "Lịch sử xuất kho",
						url: "/dashboard/warehouse/export/history",
						icon: ArrowUp,
					},
				],
			},
		],
		[t]
	);

const userMenu = (t: any) =>
	useMemo(
		() => [
			{
				title: t("products.title"),
				icon: Box,
				items: [
					{ title: t("products.list"), url: "/dashboard/products", icon: List },
					{
						title: t("products.create"),
						url: "/dashboard/products/create",
						icon: Plus,
					},
				],
			},
			{
				title: t("orders.title"),
				icon: CreditCard,
				items: [
					{ title: t("orders.list"), url: "/orders", icon: CheckSquare },
					{ title: t("orders.detail"), url: "/orders/detail", icon: FileText },
					{ title: t("orders.cart"), url: "/cart", icon: ShoppingCart },
					{ title: t("orders.checkout"), url: "/checkout", icon: CreditCard },
				],
			},
		],
		[t]
	);

function SidebarMenu() {
	const role = getCurrentRole();
	const { t } = useTranslation();

	// Determine menu based on role hierarchy
	const isAdmin = hasMinimumRole(role, UserRoleEnum.ADMIN);
	const menu = isAdmin ? adminMenu(t) : userMenu(t);
	return (
		<div className="flex flex-col gap-6">
			{menu.map((group) => (
				<div key={group.title}>
					<div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
						{group.icon && React.createElement(group.icon, { size: 16 })}
						<span className="group-data-[collapsible=icon]:hidden">
							{group.title}
						</span>
					</div>
					<ul className="pl-4">
						{group.items.map((item) => (
							<li key={item.title} className="py-1">
								<a
									href={item.url}
									className="text-gray-600 hover:text-sky-500 flex items-center gap-2">
									{item.icon && React.createElement(item.icon, { size: 16 })}
									<span className="group-data-[collapsible=icon]:hidden">
										{item.title}
									</span>
								</a>
							</li>
						))}
					</ul>
				</div>
			))}
		</div>
	);
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { t } = useTranslation();
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader></SidebarHeader>
			<SidebarContent>
				<SidebarMenu />
			</SidebarContent>
			<SidebarFooter></SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
