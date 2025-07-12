export enum UserRoleEnum {
	// System Level - Quản lý toàn bộ app
	SUPERADMIN = "superadmin",

	// Company Level - Cấp độ công ty
	ADMIN_COMPANY = "admin_company", // Admin tổng của công ty
	ADMIN = "admin", // Quản lý công ty
	MEMBER = "member", // Thành viên mới

	// Sales Department - Bộ phận bán hàng
	SALE_ADMIN = "sale_admin", // Nhân viên sale admin
	SALE_MEMBER = "sale_member", // Nhân viên sale

	// Production Department - Bộ phận xưởng
	WORKSHOP_ADMIN = "workshop_admin", // Quản lý xưởng
	WORKSHOP_MEMBER = "workshop_member", // Nhân viên xưởng

	// Finance Department - Bộ phận kế toán
	ACCOUNTING_ADMIN = "accounting_admin", // Kế toán admin
	ACCOUNTING_MEMBER = "accounting_member", // Kế toán member

	// Legacy roles (for backward compatibility)
	USER = "user",
}
