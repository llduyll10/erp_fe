import { cn } from "@/lib/utils";
import {
	BarChart2,
	Box,
	Home,
	LayoutDashboard,
	LogOut,
	Settings,
	Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface SidebarProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const menuItems = [
	{
		title: "Dashboard",
		icon: LayoutDashboard,
		path: "/dashboard",
	},
	{
		title: "Products",
		icon: Box,
		path: "/products",
	},
	{
		title: "Analytics",
		icon: BarChart2,
		path: "/analytics",
	},
	{
		title: "Users",
		icon: Users,
		path: "/users",
	},
	{
		title: "Settings",
		icon: Settings,
		path: "/settings",
	},
];

export function Sidebar({ open }: SidebarProps) {
	return (
		<>
			{/* Backdrop for mobile */}
			<div
				className={cn(
					"fixed inset-0 z-20 bg-black/50 lg:hidden",
					open ? "block" : "hidden"
				)}
			/>

			{/* Sidebar */}
			<aside
				className={cn(
					"fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r bg-white transition-transform dark:border-gray-700 dark:bg-gray-800 lg:static lg:translate-x-0",
					!open && "-translate-x-full"
				)}
			>
				{/* Logo */}
				<div className="flex h-16 items-center gap-2 border-b px-6 dark:border-gray-700">
					<Home className="h-6 w-6" />
					<span className="font-semibold">TailAdmin</span>
				</div>

				{/* Menu Items */}
				<nav className="flex-1 space-y-1 px-3 py-4">
					{menuItems.map((item) => (
						<NavLink
							key={item.path}
							to={item.path}
							className={({ isActive }) =>
								cn(
									"flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
									isActive &&
										"bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
								)
							}
						>
							<item.icon className="h-5 w-5" />
							<span>{item.title}</span>
						</NavLink>
					))}
				</nav>

				{/* Logout Button */}
				<div className="border-t p-3 dark:border-gray-700">
					<Button
						variant="ghost"
						className="w-full justify-start"
						onClick={() => {/* handle logout */}}
					>
						<LogOut className="mr-2 h-5 w-5" />
						<span>Logout</span>
					</Button>
				</div>
			</aside>
		</>
	);
} 