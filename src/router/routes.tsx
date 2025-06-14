import { createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "@/layouts/auth-layout";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { ProtectedRoute } from "@/components/layout/protected-routed";
import { LoginPage } from "@/pages/Login";
import { RegisterCompanyPage } from "@/pages/Company/index";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <AuthLayout />,
		children: [
			{
				path: "login",
				element: <LoginPage />,
			},
			{
				path: "register-company",
				element: <RegisterCompanyPage />,
			},
		],
	},
	{
		path: "/",
		element: (
			// <ProtectedRoute allowedTypes={["admin", "user"]}>
			<DashboardLayout />
			// </ProtectedRoute>
		),
		children: [
			{
				path: "dashboard",
				element: <div>Dashboard</div>,
			},
			{
				path: "users",
				element: <div>Users</div>,
			},
			{
				path: "settings",
				element: <div>Settings</div>,
			},
		],
	},
]);
