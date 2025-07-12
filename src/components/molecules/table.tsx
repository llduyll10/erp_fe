import React, { ReactElement, Ref } from "react";
import { cn } from "@/lib/utils";
import {
	CellClassParams,
	CellValueChangedEvent,
	ColDef,
	ColumnResizedEvent,
	DomLayoutType,
	FirstDataRenderedEvent,
	GridOptions,
	GridReadyEvent,
	RowDataUpdatedEvent,
	SelectionChangedEvent,
	SortChangedEvent,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useTranslation } from "react-i18next";
import Loading from "@/components/layout/loading";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

type TableProps<T> = {
	rowData: T[] | undefined;
	pinnedBottomRowData?: Partial<T>[] | undefined;
	columnDefs: ColDef[];
	pagination?: boolean;
	paginationPageSize?: number;
	paginationPageSizeSelector?: number[];
	rowSelection?: "singleRow" | "multiRow";
	className?: string;
	onSelectionChanged?: (event: SelectionChangedEvent<T, unknown>) => void;
	onCellValueChanged?: (event: CellValueChangedEvent) => void;
	onSortChanged?: (event: SortChangedEvent) => void;
	onGridReady?: (event: GridReadyEvent) => void;
	gridOptions?: GridOptions;
	domLayout?: DomLayoutType;
	popupParent?: HTMLElement | null;
	isLoading?: boolean;
	onFirstDataRendered?: (params: FirstDataRenderedEvent) => void;
	onRowDataUpdated?: (params: RowDataUpdatedEvent) => void;
	tabIndex?: number;
	tableId?: string;
	noRowsOverlayClassName?: string;
	suppressRowHoverHighlight?: boolean;
	context?: any;
};

type PropsWithForwardRef<T> = TableProps<T> & {
	forwardedRef?: Ref<AgGridReact>;
};

function Table<T>({
	rowData,
	pinnedBottomRowData,
	columnDefs,
	pagination = true,
	paginationPageSize = 50,
	paginationPageSizeSelector = [10, 20, 50, 100],
	rowSelection,
	className,
	onSelectionChanged,
	onCellValueChanged,
	onSortChanged,
	onGridReady,
	gridOptions,
	domLayout,
	popupParent,
	isLoading,
	forwardedRef,
	onFirstDataRendered,
	onRowDataUpdated,
	tabIndex,
	tableId,
	noRowsOverlayClassName,
	suppressRowHoverHighlight = true,
	context,
}: PropsWithForwardRef<T>): ReactElement {
	const { t } = useTranslation();
	const mergedGridOptions: GridOptions = {
		...gridOptions,
		defaultColDef: {
			...gridOptions?.defaultColDef,
			sortable: true,
			comparator: () => 0, // keep the order of the data from the API response
		},
		suppressDragLeaveHidesColumns: true,
		suppressRowHoverHighlight,
	};

	const getMergedColumnDefs = () => {
		const savedColumnState = tableId ? localStorage.getItem(tableId) : null;
		if (!savedColumnState) return columnDefs;
		try {
			const parsedColumnState = JSON.parse(savedColumnState);
			return columnDefs.map((colDef) => {
				const savedColumn = parsedColumnState.find(
					(state: ColDef) => state.colId === colDef.field
				);
				if (savedColumn) {
					return {
						...colDef,
						width: savedColumn.width,
						hide: savedColumn.hide,
					};
				}
				return colDef;
			});
		} catch (error) {
			console.error("Error parsing saved column state:", error);
			return columnDefs;
		}
	};

	const mergedColumnDefs = getMergedColumnDefs();

	const enhancedColumnDefs = mergedColumnDefs.map((colDef) => ({
		...colDef,
		cellClassRules: {
			...colDef.cellClassRules,
			"bg-input-enabled": (params: CellClassParams) => !!params.colDef.editable,
			"hover:bg-background-tertiary": (params: CellClassParams) =>
				!!params.colDef.editable,
		},
	}));

	const onColumnResized = (params: ColumnResizedEvent) => {
		if (params.finished && tableId) {
			const columnState = params.api.getColumnState();
			localStorage.setItem(tableId, JSON.stringify(columnState));
		}
	};

	return (
		<div
			className={cn(
				"ag-theme-quartz w-full",
				!rowData?.length && "h-[150px]",
				className
			)}>
			<AgGridReact
				loading={isLoading}
				ref={forwardedRef}
				rowData={rowData}
				columnDefs={enhancedColumnDefs}
				{...(rowSelection && {
					rowSelection: rowSelection === "multiRow" ? "multiple" : "single",
				})}
				pagination={pagination}
				suppressRowHoverHighlight={suppressRowHoverHighlight}
				paginationPageSize={paginationPageSize}
				paginationPageSizeSelector={paginationPageSizeSelector}
				onSelectionChanged={onSelectionChanged}
				onCellValueChanged={onCellValueChanged}
				onSortChanged={onSortChanged}
				onGridReady={onGridReady}
				gridOptions={mergedGridOptions}
				domLayout={domLayout}
				popupParent={popupParent}
				context={context}
				noRowsOverlayComponent={() => {
					return (
						<div
							className={cn(
								"absolute w-full h-full top-[25px] py-[24px] left-0 bg-white px-[8px] text-sm text-left",
								noRowsOverlayClassName
							)}>
							{t("table.noData", "No data available")}
						</div>
					);
				}}
				loadingOverlayComponent={Loading}
				pinnedBottomRowData={pinnedBottomRowData}
				onFirstDataRendered={onFirstDataRendered}
				onRowDataUpdated={onRowDataUpdated}
				tabIndex={tabIndex}
				onColumnResized={onColumnResized}
			/>
		</div>
	);
}

Table.displayName = "Table";

export default Table;
