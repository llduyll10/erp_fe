/**
 * Order Print Modal
 * Modal for previewing and printing order PDF
 */

import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PDFViewer, PDFDownloadLink, pdf } from "@react-pdf/renderer";
import { OrderPrintTemplate } from "./order-print-template";
import { Printer, Download, X, Loader2 } from "lucide-react";
import type { Order } from "@/models/order.model";
import type { Customer } from "@/models/customer.model";
import type { User } from "@/models/user.model";
import { toast } from "sonner";

interface OrderPrintModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	order: Order;
	customer?: Customer | null;
	salesRep?: User | null;
	orderItems?: any[];
}

export const OrderPrintModal: React.FC<OrderPrintModalProps> = ({
	open,
	onOpenChange,
	order,
	customer,
	salesRep,
	orderItems = [],
}) => {
	const [isGenerating, setIsGenerating] = useState(false);

	const handlePrint = async () => {
		try {
			setIsGenerating(true);

			// Generate PDF blob
			const doc = (
				<OrderPrintTemplate
					order={order}
					customer={customer}
					salesRep={salesRep}
					orderItems={orderItems}
				/>
			);

			const blob = await pdf(doc).toBlob();

			// Create object URL for printing
			const url = URL.createObjectURL(blob);

			// Open in new window for printing
			const printWindow = window.open(url, "_blank");

			if (printWindow) {
				printWindow.onload = () => {
					printWindow.print();
					// Clean up URL after printing
					setTimeout(() => {
						URL.revokeObjectURL(url);
					}, 1000);
				};
			} else {
				toast.error("Không thể mở cửa sổ in. Vui lòng kiểm tra trình duyệt.");
			}
		} catch (error) {
			console.error("Print error:", error);
			toast.error("Có lỗi xảy ra khi in đơn hàng. Vui lòng thử lại.");
		} finally {
			setIsGenerating(false);
		}
	};

	const getPDFFileName = () => {
		const orderNumber = order.order_number || order.id || "unknown";
		const date = new Date().toISOString().split("T")[0];
		return `don-hang-${orderNumber}-${date}.pdf`;
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-5xl h-[90vh] flex flex-col">
				<DialogHeader className="flex-shrink-0">
					<div className="flex items-center justify-between">
						<DialogTitle className="flex items-center gap-2">
							<Printer className="h-5 w-5" />
							Xem trước và in đơn hàng
						</DialogTitle>

						<div className="flex items-center gap-2 mt-4">
							{/* Download PDF Button */}
							<PDFDownloadLink
								document={
									<OrderPrintTemplate
										order={order}
										customer={customer}
										salesRep={salesRep}
										orderItems={orderItems}
									/>
								}
								fileName={getPDFFileName()}>
								{({ loading }) => (
									<Button
										variant="outline"
										size="sm"
										disabled={loading}
										className="gap-2">
										{loading ?
											<Loader2 className="h-4 w-4 animate-spin" />
										:	<Download className="h-4 w-4" />}
										{loading ? "Đang tạo..." : "Tải xuống"}
									</Button>
								)}
							</PDFDownloadLink>

							{/* Print Button */}
							<Button
								onClick={handlePrint}
								disabled={isGenerating}
								className="gap-2">
								{isGenerating ?
									<Loader2 className="h-4 w-4 animate-spin" />
								:	<Printer className="h-4 w-4" />}
								{isGenerating ? "Đang xử lý..." : "In ngay"}
							</Button>
						</div>
					</div>
				</DialogHeader>

				<Separator className="my-4" />

				{/* PDF Preview */}
				<div className="flex-1 min-h-0 border rounded-lg overflow-hidden bg-gray-100">
					<PDFViewer
						style={{
							width: "100%",
							height: "100%",
							border: "none",
						}}
						showToolbar={true}>
						<OrderPrintTemplate
							order={order}
							customer={customer}
							salesRep={salesRep}
							orderItems={orderItems}
						/>
					</PDFViewer>
				</div>

				{/* Footer Instructions */}
				<div className="flex-shrink-0 mt-4 p-4 bg-blue-50 rounded-lg">
					<div className="flex items-start gap-3">
						<div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
						<div className="text-sm text-blue-800">
							<p className="font-medium mb-1">Hướng dẫn sử dụng:</p>
							<ul className="space-y-1 text-blue-700">
								<li>
									• <strong>Xem trước:</strong> Kiểm tra thông tin đơn hàng
									trước khi in
								</li>
								<li>
									• <strong>In ngay:</strong> Mở cửa sổ in của trình duyệt
								</li>
								<li>
									• <strong>Tải xuống:</strong> Lưu file PDF vào máy tính
								</li>
							</ul>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
