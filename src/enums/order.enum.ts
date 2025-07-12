export enum OrderStatus {
	NEW = "new", // Đơn hàng mới
	WAREHOUSE_CONFIRMED = "warehouse_confirmed", // Kho xác nhận
	NEED_PRODUCTION = "need_production", // Cần sản xuất
	IN_PRODUCTION = "in_production", // Đang sản xuất
	READY = "ready", // Sẵn sàng
	DELIVERING = "delivering", // Đang giao hàng
	DELIVERED = "delivered", // Đã giao
	COMPLETED = "completed", // Hoàn thành
	CANCELLED = "cancelled", // Đã hủy
}

export enum FulfillmentStatus {
	PENDING = "pending", // Chờ xử lý
	IN_PRODUCTION = "in_production", // Đang sản xuất
	STOCK_READY = "stock_ready", // Hàng sẵn sàng
	SHIPPED = "shipped", // Đã giao
}

export enum PaymentStatus {
	UNPAID = "unpaid", // Chưa thanh toán
	PARTIAL = "partial", // Thanh toán một phần
	PAID = "paid", // Đã thanh toán
	REFUNDED = "refunded", // Đã hoàn tiền
}

export enum ProductionStatus {
	PENDING = "pending", // Chờ sản xuất
	IN_PROGRESS = "in_progress", // Đang sản xuất
	DONE = "done", // Hoàn thành
}
