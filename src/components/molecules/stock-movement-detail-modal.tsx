/**
 * Stock Movement Detail Modal
 * Shows detailed information about a stock movement transaction
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OptimizedImage } from "@/components/molecules/optimized-image";
import { 
	Package, 
	Calendar, 
	User, 
	FileText, 
	ArrowRight,
	Building2,
	ShoppingCart,
	ImageIcon
} from "lucide-react";
import type { StockMovement } from "@/models/warehouse.model";
import { StockMovementType, StockMovementReason } from "@/enums/warehouse.enum";

interface StockMovementDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	movement: StockMovement | null;
}

export function StockMovementDetailModal({
	isOpen,
	onClose,
	movement,
}: StockMovementDetailModalProps) {
	if (!movement) return null;

	const variant = movement.variant;
	const isStockIn = movement.type === StockMovementType.IN;

	// Get image key
	const imageKey = variant?.file_key || 
					variant?.product_file_key || 
					variant?.product?.file_key;

	// Reason labels
	const reasonLabels: Record<string, string> = {
		[StockMovementReason.SUPPLIER_DELIVERY]: "Nhập từ NCC",
		[StockMovementReason.CUSTOMER_RETURN]: "Trả hàng",
		[StockMovementReason.PRODUCTION_COMPLETED]: "Hoàn thành SX",
		[StockMovementReason.INVENTORY_ADJUSTMENT_IN]: "Điều chỉnh +",
		[StockMovementReason.TRANSFER_IN]: "Chuyển kho vào",
		[StockMovementReason.SALES_ORDER]: "Bán hàng",
		[StockMovementReason.PRODUCTION_MATERIAL]: "Nguyên liệu SX",
		[StockMovementReason.DAMAGED_GOODS]: "Hàng hỏng",
		[StockMovementReason.INVENTORY_ADJUSTMENT_OUT]: "Điều chỉnh -",
		[StockMovementReason.TRANSFER_OUT]: "Chuyển kho ra",
		[StockMovementReason.SAMPLE_GOODS]: "Hàng mẫu",
		[StockMovementReason.OTHER]: "Khác",
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Package className="h-5 w-5" />
						Chi tiết {isStockIn ? "nhập kho" : "xuất kho"}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* Movement Summary */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg flex items-center gap-2">
								<ArrowRight className={`h-5 w-5 ${isStockIn ? 'text-green-600' : 'text-red-600'}`} />
								Thông tin giao dịch
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Loại giao dịch
									</label>
									<div className="mt-1">
										<Badge 
											variant="outline" 
											className={isStockIn ? "text-green-700 border-green-200" : "text-red-700 border-red-200"}
										>
											{isStockIn ? "Nhập kho" : "Xuất kho"}
										</Badge>
									</div>
								</div>

								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Số lượng
									</label>
									<div className={`mt-1 text-lg font-semibold ${isStockIn ? 'text-green-600' : 'text-red-600'}`}>
										{isStockIn ? '+' : '-'}{movement.quantity?.toLocaleString() || 0}
									</div>
								</div>

								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Lý do
									</label>
									<div className="mt-1">
										<Badge variant="secondary">
											{reasonLabels[movement.reason_type || ''] || movement.reason_type}
										</Badge>
									</div>
								</div>

								<div>
									<label className="text-sm font-medium text-muted-foreground">
										<Calendar className="inline w-4 h-4 mr-1" />
										Thời gian
									</label>
									<div className="mt-1 text-sm">
										{movement.created_at ? new Date(movement.created_at).toLocaleString("vi-VN") : "-"}
									</div>
								</div>
							</div>

							{movement.reason && (
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										<FileText className="inline w-4 h-4 mr-1" />
										Ghi chú
									</label>
									<div className="mt-1 text-sm bg-muted p-3 rounded-md">
										{movement.reason}
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Product Information */}
					{variant && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<Package className="h-5 w-5" />
									Thông tin sản phẩm
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex gap-4">
									<div className="flex-shrink-0">
										<OptimizedImage
											fileKey={imageKey}
											alt={variant.variant_name || variant.display_name || variant.product?.name}
											className="w-20 h-20 rounded-lg object-cover border border-gray-200"
											showLoading={false}
											fallbackComponent={
												<div className="w-20 h-20 rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50">
													<ImageIcon className="w-8 h-8 text-gray-400" />
												</div>
											}
										/>
									</div>
									<div className="flex-1 space-y-2">
										<div>
											<h3 className="font-semibold text-lg">
												{variant.product?.name || variant.product_name || "-"}
											</h3>
											{variant.variant_name && (
												<p className="text-sm text-blue-600">{variant.variant_name}</p>
											)}
										</div>
										
										<div className="grid grid-cols-2 gap-4 text-sm">
											<div>
												<span className="text-muted-foreground">SKU:</span>
												<span className="ml-2 font-mono">{variant.sku}</span>
											</div>
											{variant.size && (
												<div>
													<span className="text-muted-foreground">Size:</span>
													<span className="ml-2">{variant.size}</span>
												</div>
											)}
											{variant.color && (
												<div>
													<span className="text-muted-foreground">Màu:</span>
													<span className="ml-2">{variant.color}</span>
												</div>
											)}
											{variant.gender && (
												<div>
													<span className="text-muted-foreground">Giới tính:</span>
													<span className="ml-2">{variant.gender}</span>
												</div>
											)}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Order Information (for stock out) */}
					{movement.order && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<ShoppingCart className="h-5 w-5" />
									Thông tin đơn hàng
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<span className="text-muted-foreground">Mã đơn hàng:</span>
										<span className="ml-2 font-medium text-blue-600">
											{movement.order.order_number}
										</span>
									</div>
									<div>
										<span className="text-muted-foreground">Trạng thái:</span>
										<span className="ml-2">
											<Badge variant="outline">{movement.order.status}</Badge>
										</span>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* User Information */}
					{movement.created_by_user && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<User className="h-5 w-5" />
									Người thực hiện
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-sm">
									<span className="font-medium">{movement.created_by_user.name}</span>
									{movement.created_by_user.email && (
										<span className="text-muted-foreground ml-2">
											({movement.created_by_user.email})
										</span>
									)}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Warehouse Information (if available) */}
					{movement.warehouse && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<Building2 className="h-5 w-5" />
									Thông tin kho
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2 text-sm">
									<div>
										<span className="font-medium">{movement.warehouse.name}</span>
									</div>
									{movement.warehouse.address && (
										<div className="text-muted-foreground">
											{movement.warehouse.address}
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}