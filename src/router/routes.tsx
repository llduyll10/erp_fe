import { createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "@/layouts/auth-layout";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { ProtectedRoute } from "@/components/layout/protected-routed";
import { LoginPage } from "@/pages/Login";
import { RegisterCompanyPage } from "@/pages/Company/index";
import { UserManagementPage } from "@/pages/UserManagement";
import { UserRoleEnum } from "@/enums/user.enums";
import { ChangePassword } from "@/pages/ChangePassword";
import { ProductManagementPage } from "@/pages/ProductManagement";
import { CreateProductPage } from "@/pages/ProductManagement/CreateProduct";
import { ProductDetailPage } from "@/pages/ProductManagement/DetailProduct";
import { CreateCustomerPage } from "@/pages/CustomerManagement/CreateCustomer";
import { DetailCustomerPage } from "@/pages/CustomerManagement/DetailCustomer";
import { CustomerManagementPage } from "@/pages/CustomerManagement";
import { CreateOrderPage } from "@/pages/OrderManagement/CreateOrder";
import { DetailOrderPage } from "@/pages/OrderManagement/DetailOrder";
import { OrderManagementPage } from "@/pages/OrderManagement";
import { WarehouseManagementPage } from "@/pages/WarehouseManagement";
import { StockMovementsPage } from "@/pages/WarehouseManagement/StockMovements";
import { StockInPage } from "@/pages/WarehouseManagement/StockIn";
import { StockOutPage } from "@/pages/WarehouseManagement/StockOut";
import { WarehouseDashboardPage } from "@/pages/WarehouseManagement/Dashboard";
import { StockInventoryPage } from "@/pages/WarehouseManagement/StockInventory";

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
			<ProtectedRoute minimumRole={UserRoleEnum.USER}>
				<DashboardLayout />
			</ProtectedRoute>
		),
		children: [
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
		],
	},
]);
