import { type ColDef, type ICellRendererParams } from "ag-grid-community";
import dayjs from "dayjs";
import { useEffect, useState, useCallback } from "react";
import type { GetUserListRequest } from "@/interfaces/auth.interface";
import { usePagination } from "@/hooks/common/usePagination";
import { useGetProductList } from "@/services/product";
import { Product } from "@/models/product.model";
import {
	GetProductListRequest,
	ProductTableRow,
	ProductTableRowType,
} from "@/interfaces/product.interface";
import {
	NameCellRenderer,
	DescriptionCellRenderer,
	TypePriceCellRenderer,
	QuantityStatusCellRenderer,
	DateCellRenderer,
} from "@/components/product-table-cell-renderers";
import { OptimizedImage } from "@/components/molecules/optimized-image";
import { ImageIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

// Image Cell Renderer for Products and Variants
const ImageCellRenderer = (params: ICellRendererParams) => {
	const { data } = params;

	// For product rows, use product's file_key
	// For variant rows, use variant's file_key
	const fileKey =
		data.rowType === "product" ?
			data.rawProduct?.file_key
		:	data.rawVariant?.file_key;

	return (
		<div className="flex items-center justify-center h-full">
			<OptimizedImage
				fileKey={fileKey}
				alt={data.rowType === "product" ? "Product Image" : "Variant Image"}
				className="w-10 h-10 rounded-md object-cover"
				showLoading={false} // Don't show skeleton in table for better performance
				fallbackComponent={
					<div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
						<ImageIcon className="w-6 h-6 text-gray-400" />
					</div>
				}
			/>
		</div>
	);
};

const useProductManagement = () => {
	const { t } = useTranslation("common");
	const [searchParams, setSearchParams] = useState<
		Omit<GetUserListRequest, "page" | "limit" | "offset">
	>({});

	const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
		new Set()
	);

	const pagination = usePagination({
		initialPage: 1,
		initialLimit: 10,
	});

	// Prepare query parameters
	const queryParams: GetProductListRequest = {
		page: pagination.paginationState.current_page,
		limit: pagination.paginationState.records_per_page,
		...searchParams,
	};

	const {
		data: productListResponse,
		isLoading: isGetProductListPending,
		error,
		refetch,
	} = useGetProductList(queryParams);

	// Update pagination state when data changes
	useEffect(() => {
		if (productListResponse) {
			pagination.updatePagination({
				current_page: productListResponse.pagination?.current_page || 1,
				records_per_page:
					productListResponse.pagination?.records_per_page || 10,
				total_pages: productListResponse.pagination?.total_pages || 0,
				total_records: productListResponse.pagination?.total_records || 0,
			});
		}
	}, [productListResponse, pagination.updatePagination]);

	// Toggle expand/collapse for products
	const toggleProductExpansion = useCallback((productId: string) => {
		setExpandedProducts((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(productId)) {
				newSet.delete(productId);
			} else {
				newSet.add(productId);
			}
			return newSet;
		});
	}, []);

	// Transform products into flattened table rows
	const tableRows: ProductTableRow[] = (productListResponse?.data || []).reduce(
		(acc: ProductTableRow[], product: Product) => {
			// Add product row
			const productRow: ProductTableRow = {
				id: product.id,
				rowType: "product" as ProductTableRowType,
				level: 0,
				isExpanded: expandedProducts.has(product.id),
				name: product.name,
				description: product.description || "",
				item_type: product.item_type,
				file_key: product.file_key || undefined,
				created_at: product.created_at,
				updated_at: product.updated_at,
				rawProduct: product,
			};
			acc.push(productRow);

			// Add variant rows if product is expanded
			if (expandedProducts.has(product.id) && product.variants?.length) {
				product.variants.forEach((variant) => {
					const variantRow: ProductTableRow = {
						id: variant.id,
						rowType: "variant" as ProductTableRowType,
						level: 1,
						parentId: product.id,
						sku: variant.sku,
						size: variant.size || "",
						color: variant.color || "",
						gender: variant.gender || "",
						price: variant.price || 0,
						cost: variant.cost || 0,
						unit: variant.unit || "",
						quantity: variant.quantity || 0,
						status: variant.status || "",
						product_id: variant.product_id,
						file_key: variant.file_key || undefined,
						created_at: variant.created_at,
						updated_at: variant.updated_at,
						rawVariant: variant,
					};
					acc.push(variantRow);
				});
			}

			return acc;
		},
		[]
	);

	const colDefs: ColDef<ProductTableRow>[] = [
		{
			headerName: "Image",
			field: "file_key",
			width: 80,
			cellRenderer: ImageCellRenderer,
			sortable: false,
			resizable: false,
		},
		{
			headerName: t("modules.products.columns.name"),
			field: "name",
			flex: 2,
			cellRenderer: NameCellRenderer,
			cellRendererParams: {
				toggleProductExpansion,
			},
			sortable: false,
		},
		{
			headerName: "Description / Size",
			field: "description",
			flex: 2,
			cellRenderer: DescriptionCellRenderer,
		},
		{
			headerName: "Type / Price",
			field: "item_type",
			width: 150,
			cellRenderer: TypePriceCellRenderer,
		},
		{
			headerName: t("modules.products.columns.stock"),
			field: "quantity",
			width: 120,
			cellRenderer: QuantityStatusCellRenderer,
		},
		{
			headerName: t("modules.users.columns.createdAt"),
			field: "created_at",
			width: 120,
			cellRenderer: DateCellRenderer,
		},
		{
			headerName: t("modules.users.columns.updatedAt"),
			field: "updated_at",
			width: 120,
			cellRenderer: DateCellRenderer,
		},
	];

	// Search and filter functions
	const setSearch = (search: string) => {
		setSearchParams((prev) => ({ ...prev, q: search }));
		pagination.setPage(1); // Reset to first page when searching
	};

	const setRoleFilter = (role: string) => {
		setSearchParams((prev) => ({ ...prev, role }));
		pagination.setPage(1); // Reset to first page when filtering
	};

	const setStatusFilter = (status: string) => {
		setSearchParams((prev) => ({ ...prev, status }));
		pagination.setPage(1); // Reset to first page when filtering
	};

	const setSortBy = (sortBy: string, sortOrder: "asc" | "desc") => {
		setSearchParams((prev) => ({ ...prev, sortBy, sortOrder }));
	};

	const clearFilters = () => {
		setSearchParams({});
		pagination.setPage(1);
	};

	// Expand/collapse all products
	const expandAll = () => {
		const allProductIds = new Set(
			(productListResponse?.data || []).map((p) => p.id)
		);
		setExpandedProducts(allProductIds);
	};

	const collapseAll = () => {
		setExpandedProducts(new Set());
	};

	return {
		// Data
		productList: productListResponse?.data || [],
		tableRows,
		total: productListResponse?.pagination?.total_records || 0,
		isGetProductListPending,
		error,
		colDefs,

		// Tree functionality
		expandedProducts,
		toggleProductExpansion,
		expandAll,
		collapseAll,

		// Pagination
		pagination: pagination.paginationState,
		setPage: pagination.setPage,
		setLimit: pagination.setLimit,
		nextPage: pagination.nextPage,
		prevPage: pagination.prevPage,
		goToFirstPage: pagination.goToFirstPage,
		goToLastPage: pagination.goToLastPage,
		canGoNext: pagination.canGoNext,
		canGoPrev: pagination.canGoPrev,

		// Search and filters
		searchParams,
		setSearch,
		setRoleFilter,
		setStatusFilter,
		setSortBy,
		clearFilters,

		// Actions
		refetch,
	};
};

export default useProductManagement;
