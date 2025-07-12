/**
 * Warehouse Module Constants
 * Constants and option arrays for warehouse operations
 */

import { StockMovementType, StockMovementReason, WarehouseStatus, WarehouseType, StockLevel } from "@/enums/warehouse.enum";

// Stock Movement Type Options
export const STOCK_MOVEMENT_TYPE_OPTIONS = Object.values(StockMovementType).map(
	(type) => ({
		value: type,
		label: type === StockMovementType.IN ? "Nhập kho" : "Xuất kho",
	})
);

// Stock Movement Reason Options  
export const STOCK_IN_REASON_OPTIONS = [
	{ value: StockMovementReason.SUPPLIER_DELIVERY, label: "Nhập hàng từ nhà cung cấp" },
	{ value: StockMovementReason.CUSTOMER_RETURN, label: "Trả hàng từ khách" },
	{ value: StockMovementReason.PRODUCTION_COMPLETED, label: "Hoàn thành sản xuất" },
	{ value: StockMovementReason.INVENTORY_ADJUSTMENT_IN, label: "Điều chỉnh tồn kho (tăng)" },
	{ value: StockMovementReason.TRANSFER_IN, label: "Chuyển kho vào" },
	{ value: StockMovementReason.OTHER, label: "Lý do khác" },
];

export const STOCK_OUT_REASON_OPTIONS = [
	{ value: StockMovementReason.SALES_ORDER, label: "Xuất hàng bán" },
	{ value: StockMovementReason.PRODUCTION_MATERIAL, label: "Xuất nguyên liệu sản xuất" },
	{ value: StockMovementReason.DAMAGED_GOODS, label: "Hàng hỏng" },
	{ value: StockMovementReason.INVENTORY_ADJUSTMENT_OUT, label: "Điều chỉnh tồn kho (giảm)" },
	{ value: StockMovementReason.TRANSFER_OUT, label: "Chuyển kho ra" },
	{ value: StockMovementReason.SAMPLE_GOODS, label: "Xuất hàng mẫu" },
	{ value: StockMovementReason.OTHER, label: "Lý do khác" },
];

// Combined options for general use
export const STOCK_MOVEMENT_REASON_OPTIONS = [
	...STOCK_IN_REASON_OPTIONS,
	...STOCK_OUT_REASON_OPTIONS,
];

// Warehouse Type Options
export const WAREHOUSE_TYPE_OPTIONS = Object.values(WarehouseType).map(
	(type) => {
		const labels = {
			[WarehouseType.MAIN]: "Kho chính",
			[WarehouseType.BRANCH]: "Kho chi nhánh", 
			[WarehouseType.TEMPORARY]: "Kho tạm",
			[WarehouseType.PRODUCTION]: "Kho sản xuất",
		};
		return {
			value: type,
			label: labels[type],
		};
	}
);

// Warehouse Status Options
export const WAREHOUSE_STATUS_OPTIONS = Object.values(WarehouseStatus).map(
	(status) => {
		const labels = {
			[WarehouseStatus.ACTIVE]: "Hoạt động",
			[WarehouseStatus.INACTIVE]: "Không hoạt động",
			[WarehouseStatus.MAINTENANCE]: "Bảo trì",
		};
		return {
			value: status,
			label: labels[status],
		};
	}
);

// Stock Level Options
export const STOCK_LEVEL_OPTIONS = Object.values(StockLevel).map(
	(level) => {
		const labels = {
			[StockLevel.HIGH]: "Tồn kho cao",
			[StockLevel.MEDIUM]: "Tồn kho trung bình", 
			[StockLevel.LOW]: "Tồn kho thấp",
			[StockLevel.OUT_OF_STOCK]: "Hết hàng",
		};
		return {
			value: level,
			label: labels[level],
		};
	}
);

// Stock Level Thresholds
export const STOCK_LEVEL_THRESHOLDS = {
	LOW: 10,
	MEDIUM: 50,
	HIGH: 100,
} as const;