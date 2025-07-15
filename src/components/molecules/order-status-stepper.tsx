/**
 * Order Status Stepper
 * Visual stepper component to show order progress
 */

import React from "react";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@/enums/order.enum";
import { CheckCircle, Circle, Clock, Truck, Package, Ban } from "lucide-react";

interface OrderStatusStepperProps {
	currentStatus: OrderStatus;
	className?: string;
}

interface StepConfig {
	status: OrderStatus;
	label: string;
	icon: React.ReactNode;
	color: {
		active: string;
		completed: string;
		inactive: string;
	};
}

const STEP_CONFIGS: StepConfig[] = [
	{
		status: OrderStatus.NEW,
		label: "Đơn mới",
		icon: <Circle className="w-4 h-4" />,
		color: {
			active: "bg-blue-500 text-white border-blue-500",
			completed: "bg-green-500 text-white border-green-500",
			inactive: "bg-gray-200 text-gray-500 border-gray-300",
		},
	},
	{
		status: OrderStatus.WAREHOUSE_CONFIRMED,
		label: "Kho xác nhận",
		icon: <CheckCircle className="w-4 h-4" />,
		color: {
			active: "bg-blue-500 text-white border-blue-500",
			completed: "bg-green-500 text-white border-green-500",
			inactive: "bg-gray-200 text-gray-500 border-gray-300",
		},
	},
	{
		status: OrderStatus.NEED_PRODUCTION,
		label: "Cần SX",
		icon: <Clock className="w-4 h-4" />,
		color: {
			active: "bg-orange-500 text-white border-orange-500",
			completed: "bg-green-500 text-white border-green-500",
			inactive: "bg-gray-200 text-gray-500 border-gray-300",
		},
	},
	{
		status: OrderStatus.IN_PRODUCTION,
		label: "Đang SX",
		icon: <Package className="w-4 h-4" />,
		color: {
			active: "bg-orange-500 text-white border-orange-500",
			completed: "bg-green-500 text-white border-green-500",
			inactive: "bg-gray-200 text-gray-500 border-gray-300",
		},
	},
	{
		status: OrderStatus.READY,
		label: "Sẵn sàng",
		icon: <Package className="w-4 h-4" />,
		color: {
			active: "bg-purple-500 text-white border-purple-500",
			completed: "bg-green-500 text-white border-green-500",
			inactive: "bg-gray-200 text-gray-500 border-gray-300",
		},
	},
	{
		status: OrderStatus.DELIVERING,
		label: "Đang giao",
		icon: <Truck className="w-4 h-4" />,
		color: {
			active: "bg-blue-600 text-white border-blue-600",
			completed: "bg-green-500 text-white border-green-500",
			inactive: "bg-gray-200 text-gray-500 border-gray-300",
		},
	},
	{
		status: OrderStatus.DELIVERED,
		label: "Đã giao",
		icon: <CheckCircle className="w-4 h-4" />,
		color: {
			active: "bg-green-500 text-white border-green-500",
			completed: "bg-green-500 text-white border-green-500",
			inactive: "bg-gray-200 text-gray-500 border-gray-300",
		},
	},
	{
		status: OrderStatus.COMPLETED,
		label: "Hoàn thành",
		icon: <CheckCircle className="w-4 h-4" />,
		color: {
			active: "bg-green-600 text-white border-green-600",
			completed: "bg-green-600 text-white border-green-600",
			inactive: "bg-gray-200 text-gray-500 border-gray-300",
		},
	},
];

// Special status that doesn't follow the linear progression
const CANCELLED_CONFIG: StepConfig = {
	status: OrderStatus.CANCELLED,
	label: "Đã hủy",
	icon: <Ban className="w-4 h-4" />,
	color: {
		active: "bg-red-500 text-white border-red-500",
		completed: "bg-red-500 text-white border-red-500",
		inactive: "bg-gray-200 text-gray-500 border-gray-300",
	},
};

export const OrderStatusStepper: React.FC<OrderStatusStepperProps> = ({
	currentStatus,
	className,
}) => {
	// Handle cancelled status separately
	if (currentStatus === OrderStatus.CANCELLED) {
		return (
			<div className={cn("p-4 bg-red-50 border border-red-200 rounded-lg", className)}>
				<div className="flex items-center gap-3">
					<div className={cn(
						"flex items-center justify-center w-8 h-8 rounded-full border-2",
						CANCELLED_CONFIG.color.active
					)}>
						{CANCELLED_CONFIG.icon}
					</div>
					<div>
						<div className="font-medium text-red-700">Đơn hàng đã bị hủy</div>
						<div className="text-sm text-red-600">Đơn hàng này đã được hủy và không thể tiếp tục xử lý</div>
					</div>
				</div>
			</div>
		);
	}

	// Find current step index
	const currentStepIndex = STEP_CONFIGS.findIndex(step => step.status === currentStatus);

	// Get step state (completed, active, or inactive)
	const getStepState = (stepIndex: number): 'completed' | 'active' | 'inactive' => {
		if (stepIndex < currentStepIndex) return 'completed';
		if (stepIndex === currentStepIndex) return 'active';
		return 'inactive';
	};

	return (
		<div className={cn("p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg", className)}>
			<div className="flex items-center justify-between relative">
				{/* Progress Line */}
				<div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-300 -z-10">
					<div 
						className="h-full bg-green-500 transition-all duration-500"
						style={{ width: currentStepIndex >= 0 ? `${(currentStepIndex / (STEP_CONFIGS.length - 1)) * 100}%` : '0%' }}
					/>
				</div>

				{STEP_CONFIGS.map((step, index) => {
					const state = getStepState(index);
					const colorClass = step.color[state];

					return (
						<div key={step.status} className="flex flex-col items-center relative z-10">
							{/* Step Circle */}
							<div className={cn(
								"flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300",
								colorClass
							)}>
								{state === 'completed' ? (
									<CheckCircle className="w-4 h-4" />
								) : (
									step.icon
								)}
							</div>

							{/* Step Label */}
							<div className={cn(
								"mt-2 text-xs font-medium text-center whitespace-nowrap",
								state === 'active' ? "text-blue-700" : 
								state === 'completed' ? "text-green-700" : "text-gray-500"
							)}>
								{step.label}
							</div>

							{/* Active indicator */}
							{state === 'active' && (
								<div className="absolute -bottom-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
							)}
						</div>
					);
				})}
			</div>

			{/* Current Status Description */}
			<div className="mt-4 text-center">
				<div className="text-sm font-medium text-gray-800">
					{currentStepIndex >= 0 ? `Bước ${currentStepIndex + 1}/${STEP_CONFIGS.length}` : 'Trạng thái không xác định'}
				</div>
				<div className="text-xs text-gray-600 mt-1">
					{STEP_CONFIGS[currentStepIndex]?.label || 'Không xác định'}
				</div>
			</div>
		</div>
	);
};