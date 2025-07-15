/**
 * Order Print Template
 * PDF template for printing order details for shipper
 * Uses local Noto Sans fonts for Vietnamese support
 */

import React from "react";
import {
	Document,
	Page,
	Text,
	View,
	StyleSheet,
} from "@react-pdf/renderer";
import type { Order } from "@/models/order.model";
import type { Customer } from "@/models/customer.model";
import type { User } from "@/models/user.model";
import { ProductUnit } from "@/enums/product.enum";
import { registerPDFFonts, PDF_FONTS } from "@/utils/pdf-fonts";

// Register local fonts
registerPDFFonts();

// Create styles for PDF
const styles = StyleSheet.create({
	page: {
		flexDirection: "column",
		backgroundColor: "#FFFFFF",
		padding: 15, // Giảm padding từ 20 xuống 15
		fontSize: 8, // Giảm font từ 9 xuống 8
		fontFamily: PDF_FONTS.PRIMARY,
	},

	// Header Section
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12, // Giảm margin từ 20 xuống 12
		paddingBottom: 8, // Giảm padding từ 15 xuống 8
		borderBottom: "1 solid #E5E7EB", // Giảm border từ 2 xuống 1
	},
	companyInfo: {
		flex: 1,
	},
	companyName: {
		fontSize: 15, // Giảm từ 16 xuống 15
		fontWeight: "bold",
		color: "#1F2937",
		marginBottom: 2, // Giảm từ 3 xuống 2
	},
	companyDetails: {
		fontSize: 7, // Giảm từ 8 xuống 7
		color: "#6B7280",
		lineHeight: 1.2, // Giảm từ 1.3 xuống 1.2
	},
	orderTitle: {
		fontSize: 13, // Giảm từ 14 xuống 13
		fontWeight: "bold",
		color: "#DC2626",
		textAlign: "right",
	},

	// Order Info Section
	orderInfo: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 12, // Giảm từ 20 xuống 12
		backgroundColor: "#F9FAFB",
		padding: 10, // Giảm từ 15 xuống 10
		borderRadius: 3, // Giảm từ 5 xuống 3
	},
	infoColumn: {
		flex: 1,
	},
	infoLabel: {
		fontSize: 7, // Giảm từ 8 xuống 7
		color: "#6B7280",
		marginBottom: 1, // Giảm từ 2 xuống 1
		fontWeight: "bold",
	},
	infoValue: {
		fontSize: 9, // Giảm từ 10 xuống 9
		color: "#1F2937",
		marginBottom: 5, // Giảm từ 8 xuống 5
	},

	// Customer Section
	customerSection: {
		marginBottom: 12, // Giảm từ 20 xuống 12
	},
	sectionTitle: {
		fontSize: 10, // Giảm từ 12 xuống 10
		fontWeight: "bold",
		color: "#1F2937",
		marginBottom: 6, // Giảm từ 10 xuống 6
		paddingBottom: 3, // Giảm từ 5 xuống 3
		borderBottom: "1 solid #E5E7EB",
	},
	customerGrid: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	customerColumn: {
		flex: 1,
		marginRight: 15, // Giảm từ 20 xuống 15
	},

	// Items Section
	itemsSection: {
		marginBottom: 12, // Giảm từ 20 xuống 12
	},
	tableHeader: {
		flexDirection: "row",
		backgroundColor: "#F3F4F6",
		padding: 4, // Giảm từ 5 xuống 4
		borderBottom: "1 solid #D1D5DB",
		fontWeight: "bold",
	},
	tableRow: {
		flexDirection: "row",
		padding: 3, // Giảm từ 4 xuống 3
		borderBottom: "0.5 solid #E5E7EB",
		minHeight: 18, // Giảm từ 20 xuống 18
		alignItems: "center",
	},
	tableRowAlt: {
		backgroundColor: "#F9FAFB",
	},

	// Table Column Widths
	colNo: { width: "8%", textAlign: "center" },
	colProduct: { width: "35%" },
	colSku: { width: "15%" },
	colQuantity: { width: "12%", textAlign: "center" },
	colUnit: { width: "10%", textAlign: "center" },
	colPrice: { width: "12%", textAlign: "right" },
	colTotal: { width: "12%", textAlign: "right" },

	// Product Info
	productName: {
		fontSize: 7, // Giảm từ 8 xuống 7
		fontWeight: "bold",
		marginBottom: 0.5, // Giảm từ 1 xuống 0.5
	},
	productDetails: {
		fontSize: 6, // Giảm từ 7 xuống 6
		color: "#6B7280",
	},

	// Totals Section
	totalsSection: {
		marginTop: 8, // Giảm từ 10 xuống 8
		alignItems: "flex-end",
	},
	totalRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: 160, // Giảm từ 180 xuống 160
		paddingVertical: 1, // Giảm từ 2 xuống 1
	},
	totalLabel: {
		fontSize: 8, // Giảm từ 9 xuống 8
		color: "#6B7280",
	},
	totalValue: {
		fontSize: 8, // Giảm từ 9 xuống 8
		fontWeight: "bold",
		color: "#1F2937",
	},
	grandTotal: {
		borderTop: "1 solid #D1D5DB",
		paddingTop: 2, // Giảm từ 3 xuống 2
		marginTop: 2, // Giảm từ 3 xuống 2
	},
	grandTotalLabel: {
		fontSize: 9, // Giảm từ 10 xuống 9
		fontWeight: "bold",
		color: "#DC2626",
	},
	grandTotalValue: {
		fontSize: 9, // Giảm từ 10 xuống 9
		fontWeight: "bold",
		color: "#DC2626",
	},

	// Notes Section
	notesSection: {
		marginTop: 10, // Giảm từ 15 xuống 10
		padding: 6, // Giảm từ 8 xuống 6
		backgroundColor: "#FFFBEB",
		border: "1 solid #FCD34D",
		borderRadius: 2, // Giảm từ 3 xuống 2
	},
	notesTitle: {
		fontSize: 7, // Giảm từ 8 xuống 7
		fontWeight: "bold",
		marginBottom: 2, // Giảm từ 3 xuống 2
		color: "#92400E",
	},
	notesText: {
		fontSize: 6, // Giảm từ 7 xuống 6
		color: "#78350F",
		lineHeight: 1.2, // Giảm từ 1.3 xuống 1.2
	},

	// Footer Section
	footer: {
		marginTop: 15, // Giảm từ 20 xuống 15
		paddingTop: 8, // Giảm từ 10 xuống 8
		borderTop: "1 solid #E5E7EB",
		flexDirection: "row",
		justifyContent: "space-between",
	},
	signatureBox: {
		width: 120, // Giảm từ 130 xuống 120
		textAlign: "center",
	},
	signatureLabel: {
		fontSize: 7, // Giảm từ 8 xuống 7
		color: "#6B7280",
		marginBottom: 15, // Giảm từ 20 xuống 15
	},
	signatureLine: {
		borderTop: "1 solid #D1D5DB",
		paddingTop: 2, // Giảm từ 3 xuống 2
	},

	// Status Badge
	statusBadge: {
		paddingHorizontal: 6, // Giảm từ 8 xuống 6
		paddingVertical: 2, // Giảm từ 3 xuống 2
		borderRadius: 2, // Giảm từ 3 xuống 2
		fontSize: 7, // Giảm từ 8 xuống 7
		fontWeight: "bold",
		textAlign: "center",
	},
	statusNew: {
		backgroundColor: "#DBEAFE",
		color: "#1E40AF",
	},
	statusProcessing: {
		backgroundColor: "#FEF3C7",
		color: "#92400E",
	},
	statusShipped: {
		backgroundColor: "#D1FAE5",
		color: "#065F46",
	},
	statusDelivered: {
		backgroundColor: "#DCFDF7",
		color: "#047857",
	},
	statusCancelled: {
		backgroundColor: "#FEE2E2",
		color: "#991B1B",
	},
});

interface OrderPrintTemplateProps {
	order: Order & {
		order_number?: string | null;
		created_by?: User | null;
		updated_by?: User | null;
		sales_representative?: User | null;
	};
	customer?:
		| (Customer & {
				customer_code?: string | null;
				phone_number?: string | null;
		  })
		| null;
	salesRep?: User | null;
	orderItems?: any[];
}

const formatCurrency = (amount: number) => {
	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency: "VND",
	}).format(amount);
};

const formatDate = (date: string | Date) => {
	return new Date(date).toLocaleDateString("vi-VN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});
};

const getUnitLabel = (unit?: string) => {
	switch (unit) {
		case ProductUnit.PIECE:
			return "Cái";
		case ProductUnit.SET:
			return "Bộ";
		case ProductUnit.PAIR:
			return "Đôi";
		default:
			return unit || "Cái";
	}
};

const getStatusLabel = (status?: string) => {
	switch (status) {
		case "new":
			return "Mới";
		case "warehouse_confirmed":
			return "Kho xác nhận";
		case "processing":
			return "Đang xử lý";
		case "shipped":
			return "Đã giao vận";
		case "delivered":
			return "Đã giao hàng";
		case "cancelled":
			return "Đã hủy";
		default:
			return status || "Không xác định";
	}
};

const getStatusStyle = (status?: string) => {
	switch (status?.toLowerCase()) {
		case "new":
			return [styles.statusBadge, styles.statusNew];
		case "warehouse_confirmed":
			return [styles.statusBadge, styles.statusProcessing];
		case "processing":
			return [styles.statusBadge, styles.statusProcessing];
		case "shipped":
			return [styles.statusBadge, styles.statusShipped];
		case "delivered":
			return [styles.statusBadge, styles.statusDelivered];
		case "cancelled":
			return [styles.statusBadge, styles.statusCancelled];
		default:
			return [styles.statusBadge, styles.statusNew];
	}
};

export const OrderPrintTemplate: React.FC<OrderPrintTemplateProps> = ({
	order,
	customer,
	salesRep,
	orderItems = [],
}) => {
	const subtotal = orderItems.reduce(
		(sum, item) => sum + (Number(item.total_price) || 0),
		0
	);
	const shipping = 0; // Add shipping calculation if needed
	const tax = 0; // Add tax calculation if needed
	const total = subtotal + shipping + tax;

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				{/* Header */}
				<View style={styles.header}>
					<View style={styles.companyInfo}>
						<Text style={styles.companyName}>CÔNG TY TNHH ABC</Text>
						<Text style={styles.companyDetails}>
							Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM{"\n"}
							Điện thoại: (028) 1234 5678{"\n"}
							Email: info@company.com
						</Text>
					</View>
					<View>
						<Text style={styles.orderTitle}>PHIẾU GIAO HÀNG</Text>
					</View>
				</View>

				{/* Order Information */}
				<View style={styles.orderInfo}>
					<View style={styles.infoColumn}>
						<Text style={styles.infoLabel}>SỐ ĐƠN HÀNG:</Text>
						<Text style={styles.infoValue}>
							{order.order_number || order.id}
						</Text>

						<Text style={styles.infoLabel}>NGÀY TẠO:</Text>
						<Text style={styles.infoValue}>
							{order.created_at ? formatDate(order.created_at) : "-"}
						</Text>

						<Text style={styles.infoLabel}>NGƯỜI TẠO:</Text>
						<Text style={styles.infoValue}>
							{order.created_by?.name || "-"}
						</Text>
					</View>

					<View style={styles.infoColumn}>
						<Text style={styles.infoLabel}>TRẠNG THÁI:</Text>
						<View style={getStatusStyle(order.status?.toString())}>
							<Text>{getStatusLabel(order.status?.toString())}</Text>
						</View>

						<Text style={styles.infoLabel}>NHÂN VIÊN BÁN HÀNG:</Text>
						<Text style={styles.infoValue}>
							{salesRep?.name || order.sales_representative?.name || "-"}
						</Text>
					</View>
				</View>

				{/* Customer Information */}
				<View style={styles.customerSection}>
					<Text style={styles.sectionTitle}>THÔNG TIN KHÁCH HÀNG</Text>
					<View style={styles.customerGrid}>
						<View style={styles.customerColumn}>
							<Text style={styles.infoLabel}>TÊN KHÁCH HÀNG:</Text>
							<Text style={styles.infoValue}>{customer?.name || "-"}</Text>

							<Text style={styles.infoLabel}>SỐ ĐIỆN THOẠI:</Text>
							<Text style={styles.infoValue}>
								{customer?.phone_number || "-"}
							</Text>

							<Text style={styles.infoLabel}>MÃ KHÁCH HÀNG:</Text>
							<Text style={styles.infoValue}>
								{customer?.customer_code || "-"}
							</Text>

							<Text style={styles.infoLabel}>EMAIL:</Text>
							<Text style={styles.infoValue}>{customer?.email || "-"}</Text>
						</View>

						<View style={styles.customerColumn}>
							<Text style={styles.infoLabel}>ĐỊA CHỈ GIAO HÀNG:</Text>
							<Text style={styles.infoValue}>
								{[
									order.shipping_street_address,
									order.shipping_ward,
									order.shipping_district,
									order.shipping_state_province,
									order.shipping_city,
								]
									.filter(Boolean)
									.join(", ") || "-"}
							</Text>
						</View>
					</View>
				</View>

				{/* Order Items */}
				<View style={styles.itemsSection}>
					<Text style={styles.sectionTitle}>CHI TIẾT ĐƠN HÀNG</Text>

					{/* Table Header */}
					<View style={styles.tableHeader}>
						<Text style={styles.colNo}>STT</Text>
						<Text style={styles.colProduct}>SẢN PHẨM</Text>
						<Text style={styles.colSku}>SKU</Text>
						<Text style={styles.colQuantity}>SL</Text>
						<Text style={styles.colUnit}>ĐVT</Text>
						<Text style={styles.colPrice}>ĐƠN GIÁ</Text>
						<Text style={styles.colTotal}>THÀNH TIỀN</Text>
					</View>

					{/* Table Rows */}
					{orderItems.map((item, index) => (
						<View 
							key={index} 
							style={[
								styles.tableRow, 
								...(index % 2 === 1 ? [styles.tableRowAlt] : [])
							]}
						>
							<Text style={styles.colNo}>{index + 1}</Text>
							<View style={styles.colProduct}>
								<Text style={styles.productName}>
									{item.variant?.product?.name ||
										item.product?.name ||
										"Sản phẩm"}
								</Text>
								<Text style={styles.productDetails}>
									{[
										item.variant?.size && `Size: ${item.variant.size}`,
										item.variant?.color && `Màu: ${item.variant.color}`,
										item.variant?.gender && `GT: ${item.variant.gender}`,
									]
										.filter(Boolean)
										.join(" • ")}
								</Text>
							</View>
							<Text style={styles.colSku}>{item.variant?.sku || "-"}</Text>
							<Text style={styles.colQuantity}>{item.quantity || 0}</Text>
							<Text style={styles.colUnit}>{getUnitLabel(item.unit)}</Text>
							<Text style={styles.colPrice}>
								{formatCurrency(Number(item.unit_price) || 0)}
							</Text>
							<Text style={styles.colTotal}>
								{formatCurrency(Number(item.total_price) || 0)}
							</Text>
						</View>
					))}
				</View>

				{/* Totals */}
				<View style={styles.totalsSection}>
					<View style={styles.totalRow}>
						<Text style={styles.totalLabel}>Tạm tính:</Text>
						<Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
					</View>

					{shipping > 0 && (
						<View style={styles.totalRow}>
							<Text style={styles.totalLabel}>Phí vận chuyển:</Text>
							<Text style={styles.totalValue}>{formatCurrency(shipping)}</Text>
						</View>
					)}

					{tax > 0 && (
						<View style={styles.totalRow}>
							<Text style={styles.totalLabel}>Thuế:</Text>
							<Text style={styles.totalValue}>{formatCurrency(tax)}</Text>
						</View>
					)}

					<View style={[styles.totalRow, styles.grandTotal]}>
						<Text style={styles.grandTotalLabel}>TỔNG CỘNG:</Text>
						<Text style={styles.grandTotalValue}>{formatCurrency(total)}</Text>
					</View>
				</View>

				{/* Delivery Notes */}
				{order.delivery_notes && (
					<View style={styles.notesSection}>
						<Text style={styles.notesTitle}>GHI CHÚ GIAO HÀNG:</Text>
						<Text style={styles.notesText}>{order.delivery_notes}</Text>
					</View>
				)}

				{/* Footer with Signatures */}
				<View style={styles.footer}>
					<View style={styles.signatureBox}>
						<Text style={styles.signatureLabel}>Người giao hàng</Text>
						<View style={styles.signatureLine}>
							<Text style={styles.signatureLabel}>(Ký và ghi rõ họ tên)</Text>
						</View>
					</View>

					<View style={styles.signatureBox}>
						<Text style={styles.signatureLabel}>Người nhận hàng</Text>
						<View style={styles.signatureLine}>
							<Text style={styles.signatureLabel}>(Ký và ghi rõ họ tên)</Text>
						</View>
					</View>
				</View>
			</Page>
		</Document>
	);
};