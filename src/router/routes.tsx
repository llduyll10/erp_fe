import { createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "@/layouts/auth-layout";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { ProtectedRoute } from "@/components/layout/protected-routed";
import { LoginPage } from "@/pages/Login";
import { RegisterCompanyPage } from "@/pages/Company/index";
import { UserManagementPage } from "@/pages/UserManagement";
import { UserRoleEnum } from "@/enums/user.enums";
import { ChangePassword } from "@/pages/ChangePassword";

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
			{
				path: "change-password",
				element: <ChangePassword />,
			},
		],
	},
	{
		path: "/dashboard",
		element: (
			<ProtectedRoute allowedTypes={[UserRoleEnum.ADMIN, UserRoleEnum.USER]}>
				<DashboardLayout />
			</ProtectedRoute>
		),
		children: [
			{
				path: "users",
				element: <UserManagementPage />,
			},
		],
	},
]);
