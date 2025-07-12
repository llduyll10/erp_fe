/**
 * Warehouse Module Enums
 * Defines all enums related to warehouse operations
 */

export enum StockMovementType {
	IN = "IN", // Nhập kho
	OUT = "OUT", // Xuất kho
}

export enum StockMovementReason {
	// Stock In reasons
	SUPPLIER_DELIVERY = "supplier_delivery", // Nhập hàng từ nhà cung cấp
	CUSTOMER_RETURN = "customer_return", // Trả hàng từ khách
	PRODUCTION_COMPLETED = "production_completed", // Hoàn thành sản xuất
	INVENTORY_ADJUSTMENT_IN = "inventory_adjustment_in", // Điều chỉnh tồn kho (tăng)
	TRANSFER_IN = "transfer_in", // Chuyển kho vào

	// Stock Out reasons  
	SALES_ORDER = "sales_order", // Xuất hàng bán
	PRODUCTION_MATERIAL = "production_material", // Xuất nguyên liệu sản xuất
	DAMAGED_GOODS = "damaged_goods", // Hàng hỏng
	INVENTORY_ADJUSTMENT_OUT = "inventory_adjustment_out", // Điều chỉnh tồn kho (giảm)
	TRANSFER_OUT = "transfer_out", // Chuyển kho ra
	SAMPLE_GOODS = "sample_goods", // Xuất hàng mẫu
	OTHER = "other", // Lý do khác
}

export enum StockLevel {
	HIGH = "high", // Tồn kho cao
	MEDIUM = "medium", // Tồn kho trung bình
	LOW = "low", // Tồn kho thấp
	OUT_OF_STOCK = "out_of_stock", // Hết hàng
}

export enum WarehouseStatus {
	ACTIVE = "active", // Hoạt động
	INACTIVE = "inactive", // Không hoạt động
	MAINTENANCE = "maintenance", // Bảo trì
}

export enum WarehouseType {
	MAIN = "main", // Kho chính
	BRANCH = "branch", // Kho chi nhánh
	TEMPORARY = "temporary", // Kho tạm
	PRODUCTION = "production", // Kho sản xuất
}