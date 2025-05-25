import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function DashboardLayout() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<Header />
				<Outlet />
			</SidebarInset>
		</SidebarProvider>
	);
}
