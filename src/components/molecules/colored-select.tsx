/**
 * Colored Select Components
 * Select components with color coding based on status values
 */

import React from "react";
import { cn } from "@/lib/utils";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { 
	OrderStatus, 
	FulfillmentStatus, 
	PaymentStatus, 
	ProductionStatus 
} from "@/enums/order.enum";
import { ProductUnit } from "@/enums/product.enum";

// Color configuration for different status types
const STATUS_COLORS = {
	[OrderStatus.NEW]: "border-blue-300 bg-blue-50 text-blue-700",
	[OrderStatus.WAREHOUSE_CONFIRMED]: "border-cyan-300 bg-cyan-50 text-cyan-700",
	[OrderStatus.NEED_PRODUCTION]: "border-orange-300 bg-orange-50 text-orange-700",
	[OrderStatus.IN_PRODUCTION]: "border-orange-400 bg-orange-100 text-orange-800",
	[OrderStatus.READY]: "border-purple-300 bg-purple-50 text-purple-700",
	[OrderStatus.DELIVERING]: "border-blue-400 bg-blue-100 text-blue-800",
	[OrderStatus.DELIVERED]: "border-green-400 bg-green-100 text-green-800",
	[OrderStatus.COMPLETED]: "border-green-500 bg-green-100 text-green-900",
	[OrderStatus.CANCELLED]: "border-red-400 bg-red-100 text-red-800",

	[FulfillmentStatus.PENDING]: "border-yellow-300 bg-yellow-50 text-yellow-700",
	[FulfillmentStatus.IN_PRODUCTION]: "border-orange-300 bg-orange-50 text-orange-700",
	[FulfillmentStatus.STOCK_READY]: "border-purple-300 bg-purple-50 text-purple-700",
	[FulfillmentStatus.SHIPPED]: "border-green-400 bg-green-100 text-green-800",

	[PaymentStatus.UNPAID]: "border-red-300 bg-red-50 text-red-700",
	[PaymentStatus.PARTIAL]: "border-yellow-400 bg-yellow-100 text-yellow-800",
	[PaymentStatus.PAID]: "border-green-400 bg-green-100 text-green-800",
	[PaymentStatus.REFUNDED]: "border-gray-400 bg-gray-100 text-gray-800",

	[ProductionStatus.PENDING]: "border-yellow-300 bg-yellow-50 text-yellow-700",
	[ProductionStatus.IN_PROGRESS]: "border-orange-300 bg-orange-50 text-orange-700",
	[ProductionStatus.DONE]: "border-green-400 bg-green-100 text-green-800",

	[ProductUnit.PIECE]: "border-blue-300 bg-blue-50 text-blue-700",
	[ProductUnit.SET]: "border-purple-300 bg-purple-50 text-purple-700",
	[ProductUnit.PAIR]: "border-green-300 bg-green-50 text-green-700",
};

// Status badges for dropdown items
const STATUS_BADGES = {
	[OrderStatus.NEW]: "🆕",
	[OrderStatus.WAREHOUSE_CONFIRMED]: "✅",
	[OrderStatus.NEED_PRODUCTION]: "⏳",
	[OrderStatus.IN_PRODUCTION]: "🏭",
	[OrderStatus.READY]: "📦",
	[OrderStatus.DELIVERING]: "🚚",
	[OrderStatus.DELIVERED]: "✅",
	[OrderStatus.COMPLETED]: "🎉",
	[OrderStatus.CANCELLED]: "❌",

	[FulfillmentStatus.PENDING]: "⏳",
	[FulfillmentStatus.IN_PRODUCTION]: "🏭",
	[FulfillmentStatus.STOCK_READY]: "📦",
	[FulfillmentStatus.SHIPPED]: "🚚",

	[PaymentStatus.UNPAID]: "❌",
	[PaymentStatus.PARTIAL]: "⚠️",
	[PaymentStatus.PAID]: "✅",
	[PaymentStatus.REFUNDED]: "↩️",

	[ProductionStatus.PENDING]: "⏳",
	[ProductionStatus.IN_PROGRESS]: "🏭",
	[ProductionStatus.DONE]: "✅",

	[ProductUnit.PIECE]: "📱",
	[ProductUnit.SET]: "📦",
	[ProductUnit.PAIR]: "👟",
};

interface ColoredSelectProps {
	value?: string;
	onValueChange?: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	options: Array<{
		value: string;
		label: string;
	}>;
	className?: string;
}

export const ColoredSelect: React.FC<ColoredSelectProps> = ({
	value,
	onValueChange,
	placeholder,
	disabled,
	options,
	className,
}) => {
	const currentColor = value ? STATUS_COLORS[value as keyof typeof STATUS_COLORS] : "";
	const currentBadge = value ? STATUS_BADGES[value as keyof typeof STATUS_BADGES] : "";

	return (
		<Select onValueChange={onValueChange} value={value} disabled={disabled}>
			<SelectTrigger 
				className={cn(
					"transition-all duration-200",
					currentColor,
					className
				)}
			>
				<SelectValue placeholder={placeholder}>
					{value && (
						<span className="flex items-center gap-2">
							<span>{currentBadge}</span>
							<span>{options.find(opt => opt.value === value)?.label}</span>
						</span>
					)}
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{options.map((option) => {
					const optionColor = STATUS_COLORS[option.value as keyof typeof STATUS_COLORS];
					const optionBadge = STATUS_BADGES[option.value as keyof typeof STATUS_BADGES];
					
					return (
						<SelectItem 
							key={option.value} 
							value={option.value}
							className={cn(
								"flex items-center gap-2 cursor-pointer transition-colors",
								"hover:bg-opacity-20"
							)}
						>
							<span className="flex items-center gap-2">
								<span>{optionBadge}</span>
								<span>{option.label}</span>
							</span>
							{/* Color indicator */}
							<div className={cn(
								"ml-auto w-3 h-3 rounded-full border",
								optionColor?.split(' ')[0]?.replace('border-', 'bg-')
							)} />
						</SelectItem>
					);
				})}
			</SelectContent>
		</Select>
	);
};

// Specific components for each status type
interface OrderStatusSelectProps {
	value?: OrderStatus;
	onValueChange?: (value: OrderStatus) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
}

export const OrderStatusSelect: React.FC<OrderStatusSelectProps> = (props) => {
	const options = [
		{ value: OrderStatus.NEW, label: "Đơn hàng mới" },
		{ value: OrderStatus.WAREHOUSE_CONFIRMED, label: "Kho xác nhận" },
		{ value: OrderStatus.NEED_PRODUCTION, label: "Cần sản xuất" },
		{ value: OrderStatus.IN_PRODUCTION, label: "Đang sản xuất" },
		{ value: OrderStatus.READY, label: "Sẵn sàng" },
		{ value: OrderStatus.DELIVERING, label: "Đang giao hàng" },
		{ value: OrderStatus.DELIVERED, label: "Đã giao" },
		{ value: OrderStatus.COMPLETED, label: "Hoàn thành" },
		{ value: OrderStatus.CANCELLED, label: "Đã hủy" },
	];

	return (
		<ColoredSelect
			{...props}
			options={options}
			placeholder={props.placeholder || "Chọn trạng thái đơn hàng"}
		/>
	);
};

interface FulfillmentStatusSelectProps {
	value?: FulfillmentStatus;
	onValueChange?: (value: FulfillmentStatus) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
}

export const FulfillmentStatusSelect: React.FC<FulfillmentStatusSelectProps> = (props) => {
	const options = [
		{ value: FulfillmentStatus.PENDING, label: "Chờ xử lý" },
		{ value: FulfillmentStatus.IN_PRODUCTION, label: "Đang sản xuất" },
		{ value: FulfillmentStatus.STOCK_READY, label: "Hàng sẵn sàng" },
		{ value: FulfillmentStatus.SHIPPED, label: "Đã giao" },
	];

	return (
		<ColoredSelect
			{...props}
			options={options}
			placeholder={props.placeholder || "Chọn trạng thái thực hiện"}
		/>
	);
};

interface PaymentStatusSelectProps {
	value?: PaymentStatus;
	onValueChange?: (value: PaymentStatus) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
}

export const PaymentStatusSelect: React.FC<PaymentStatusSelectProps> = (props) => {
	const options = [
		{ value: PaymentStatus.UNPAID, label: "Chưa thanh toán" },
		{ value: PaymentStatus.PARTIAL, label: "Thanh toán một phần" },
		{ value: PaymentStatus.PAID, label: "Đã thanh toán" },
		{ value: PaymentStatus.REFUNDED, label: "Đã hoàn tiền" },
	];

	return (
		<ColoredSelect
			{...props}
			options={options}
			placeholder={props.placeholder || "Chọn trạng thái thanh toán"}
		/>
	);
};

interface ProductUnitSelectProps {
	value?: ProductUnit;
	onValueChange?: (value: ProductUnit) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
}

export const ProductUnitSelect: React.FC<ProductUnitSelectProps> = (props) => {
	const options = [
		{ value: ProductUnit.PIECE, label: "Cái" },
		{ value: ProductUnit.SET, label: "Bộ" },
		{ value: ProductUnit.PAIR, label: "Đôi" },
	];

	return (
		<ColoredSelect
			{...props}
			options={options}
			placeholder={props.placeholder || "Chọn đơn vị"}
		/>
	);
};