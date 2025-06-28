export enum CustomerStatus {
	ACTIVE = "active", // Khách hàng hoạt động
	INACTIVE = "inactive", // Khách hàng không hoạt động
}

export enum CustomerGroup {
	INTERNAL = "internal", // Nhân viên công ty
	EXTERNAL = "external", // Khách hàng ngoài
	PARTNER = "partner", // Đối tác
	OTHER = "other",
}

export enum CustomerType {
	NEW = "new", // Khách hàng mới
	OLD = "old", // Khách hàng cũ
	VIP = "vip", // Khách hàng VIP
	GOLD = "gold", // Khách hàng Gold
	SILVER = "silver", // Khách hàng Silver
	BRONZE = "bronze", // Khách hàng Bronze
	OTHER = "other",
}

export enum CustomerSource {
	INTERNAL = "internal", // Nhân viên công ty
	EXTERNAL = "external", // Khách hàng ngoài
	PARTNER = "partner", // Đối tác
	OTHER = "other", // Khác
}
