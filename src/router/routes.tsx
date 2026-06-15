import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout } from "@/layouts/auth-layout";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { ProtectedRoute } from "@/components/layout/protected-routed";
import { AuthRedirect } from "@/components/auth-redirect";
import { NotFound } from "@/components/not-found";
import { LoginPage } from "@/pages/login/index";
import { UserManagementPage } from "@/pages/UserManagement/index";
import { CompanySettingsPage } from "@/pages/Settings/Company/index";
import { ProductSettingsPage } from "@/pages/Settings/Product/index";
import { StorageSettingsPage } from "@/pages/Settings/Storage/index";
import { DepartmentsPage } from "@/pages/HR/Departments/index";
import { EmployeesPage } from "@/pages/HR/Employees/index";
import { UserRoleEnum } from "@/enums/user.enums";
import { ChangePassword } from "@/pages/ChangePassword/index";
import { ProductManagementPage } from "@/pages/ProductManagement/index";
import { CreateProductPage } from "@/pages/ProductManagement/CreateProduct/index";
import { ProductDetailPage } from "@/pages/ProductManagement/DetailProduct/index";
import { CreateCustomerPage } from "@/pages/CustomerManagement/CreateCustomer/index";
import { DetailCustomerPage } from "@/pages/CustomerManagement/DetailCustomer/index";
import { CustomerManagementPage } from "@/pages/CustomerManagement/index";
import { CreateOrderPage } from "@/pages/OrderManagement/CreateOrder/index";
import { DetailOrderPage } from "@/pages/OrderManagement/DetailOrder/index";
import { OrderManagementPage } from "@/pages/OrderManagement/index";
import { WarehouseManagementPage } from "@/pages/WarehouseManagement/index";
import { StockMovementsPage } from "@/pages/WarehouseManagement/StockMovements/index";
import { StockInPage } from "@/pages/WarehouseManagement/StockIn/index";
import { StockOutPage } from "@/pages/WarehouseManagement/StockOut/index";
import { WarehouseDashboardPage } from "@/pages/WarehouseManagement/Dashboard/index";
import { StockInventoryPage } from "@/pages/WarehouseManagement/StockInventory/index";
import { StockInHistoryPage } from "@/pages/WarehouseManagement/StockInHistory/index";
import { StockOutHistoryPage } from "@/pages/WarehouseManagement/StockOutHistory/index";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <AuthLayout />,
		children: [
			{
				index: true, // This handles the root "/" path
				element: <AuthRedirect />,
			},
			{
				path: "login",
				element: <LoginPage />,
			},
			{
				path: "register-company",
				element: <Navigate to="/login" replace />,
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
			<ProtectedRoute minimumRole={UserRoleEnum.USER}>
				<DashboardLayout />
			</ProtectedRoute>
		),
		children: [
			{
				index: true, // This handles "/dashboard" path - redirect to products
				element: <AuthRedirect />,
			},
			{
				path: "users",
				element: <UserManagementPage />,
			},
			{
				path: "products",
				element: <ProductManagementPage />,
			},
			{
				path: "products/create",
				element: <CreateProductPage />,
			},
			{
				path: "products/detail/:id",
				element: <ProductDetailPage />,
			},
			{
				path: "customers",
				element: <CustomerManagementPage />,
			},
			{
				path: "customers/create",
				element: <CreateCustomerPage />,
			},
			{
				path: "customers/detail/:id",
				element: <DetailCustomerPage />,
			},
			{
				path: "orders",
				element: <OrderManagementPage />,
			},
			{
				path: "orders/create",
				element: <CreateOrderPage />,
			},
			{
				path: "orders/detail/:id",
				element: <DetailOrderPage />,
			},
			{
				path: "warehouse",
				element: <WarehouseManagementPage />,
			},
			{
				path: "warehouse/dashboard",
				element: <WarehouseDashboardPage />,
			},
			{
				path: "warehouse/movements",
				element: <StockMovementsPage />,
			},
			{
				path: "warehouse/import",
				element: <StockInPage />,
			},
			{
				path: "warehouse/export",
				element: <StockOutPage />,
			},
			{
				path: "warehouse/inventory",
				element: <StockInventoryPage />,
			},
			{
				path: "warehouse/import/history",
				element: <StockInHistoryPage />,
			},
			{
				path: "warehouse/export/history",
				element: <StockOutHistoryPage />,
			},
			// Module 1 — Settings
			{
				path: "settings/company",
				element: <CompanySettingsPage />,
			},
			{
				path: "settings/product",
				element: <ProductSettingsPage />,
			},
			{
				path: "settings/storage",
				element: <StorageSettingsPage />,
			},
			// Module 2 — HR
			{
				path: "hr/departments",
				element: <DepartmentsPage />,
			},
			{
				path: "hr/employees",
				element: <EmployeesPage />,
			},
		],
	},
	{
		path: "*", // Catch-all route for 404 pages
		element: <NotFound />,
	},
]);
