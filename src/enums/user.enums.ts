export enum UserRoleEnum {
	// System Level
	SUPER_ADMIN = "super_admin", // Quản lý toàn bộ hệ thống

	// Company Level
	COMPANY_ADMIN = "company_admin", // Quản lý công ty

	// Sales Department
	SALES_MANAGER = "sales_manager", // Quản lý bán hàng
	SALES_STAFF = "sales_staff", // Nhân viên bán hàng

	// Production Department
	PRODUCTION_MANAGER = "production_manager", // Quản lý sản xuất
	PRODUCTION_STAFF = "production_staff", // Nhân viên sản xuất

	// Warehouse Department
	WAREHOUSE_MANAGER = "warehouse_manager", // Quản lý kho
	WAREHOUSE_STAFF = "warehouse_staff", // Nhân viên kho

	// Finance Department
	ACCOUNTANT = "accountant", // Kế toán
	FINANCE_MANAGER = "finance_manager", // Quản lý tài chính

	// General Staff
	STAFF = "staff", // Nhân viên chung

	// Legacy roles (for backward compatibility)
	ADMIN = "admin",
	USER = "user",
}
