# 📋 Order Module Documentation

## 🎯 Overview

Order Module quản lý toàn bộ quy trình đặt hàng trong hệ thống ERP ngành quần áo thể thao, bao gồm:

- Tạo và quản lý đơn hàng
- Quản lý chi tiết sản phẩm trong đơn hàng
- Theo dõi trạng thái đơn hàng
- Tự động generate order number theo format DH00000001

---

## 🔗 API Endpoints

### Base URL: `/v1/orders`

| Method | Endpoint               | Description                    | Permission Required |
| ------ | ---------------------- | ------------------------------ | ------------------- |
| POST   | `/`                    | Tạo đơn hàng mới               | `create`            |
| GET    | `/`                    | Lấy danh sách đơn hàng         | `list`              |
| GET    | `/:id`                 | Lấy chi tiết đơn hàng theo ID  | `list`              |
| GET    | `/number/:orderNumber` | Lấy đơn hàng theo order number | `list`              |
| PUT    | `/:id`                 | Cập nhật đơn hàng              | `update`            |
| DELETE | `/:id`                 | Xóa đơn hàng (soft delete)     | `delete`            |

### Product Variants for Order Creation

- `GET /v1/product-variants/all` - Lấy toàn bộ product variants trong hệ thống (cho tạo đơn hàng)

#### GET /v1/product-variants/all

**Mô tả:** Lấy danh sách tất cả product variants trong hệ thống để sử dụng cho tạo đơn hàng

**Query Parameters:**

- `page` (number, optional): Trang hiện tại (default: 1)
- `limit` (number, optional): Số lượng items per page (default: 10, max: 100)
- `q` (string, optional): Tìm kiếm theo tên variant hoặc tên product
- `size` (enum, optional): Lọc theo size (XS, S, M, L, XL, XXL, FREE_SIZE)
- `color` (enum, optional): Lọc theo màu sắc
- `gender` (enum, optional): Lọc theo giới tính (MALE, FEMALE, UNISEX)
- `category_id` (uuid, optional): Lọc theo category ID

**Response:**

```json
{
	"data": [
		{
			"id": "variant-uuid",
			"product_id": "product-uuid",
			"sku": "SP001-M-RED-MALE",
			"variant_name": "Áo thun Nam Size M Màu Đỏ",
			"size": "M",
			"color": "RED",
			"gender": "MALE",
			"price": 299000,
			"cost": 150000,
			"unit": "PIECE",
			"quantity": 50,
			"status": "active",
			"file_key": "products/variant-image.jpg",
			"product_name": "Áo Thun Cotton",
			"product_description": "Áo thun cotton 100% chất lượng cao",
			"product_file_key": "products/product-image.jpg",
			"category_name": "Áo Thun",
			"category_id": "category-uuid",
			"display_name": "Áo Thun Cotton (M, RED, MALE)",
			"is_in_stock": true
		}
	],
	"meta": {
		"page": 1,
		"limit": 10,
		"total": 100,
		"pages": 10
	}
}
```

---

## 📊 Data Models

### Order Entity

```typescript
{
  id: string;                    // UUID
  company_id: string;            // UUID
  customer_id: string;           // UUID (Required)
  sales_representative_id: string; // UUID (Required)
  created_by_id: string;         // UUID
  updated_by_id: string;         // UUID
  order_number: string;          // Auto-generated: DH00000001
  status: OrderStatus;           // Enum
  fulfillment_status: FulfillmentStatus; // Enum
  payment_status: PaymentStatus; // Enum

  // Shipping Address (Optional)
  shipping_street_address?: string;
  shipping_country?: string;
  shipping_state_province?: string;
  shipping_district?: string;
  shipping_ward?: string;
  shipping_postal_code?: string;
  shipping_city?: string;
  delivery_notes?: string;

  created_at: Date;
  updated_at: Date;
  deleted_at: Date;

  // Relations
  customer: Customer;
  sales_representative: User;
  order_items: OrderItem[];
  created_by: User;
  updated_by: User;
}
```

### OrderItem Entity

```typescript
{
    id: string;                    // UUID
  order_id: string;              // UUID
  variant_id?: string;           // UUID (Product variant - required if no custom_product_id)
  custom_product_id?: string;    // UUID (Custom product - required if no variant_id)
  quantity: number;              // Required, min: 1
  unit_price: number;            // Decimal
  total_price: number;           // Decimal
  production_status?: ProductionStatus; // Enum (Optional)

  // Relations
  order: Order;
  variant?: ProductVariant;      // Includes nested product via variant.product
  custom_product?: CustomProduct;
}
```

---

## 🏷️ Enums

### OrderStatus

```typescript
enum OrderStatus {
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
```

### FulfillmentStatus

```typescript
enum FulfillmentStatus {
	PENDING = "pending", // Chờ xử lý
	IN_PRODUCTION = "in_production", // Đang sản xuất
	STOCK_READY = "stock_ready", // Hàng sẵn sàng
	SHIPPED = "shipped", // Đã giao
}
```

### PaymentStatus

```typescript
enum PaymentStatus {
	UNPAID = "unpaid", // Chưa thanh toán
	PARTIAL = "partial", // Thanh toán một phần
	PAID = "paid", // Đã thanh toán
	REFUNDED = "refunded", // Đã hoàn tiền
}
```

### ProductionStatus

```typescript
enum ProductionStatus {
	PENDING = "pending", // Chờ sản xuất
	IN_PROGRESS = "in_progress", // Đang sản xuất
	DONE = "done", // Hoàn thành
}
```

---

## 📤 Request DTOs

### Create Order Request

```typescript
POST /v1/orders
Content-Type: application/json

{
  "customer_id": "uuid",                    // Required
  "sales_representative_id": "uuid",        // Required
  "status": "new",                         // Optional, default: "new"
  "fulfillment_status": "pending",         // Optional, default: "pending"
  "payment_status": "unpaid",              // Optional, default: "unpaid"

  // Shipping Address (All optional)
  "shipping_street_address": "123 Đường ABC",    // Optional
  "shipping_country": "Việt Nam",                // Optional
  "shipping_state_province": "TP. Hồ Chí Minh",  // Optional
  "shipping_district": "Quận 1",                 // Optional
  "shipping_ward": "Phường Bến Nghé",            // Optional
  "shipping_postal_code": "70000",               // Optional
  "shipping_city": "TP. Hồ Chí Minh",            // Optional
  "delivery_notes": "Giao hàng trong giờ hành chính", // Optional

  "order_items": [                         // Required, array
    {
      "variant_id": "uuid",                // Optional (required if no custom_product_id)
      "custom_product_id": "uuid",         // Optional (required if no variant_id)
      "quantity": 2,                       // Required, min: 1
      "unit_price": 250000,                // Required
      "total_price": 500000,               // Required
      "production_status": "pending"       // Optional
    }
  ]
}
```

### Update Order Request

```typescript
PUT /v1/orders/:id
Content-Type: application/json

{
  "customer_id": "uuid",                   // Optional
  "sales_representative_id": "uuid",       // Optional
  "status": "warehouse_confirmed",         // Optional
  "fulfillment_status": "stock_ready",     // Optional
  "payment_status": "paid",                // Optional

  // Shipping Address (All optional)
  "shipping_street_address": "456 Đường XYZ",    // Optional
  "shipping_country": "Việt Nam",                // Optional
  "shipping_state_province": "Hà Nội",           // Optional
  "shipping_district": "Quận Ba Đình",           // Optional
  "shipping_ward": "Phường Cống Vị",             // Optional
  "shipping_postal_code": "10000",               // Optional
  "shipping_city": "Hà Nội",                     // Optional
  "delivery_notes": "Giao vào buổi chiều",       // Optional

  "order_items": [                         // Optional, will replace all items
    {
      "variant_id": "uuid",                // Either variant_id or custom_product_id required
      "quantity": 3,
      "unit_price": 300000,
      "total_price": 900000
    }
  ]
}
```

### Query Parameters (GET /v1/orders)

```typescript
GET /v1/orders?page=1&limit=10&status=new&customer_id=uuid

{
  page?: number;                          // Default: 1
  limit?: number;                         // Default: 10
  q?: string;                            // Search by order_number or customer_name
  status?: OrderStatus;                   // Filter by order status
  fulfillment_status?: FulfillmentStatus; // Filter by fulfillment status
  payment_status?: PaymentStatus;         // Filter by payment status
  customer_id?: string;                   // Filter by customer
  sales_representative_id?: string;       // Filter by sales rep
}
```

---

## 📥 Response DTOs

### Create Order Response

```typescript
{
  "id": "uuid",
  "order_number": "DH00000001",
  "customer_id": "uuid",
  "sales_representative_id": "uuid",
  "status": "new",
  "fulfillment_status": "pending",
  "payment_status": "unpaid",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### Order Detail Response

```typescript
{
  "id": "uuid",
  "company_id": "uuid",
  "customer_id": "uuid",
  "sales_representative_id": "uuid",
  "order_number": "DH00000001",
  "status": "new",
  "fulfillment_status": "pending",
  "payment_status": "unpaid",

  // Shipping Address
  "shipping_street_address": "123 Đường ABC",
  "shipping_country": "Việt Nam",
  "shipping_state_province": "TP. Hồ Chí Minh",
  "shipping_district": "Quận 1",
  "shipping_ward": "Phường Bến Nghé",
  "shipping_postal_code": "70000",
  "shipping_city": "TP. Hồ Chí Minh",
  "delivery_notes": "Giao hàng trong giờ hành chính",

  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z",
  "deleted_at": null,

  // Relations
  "customer": {
    "id": "uuid",
    "name": "Nguyễn Văn A",
    "email": "customer@example.com",
    "phone_number": "0901234567"
  },
  "sales_representative": {
    "id": "uuid",
    "name": "Sale Rep Name",
    "email": "sale@company.com"
  },
  "order_items": [
    {
      "id": "uuid",
      "order_id": "uuid",
      "variant_id": "uuid",
      "quantity": 2,
      "unit_price": 250000,
      "total_price": 500000,
      "production_status": "pending",
      "variant": {
        "id": "uuid",
        "variant_name": "Áo thun - Đỏ - Size M",
        "sku": "SKU001",
        "color": "Đỏ",
        "size": "M",
        "product": {
          "id": "uuid",
          "name": "Áo thun thể thao",
          "description": "Áo thun cotton cao cấp"
        }
      }
    }
  ],
  "created_by": {
    "id": "uuid",
    "name": "Creator Name"
  }
}
```

### Order List Response

```typescript
{
  "data": [
    {
      "id": "uuid",
      "order_number": "DH00000001",
      "customer_id": "uuid",
      "status": "new",
      "fulfillment_status": "pending",
      "payment_status": "unpaid",
      "created_at": "2024-01-01T00:00:00.000Z",
      "customer": {
        "name": "Nguyễn Văn A"
      },
      "sales_representative": {
        "name": "Sale Rep"
      }
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

---

## 🔄 Business Logic & Workflows

### Order Creation Flow

1. **Validate Input**: Kiểm tra customer_id, sales_representative_id tồn tại
2. **Generate Order Number**: Tự động tạo order_number theo format DH00000001
3. **Create Order**: Tạo order với trạng thái mặc định
4. **Create Order Items**: Tạo các order items liên quan
5. **Return Response**: Trả về thông tin order đã tạo

### Order Number Generation

- **Format**: `DH` + 8 digits với leading zeros
- **Logic**: Đếm số orders hiện có trong company + 1
- **Examples**: `DH00000001`, `DH00000002`, `DH00000123`
- **Fallback**: Nếu không generate được, sử dụng timestamp

### Order Item Rules

- **Bắt buộc phải có một trong hai**:
  - `variant_id` (Sản phẩm variant - áo với size, màu cụ thể)
  - `custom_product_id` (Sản phẩm tùy chỉnh)
- **Không thể có cả hai** `variant_id` và `custom_product_id` cùng lúc
- `total_price` thường = `quantity * unit_price`
- `production_status` chỉ áp dụng cho sản phẩm cần sản xuất
- **Product info**: Lấy thông qua `variant.product` relationship (không cần `product_id` riêng)

### Status Transition Rules

```
OrderStatus Flow:
NEW → WAREHOUSE_CONFIRMED → NEED_PRODUCTION → IN_PRODUCTION → READY → DELIVERING → DELIVERED → COMPLETED
  ↓
CANCELLED (có thể hủy ở bất kỳ trạng thái nào trước DELIVERED)

FulfillmentStatus Flow:
PENDING → IN_PRODUCTION → STOCK_READY → SHIPPED

PaymentStatus Flow:
UNPAID → PARTIAL → PAID
PAID → REFUNDED (nếu cần hoàn tiền)
```

---

## 🚨 Error Handling

### Common Error Codes

```typescript
// 404 - Not Found
{
  "message": "orders.not_found",
  "statusCode": 404
}

// 400 - Bad Request
{
  "message": "Validation failed",
  "statusCode": 400,
  "errors": [
    {
      "field": "customer_id",
      "message": "customer_id is required"
    }
  ]
}

// 403 - Forbidden
{
  "message": "Insufficient permissions",
  "statusCode": 403
}
```

### Validation Rules

- `customer_id`: Must be valid UUID and exist in database
- `sales_representative_id`: Must be valid UUID and exist in database
- `quantity`: Must be positive integer >= 1
- `unit_price`: Must be positive decimal
- `total_price`: Must be positive decimal
- Order items: At least one item required
- **Order item validation**: Each item must have either `variant_id` or `custom_product_id` (not both)
- `variant_id`: Must be valid UUID and exist in product_variants table
- `custom_product_id`: Must be valid UUID and exist in custom_products table
- Shipping address fields: All optional, max length 255 characters (except postal_code: 20 chars, delivery_notes: 1000 chars)

---

## 💡 Frontend Implementation Examples

### Create Order

```typescript
// API Call
const createOrder = async (orderData) => {
	const response = await fetch("/v1/orders", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(orderData),
	});

	if (!response.ok) {
		throw new Error("Failed to create order");
	}

	return response.json();
};

// Usage
const newOrder = {
	customer_id: selectedCustomer.id,
	sales_representative_id: currentUser.id,

	// Shipping address (optional)
	shipping_street_address: shippingForm.street_address,
	shipping_country: shippingForm.country,
	shipping_state_province: shippingForm.state_province,
	shipping_district: shippingForm.district,
	shipping_ward: shippingForm.ward,
	shipping_postal_code: shippingForm.postal_code,
	shipping_city: shippingForm.city,
	delivery_notes: shippingForm.delivery_notes,

	order_items: cartItems.map((item) => ({
		variant_id: item.variant_id, // For normal products with variants
		custom_product_id: item.custom_product_id, // For custom products
		quantity: item.quantity,
		unit_price: item.unit_price,
		total_price: item.quantity * item.unit_price,
	})),
};

const result = await createOrder(newOrder);
console.log("Order created:", result.order_number);
```

### Search & Filter Orders

```typescript
const searchOrders = async (filters) => {
	const params = new URLSearchParams();

	if (filters.q) params.append("q", filters.q);
	if (filters.status) params.append("status", filters.status);
	if (filters.customer_id) params.append("customer_id", filters.customer_id);
	params.append("page", filters.page || 1);
	params.append("limit", filters.limit || 10);

	const response = await fetch(`/v1/orders?${params.toString()}`);
	return response.json();
};
```

### Update Order Status

```typescript
const updateOrderStatus = async (orderId, newStatus) => {
	const response = await fetch(`/v1/orders/${orderId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			status: newStatus,
		}),
	});

	return response.json();
};
```

---

## 🎨 UI/UX Suggestions

### Order List Page

- **Table View**: Hiển thị order_number, customer_name, status, created_at
- **Filters**: Status dropdown, date range picker, customer search
- **Search**: Tìm theo order_number hoặc customer name
- **Actions**: View detail, Edit, Cancel order
- **Pagination**: Support infinite scroll hoặc numbered pagination

### Order Detail Page

- **Header**: Order number, status badges, action buttons
- **Customer Info**: Name, email, phone, address
- **Order Items**: Product table với quantity, price
- **Status Timeline**: Visual timeline của order status
- **Notes**: Text area để ghi chú
- **Actions**: Update status, Add items, Print invoice

### Create Order Form

- **Step 1**: Select customer (with search/create new)
- **Step 2**: Add products (with variant selection)
- **Step 3**: Shipping address (optional, có thể copy từ customer default address)
- **Step 4**: Review & confirm
- **Validation**: Real-time validation với error messages
- **Auto-calculation**: Tự động tính total_price
- **Address Helper**: Button "Use customer default address" để copy shipping info

### Status Indicators

```css
.status-new {
	background: #e3f2fd;
	color: #1976d2;
}
.status-confirmed {
	background: #f3e5f5;
	color: #7b1fa2;
}
.status-production {
	background: #fff3e0;
	color: #f57c00;
}
.status-ready {
	background: #e8f5e8;
	color: #388e3c;
}
.status-delivered {
	background: #e0f2f1;
	color: #00796b;
}
.status-cancelled {
	background: #ffebee;
	color: #d32f2f;
}
```

---

## 🔧 Development Notes

### Authentication

- Tất cả endpoints require JWT token trong header
- Current user được inject tự động thông qua `@CurrentUser()` decorator
- Company isolation: Chỉ xem được orders của company hiện tại

### Performance Considerations

- Use pagination cho order list (default limit: 10)
- Eager loading relationships khi cần thiết
- Index trên order_number và customer_id
- Consider caching cho dropdown data (customers, products)

### Testing

- Unit tests cho OrderService methods
- Integration tests cho API endpoints
- E2E tests cho complete order flow
- Test với different user roles và permissions

---

## 📋 TODO for Frontend

- [ ] Implement order creation form với multiple steps
- [ ] Add order status timeline component
- [ ] Create reusable status badge component
- [ ] Implement real-time order updates (WebSocket/SSE)
- [ ] Add print functionality cho orders
- [ ] Implement bulk operations (bulk status update)
- [ ] Add order analytics dashboard
- [ ] Implement order templates for frequent customers

---

## 🔗 Related Documentation

- [Customer Module Documentation](./customer-module.md)
- [Product Module Documentation](./product-module.md)
- [Authentication & Authorization](./auth-module.md)
- [API Response Format Standards](./api-standards.md)
