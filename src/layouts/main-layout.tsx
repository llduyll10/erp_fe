import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export function MainLayout() {
	const [sidebarOpen, setSidebarOpen] = useState(true);

	return (
		<div className="flex h-screen bg-gray-50 dark:bg-gray-900">
			<Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
			
			<div className="flex flex-1 flex-col overflow-hidden">
				<Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
				
				<main className="relative flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 px-4 pb-6 pt-4 dark:bg-gray-900 md:px-6 md:pb-8 md:pt-4">
					<Outlet />
				</main>
			</div>
		</div>
	);
} 