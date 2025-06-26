import { type ICellRendererParams } from "ag-grid-community";
import dayjs from "dayjs";
import { ChevronRight, ChevronDown, Package, Shirt } from "lucide-react";
import { ProductTableRow } from "@/interfaces/product.interface";

interface NameCellRendererProps extends ICellRendererParams<ProductTableRow> {
	toggleProductExpansion: (productId: string) => void;
}

export function NameCellRenderer(props: NameCellRendererProps) {
	const row = props.data;
	if (!row) return <div></div>;

	const paddingLeft = row.level * 24;

	if (row.rowType === "product") {
		const hasVariants = row.rawProduct?.variants?.length || 0;
		const isExpanded = row.isExpanded;

		return (
			<div
				className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
				style={{ paddingLeft: `${paddingLeft}px` }}
				onClick={() => hasVariants && props.toggleProductExpansion(row.id)}>
				{hasVariants > 0 && (
					<span className="mr-2">
						{isExpanded ?
							<ChevronDown className="w-4 h-4" />
						:	<ChevronRight className="w-4 h-4" />}
					</span>
				)}
				<Package className="w-4 h-4 mr-2 text-blue-600" />
				<span className="font-medium">{row.name}</span>
				{hasVariants > 0 && (
					<span className="ml-2 text-sm text-gray-500">
						({hasVariants} variants)
					</span>
				)}
			</div>
		);
	} else {
		return (
			<div
				className="flex items-center"
				style={{ paddingLeft: `${paddingLeft}px` }}>
				<Shirt className="w-4 h-4 mr-2 text-green-600" />
				<span className="text-sm text-gray-700">{row.sku}</span>
			</div>
		);
	}
}

export function DescriptionCellRenderer(
	props: ICellRendererParams<ProductTableRow>
) {
	const row = props.data;
	if (!row) return <div></div>;

	if (row.rowType === "product") {
		return <div>{row.description || ""}</div>;
	} else {
		return (
			<div className="text-sm">
				<span className="font-medium">{row.size}</span>
				{row.color && <span className="ml-2 text-gray-600">• {row.color}</span>}
				{row.gender && (
					<span className="ml-2 text-gray-600">• {row.gender}</span>
				)}
			</div>
		);
	}
}

export function TypePriceCellRenderer(
	props: ICellRendererParams<ProductTableRow>
) {
	const row = props.data;
	if (!row) return <div></div>;

	if (row.rowType === "product") {
		return (
			<span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
				{row.item_type}
			</span>
		);
	} else {
		return (
			<div className="text-sm">
				<div className="font-medium text-green-600">
					{row.price?.toLocaleString("vi-VN")} VND
				</div>
				{row.cost && (
					<div className="text-xs text-gray-500">
						Cost: {row.cost.toLocaleString("vi-VN")} VND
					</div>
				)}
			</div>
		);
	}
}

export function QuantityStatusCellRenderer(
	props: ICellRendererParams<ProductTableRow>
) {
	const row = props.data;
	if (!row) return <div></div>;

	if (row.rowType === "product") {
		const totalQuantity =
			row.rawProduct?.variants?.reduce(
				(sum, variant) => sum + (variant.quantity || 0),
				0
			) || 0;
		return <span className="text-sm font-medium">{totalQuantity} total</span>;
	} else {
		return (
			<div className="text-sm">
				<div className="font-medium">
					{row.quantity || 0} {row.unit}
				</div>
				<div
					className={`text-xs px-1 py-0.5 rounded ${
						row.status === "active" ?
							"bg-green-100 text-green-800"
						:	"bg-red-100 text-red-800"
					}`}>
					{row.status}
				</div>
			</div>
		);
	}
}

export function DateCellRenderer(props: ICellRendererParams<ProductTableRow>) {
	const date = props.value;
	if (!date) return <div></div>;

	return <div>{dayjs(date).format("DD/MM/YYYY")}</div>;
}
