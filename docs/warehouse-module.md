# 📦 Warehouse Module Documentation

## 🎯 Overview

Warehouse Module quản lý toàn bộ hoạt động kho trong hệ thống ERP ngành quần áo thể thao, bao gồm:

- Nhập kho (Stock In) - Tăng tồn kho sản phẩm
- Xuất kho (Stock Out) - Giảm tồn kho sản phẩm
- Theo dõi lịch sử xuất nhập kho
- Báo cáo tồn kho và tổng hợp

---

## 🔗 API Endpoints

### Base URL: `/v1/warehouse`

| Method | Endpoint         | Description                    | Permission Required |
| ------ | ---------------- | ------------------------------ | ------------------- |
| POST   | `/stock-in`      | Nhập kho sản phẩm              | `create`            |
| POST   | `/stock-out`     | Xuất kho sản phẩm              | `create`            |
| POST   | `/fulfill-order` | Xuất kho tự động cho đơn hàng  | `create`            |
| GET    | `/movements`     | Lấy danh sách xuất nhập kho    | `list`              |
| GET    | `/movements/:id` | Chi tiết 1 phiếu xuất nhập kho | `list`              |
| GET    | `/summary`       | Báo cáo tồn kho tổng hợp       | `list`              |

---

## 📊 Data Models

### StockMovement Entity

```typescript
{
	id: string; // UUID
	company_id: string; // UUID
	variant_id: string; // UUID (ProductVariant)
	order_id: string; // UUID (Order) - nullable, liên kết với đơn hàng
	type: StockMovementType; // Enum: 'IN' | 'OUT'
	quantity: number; // Decimal
	reason: string; // Lý do xuất/nhập kho
	created_by: string; // UUID (User)
	created_at: Date;
	updated_at: Date;

	// Relations
	company: Company;
	variant: ProductVariant; // Includes nested product via variant.product
	order: Order; // Nullable, order liên quan đến stock movement
	created_by_user: User;
}
```

### Updated ProductVariant Entity

```typescript
{
	// ... existing fields
	quantity: number; // Current stock quantity (updated by warehouse operations)
	// ... other fields
}
```

---

## 🏷️ Enums

### StockMovementType

```typescript
enum StockMovementType {
	IN = "IN", // Nhập kho
	OUT = "OUT", // Xuất kho
}
```

---

## 📤 Request DTOs

### Stock In Request

```typescript
POST /v1/warehouse/stock-in
Content-Type: application/json

{
  "variant_id": "uuid",         // Required - Product variant to stock in
  "quantity": 100.5,            // Required - Quantity to add (min: 0.01)
  "reason": "Nhập hàng từ NCC"  // Optional - Reason for stock in
}
```

### Stock Out Request

```typescript
POST /v1/warehouse/stock-out
Content-Type: application/json

{
  "variant_id": "uuid",         // Required - Product variant to stock out
  "quantity": 50.25,            // Required - Quantity to subtract (min: 0.01)
  "reason": "Xuất hàng bán",    // Optional - Reason for stock out
  "order_id": "uuid"            // Optional - Link to specific order
}
```

### Fulfill Order Request

```typescript
POST /v1/warehouse/fulfill-order
Content-Type: application/json

{
  "order_id": "uuid",           // Required - Order to fulfill
  "reason": "Order fulfillment" // Optional - Custom reason
}
```

### Query Stock Movements

```typescript
GET /v1/warehouse/movements?page=1&limit=10&type=IN&variant_id=uuid&order_id=uuid

{
  page?: number;                          // Default: 1
  limit?: number;                         // Default: 10
  q?: string;                            // Search by variant name, SKU, or product name
  variant_id?: string;                    // Filter by specific variant
  order_id?: string;                      // Filter by specific order
  type?: StockMovementType;               // Filter by movement type (IN/OUT)
}
```

---

## 📥 Response DTOs

### Stock Movement Response

```typescript
{
  "id": "uuid",
  "company_id": "uuid",
  "variant_id": "uuid",
  "order_id": "uuid",           // Nullable, present if linked to order
  "type": "IN",
  "quantity": 100.5,
  "reason": "Nhập hàng từ NCC",
  "created_by": "uuid",
  "updated_by": "uuid",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z",

  "variant": {
    "id": "uuid",
    "sku": "SP001-M-RED-MALE",
    "variant_name": "Áo Thun Nam Size M Màu Đỏ",
    "size": "M",
    "color": "RED",
    "gender": "MALE",
    "quantity": 150.5,          // Updated stock after movement
    "product": {
      "id": "uuid",
      "name": "Áo Thun Cotton"
    }
  },

  "order": {                    // Nullable, present if linked to order
    "id": "uuid",
    "order_number": "ORD-2024-001",
    "status": "CONFIRMED"
  },

  "created_by_user": {
    "id": "uuid",
    "name": "Nguyễn Văn A"
  },

  "updated_by_user": {
    "id": "uuid",
    "name": "Trần Thị B"
  }
}
```

### Stock Movements List Response

```typescript
{
  "data": [
    {
      "id": "uuid",
      "type": "IN",
      "quantity": 100,
      "reason": "Nhập hàng từ NCC",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "variant": {
        "sku": "SP001-M-RED",
        "variant_name": "Áo Thun Size M",
        "product": {
          "name": "Áo Thun Cotton"
        }
      },
      "created_by_user": {
        "name": "Nhân viên kho"
      },
      "updated_by_user": {
        "name": "Quản lý kho"
      }
    }
  ],
  "pagination": {
    "total_pages": 5,
    "total_records": 50,
    "records_per_page": 10,
    "current_page": 1
  }
}
```

### Stock Summary Response

```typescript
[
	{
		variant_id: "uuid",
		current_stock: 150.5, // Current quantity in variant table
		total_stock_in: 200, // Total IN movements
		total_stock_out: 49.5, // Total OUT movements
		variant: {
			id: "uuid",
			sku: "SP001-M-RED",
			variant_name: "Áo Thun Size M",
			size: "M",
			color: "RED",
			product: {
				name: "Áo Thun Cotton",
			},
		},
	},
];
```

---

## 🔄 Business Logic & Workflows

### Stock In Flow

1. **Validate Variant**: Kiểm tra variant_id tồn tại và thuộc company
2. **Create Movement Record**: Tạo record StockMovement với type = 'IN'
3. **Update Variant Stock**: Tăng quantity trong product_variants table
4. **Return Response**: Trả về thông tin movement đã tạo

### Stock Out Flow

1. **Validate Variant**: Kiểm tra variant_id tồn tại và thuộc company
2. **Check Stock Availability**: Đảm bảo đủ hàng để xuất (current_stock >= requested_quantity)
3. **Create Movement Record**: Tạo record StockMovement với type = 'OUT'
4. **Update Variant Stock**: Giảm quantity trong product_variants table
5. **Return Response**: Trả về thông tin movement đã tạo

### Stock Calculation Rules

- **Current Stock** = SUM(IN movements) - SUM(OUT movements)
- **Stock movements** chỉ được tạo, không được sửa/xóa (audit trail)
- **Variant quantity** được update tự động qua SQL increment/decrement
- **Negative stock** không được phép (validation trước khi xuất kho)

---

## 🚨 Error Handling

### Common Error Codes

```typescript
// 404 - Variant Not Found
{
  "message": "product_variants.not_found",
  "statusCode": 404
}

// 400 - Insufficient Stock
{
  "message": "warehouse.insufficient_stock",
  "statusCode": 400,
  "current_stock": 10.5,
  "requested": 50
}

// 400 - Cannot Stock Out Due to Pending Orders
{
  "message": "Cannot stock out directly. Variant has pending orders.",
  "statusCode": 400,
  "current_stock": 100,
  "pending_orders_quantity": 80,
  "available_for_direct_stock_out": 20,
  "requested": 50,
  "pending_orders": [
    {
      "order_id": "uuid",
      "order_number": "ORD-2024-001"
    }
  ]
}

// 400 - Order Already Fulfilled
{
  "message": "Order is already fulfilled",
  "statusCode": 400
}

// 400 - Insufficient Stock for Order Fulfillment
{
  "message": "Insufficient stock for order fulfillment",
  "statusCode": 400,
  "insufficient_items": [
    {
      "variant_id": "uuid",
      "sku": "SP001-M-RED",
      "current_stock": 5,
      "required": 10
    }
  ]
}

// 400 - Invalid Quantity
{
  "message": "Validation failed",
  "statusCode": 400,
  "errors": [
    {
      "field": "quantity",
      "message": "quantity must be at least 0.01"
    }
  ]
}
```

### Validation Rules

- `variant_id`: Must be valid UUID and exist in product_variants table of current company
- `quantity`: Must be positive decimal >= 0.01
- `reason`: Optional string, max 255 characters
- **Stock Out**: Current stock must be >= requested quantity
- **Company Isolation**: Users can only access stock of their own company

---

## 🔐 Permission System

### Role-Based Access Control

```typescript
// Can create stock movements (stock in/out)
SUPERADMIN, ADMIN_COMPANY, ADMIN, WORKSHOP_ADMIN, WORKSHOP_MEMBER;

// Can view stock movements and summary
SUPERADMIN,
	ADMIN_COMPANY,
	ADMIN,
	WORKSHOP_ADMIN,
	WORKSHOP_MEMBER,
	SALE_ADMIN,
	SALE_MEMBER;

// Can delete stock movements (if needed)
SUPERADMIN, ADMIN_COMPANY, ADMIN;
```

---

## 💡 Frontend Implementation Examples

### Stock In Operation

```typescript
const stockIn = async (variantId, quantity, reason) => {
	const response = await fetch("/v1/warehouse/stock-in", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			variant_id: variantId,
			quantity: parseFloat(quantity),
			reason: reason || "Nhập kho",
		}),
	});

	if (!response.ok) {
		const error = await response.json();
		if (error.message === "product_variants.not_found") {
			throw new Error("Sản phẩm không tồn tại");
		}
		throw new Error("Nhập kho thất bại");
	}

	return response.json();
};

// Usage
try {
	const result = await stockIn(
		"variant-uuid",
		100,
		"Nhập hàng từ nhà cung cấp"
	);
	console.log("Nhập kho thành công:", result);
	// Update UI to show new stock quantity
} catch (error) {
	console.error("Lỗi nhập kho:", error.message);
}
```

### Stock Out Operation

```typescript
const stockOut = async (variantId, quantity, reason) => {
	const response = await fetch("/v1/warehouse/stock-out", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			variant_id: variantId,
			quantity: parseFloat(quantity),
			reason: reason || "Xuất kho",
		}),
	});

	if (!response.ok) {
		const error = await response.json();
		if (error.message === "warehouse.insufficient_stock") {
			throw new Error(
				`Không đủ hàng. Tồn kho: ${error.current_stock}, Yêu cầu: ${error.requested}`
			);
		}
		throw new Error("Xuất kho thất bại");
	}

	return response.json();
};

// Usage with stock validation
try {
	await stockOut("variant-uuid", 50, "Xuất hàng bán cho khách");
	console.log("Xuất kho thành công");
} catch (error) {
	if (error.message.includes("Không đủ hàng")) {
		alert(error.message);
	} else {
		console.error("Lỗi xuất kho:", error.message);
	}
}
```

### Get Stock Movements

```typescript
const getStockMovements = async (filters = {}) => {
	const params = new URLSearchParams();

	if (filters.variant_id) params.append("variant_id", filters.variant_id);
	if (filters.type) params.append("type", filters.type);
	if (filters.q) params.append("q", filters.q);
	params.append("page", filters.page || 1);
	params.append("limit", filters.limit || 10);

	const response = await fetch(`/v1/warehouse/movements?${params.toString()}`);
	return response.json();
};

// Usage
const movements = await getStockMovements({
	type: "IN",
	page: 1,
	limit: 20,
});
```

### Get Stock Summary

```typescript
const getStockSummary = async () => {
	const response = await fetch("/v1/warehouse/summary");
	return response.json();
};

// Usage for dashboard
const summary = await getStockSummary();
summary.forEach((item) => {
	console.log(`${item.variant.product.name}: ${item.current_stock} units`);
});
```

---

## 🎨 UI/UX Suggestions

### Stock Operations Page

- **Two-Panel Layout**:
  - Left: Stock In form
  - Right: Stock Out form
- **Product Search**: Autocomplete để chọn variant (by name, SKU)
- **Current Stock Display**: Hiển thị tồn kho hiện tại khi chọn variant
- **Quantity Input**: Number input với validation
- **Reason Dropdown**: Common reasons + custom input
- **Success Feedback**: Toast notification với updated stock quantity

### Stock Movements List

- **Table View**: Date, Type (IN/OUT), Product, Quantity, Reason, User
- **Filters**:
  - Type dropdown (All/IN/OUT)
  - Date range picker
  - Product/variant search
- **Export**: Excel export functionality
- **Pagination**: Support infinite scroll

### Stock Summary Dashboard

- **Cards Layout**: Show summary metrics
  - Total products
  - Low stock alerts (< threshold)
  - Recent movements count
- **Stock Table**: Product name, SKU, Current stock, Total IN, Total OUT
- **Search & Filter**: By product name, category, stock level
- **Stock Alerts**: Highlight low stock items in red

### Stock In/Out Forms

```html
<!-- Stock In Form -->
<form class="stock-in-form">
	<div class="form-group">
		<label>Sản phẩm *</label>
		<autocomplete
			placeholder="Tìm theo tên hoặc SKU..."
			v-model="selectedVariant"
			:options="variants"
			display-field="display_name" />
	</div>

	<div class="form-group" v-if="selectedVariant">
		<label>Tồn kho hiện tại</label>
		<div class="current-stock">
			{{ selectedVariant.quantity }} {{ selectedVariant.unit }}
		</div>
	</div>

	<div class="form-group">
		<label>Số lượng nhập *</label>
		<input
			type="number"
			step="0.01"
			min="0.01"
			v-model="quantity"
			placeholder="Nhập số lượng..." />
	</div>

	<div class="form-group">
		<label>Lý do</label>
		<select v-model="selectedReason">
			<option value="">Chọn lý do...</option>
			<option value="Nhập hàng từ NCC">Nhập hàng từ NCC</option>
			<option value="Trả hàng từ khách">Trả hàng từ khách</option>
			<option value="Điều chỉnh tồn kho">Điều chỉnh tồn kho</option>
			<option value="custom">Lý do khác...</option>
		</select>
		<input
			v-if="selectedReason === 'custom'"
			v-model="customReason"
			placeholder="Nhập lý do..." />
	</div>

	<button type="submit" :disabled="!canSubmit">Nhập kho</button>
</form>
```

### Status Indicators

```css
.movement-type {
	padding: 4px 8px;
	border-radius: 4px;
	font-weight: 500;
}

.movement-type.in {
	background: #e8f5e8;
	color: #2e7d2e;
}

.movement-type.out {
	background: #ffebee;
	color: #c62828;
}

.stock-level {
	padding: 2px 6px;
	border-radius: 3px;
	font-size: 12px;
}

.stock-level.high {
	background: #e8f5e8;
	color: #2e7d2e;
}

.stock-level.medium {
	background: #fff3e0;
	color: #f57c00;
}

.stock-level.low {
	background: #ffebee;
	color: #c62828;
}
```

---

## 🔧 Development Notes

### Database Considerations

- **StockMovement table**: Index on (company_id, variant_id, type, created_at)
- **ProductVariant table**: Index on (company_id, quantity) for low stock queries
- **Atomic Operations**: Use database transactions for stock operations
- **Audit Trail**: StockMovement records are immutable (no updates/deletes)

### Performance Optimizations

- **Bulk Operations**: Consider batch APIs for multiple stock movements
- **Caching**: Cache stock summary data for dashboard
- **Pagination**: Always paginate movement lists
- **Indexing**: Proper database indexes for fast queries

### Error Recovery

- **Transaction Rollback**: If stock update fails, rollback movement creation
- **Data Consistency**: Regular reconciliation between movements and variant quantities
- **Logging**: Comprehensive logging for all stock operations

---

## 📋 Integration Points

### With Order Module

```typescript
// When order is fulfilled, automatically stock out
const fulfillOrder = async (orderId) => {
	const order = await getOrderDetail(orderId);

	for (const item of order.order_items) {
		if (item.variant_id) {
			await stockOut({
				variant_id: item.variant_id,
				quantity: item.quantity,
				reason: `Xuất hàng cho đơn ${order.order_number}`,
			});
		}
	}

	await updateOrderStatus(orderId, "DELIVERED");
};
```

### With Product Module

```typescript
// Get current stock when viewing product details
const getProductStock = async (productId) => {
	const variants = await getProductVariants(productId);
	const stockSummary = await getStockSummary();

	return variants.map((variant) => ({
		...variant,
		stock_movements: stockSummary.find((s) => s.variant_id === variant.id),
	}));
};
```

---

## 🚧 Future Enhancements

- [ ] **Stock Alerts**: Automated low stock notifications
- [ ] **Batch Operations**: Import/export stock movements via Excel
- [ ] **Stock Reservations**: Reserve stock for pending orders
- [ ] **Multi-location**: Support multiple warehouse locations
- [ ] **Stock Valuation**: Track cost basis and inventory value
- [ ] **Supplier Integration**: Link stock-in to purchase orders
- [ ] **Barcode Scanning**: Mobile app for scanning products
- [ ] **Approval Workflow**: Require approval for large stock movements

---

## 📋 TODO for Frontend

- [ ] Implement stock in/out forms với real-time validation
- [ ] Create stock movements history table with filters
- [ ] Add stock summary dashboard với charts
- [ ] Implement low stock alerts system
- [ ] Add bulk stock operations (import từ Excel)
- [ ] Create mobile-friendly warehouse operations
- [ ] Add print functionality cho stock movement reports
- [ ] Implement real-time stock updates (WebSocket)

---

## 🔗 Related Documentation

- [Product Module Documentation](./product-module.md)
- [Order Module Documentation](./order-module.md)
- [User Roles & Permissions](./auth-module.md)
- [API Response Format Standards](./api-standards.md)
