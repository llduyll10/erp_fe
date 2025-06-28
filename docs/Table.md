# Table Workflow Documentation

## 📋 Tổng quan

Dự án sử dụng **AG Grid Community** để tạo table với tính năng mạnh mẽ: sorting, filtering, pagination, custom cell renderers. Tất cả table đều follow pattern tương tự để đảm bảo consistency.

## 🏗️ Cấu trúc Table

### 1. Management Hook Pattern

```typescript
// src/hooks/customer/useCustomerManagement.tsx
const useCustomerManagement = () => {
	const [searchParams, setSearchParams] = useState<
		Omit<GetCustomerListRequest, "page" | "limit" | "offset">
	>({});

	const pagination = usePagination({
		initialPage: 1,
		initialLimit: 10,
	});

	// Prepare query parameters
	const queryParams: GetCustomerListRequest = {
		page: pagination.paginationState.current_page,
		limit: pagination.paginationState.records_per_page,
		...searchParams,
	};

	const {
		data: customerListResponse,
		isLoading: isGetCustomerListPending,
		error,
		refetch,
	} = useGetCustomerList(queryParams);

	// Update pagination state when data changes
	useEffect(() => {
		if (customerListResponse) {
			pagination.updatePagination({
				current_page: customerListResponse.pagination?.current_page || 1,
				records_per_page:
					customerListResponse.pagination?.records_per_page || 10,
				total_pages: customerListResponse.pagination?.total_pages || 0,
				total_records: customerListResponse.pagination?.total_records || 0,
			});
		}
	}, [customerListResponse, pagination.updatePagination]);

	// Column definitions
	const colDefs: ColDef<Customer>[] = [
		{
			headerName: "Customer Code",
			field: "customer_code",
			width: 120,
			pinned: "left", // Pin important columns
		},
		{
			headerName: "Name",
			field: "name",
			flex: 1, // Flexible width
			minWidth: 150,
		},
		{
			headerName: "Status",
			field: "status",
			width: 100,
			cellRenderer: CustomerStatusCellRenderer, // Custom renderer
		},
		// ... other columns
	];

	// Search and filter functions
	const setSearch = (search: string) => {
		setSearchParams((prev) => ({ ...prev, q: search }));
		pagination.setPage(1); // Reset to first page when searching
	};

	return {
		customerList: customerListResponse?.data || [],
		total: customerListResponse?.pagination?.total_records || 0,
		isGetCustomerListPending,
		colDefs,
		pagination: pagination.paginationState,
		setPage: pagination.setPage,
		setSearch,
		refetch,
	};
};
```

### 2. Custom Cell Renderers

```typescript
// Badge Cell Renderer cho Status/Group/Type
const CustomerStatusCellRenderer = (params: any) => {
  const { value } = params;
  if (!value) return "-";

  const colorMap: Record<string, string> = {
    [CustomerStatus.ACTIVE]: "bg-green-100 text-green-800",
    [CustomerStatus.INACTIVE]: "bg-red-100 text-red-800",
  };

  return (
    <Badge className={colorMap[value] || "bg-gray-100 text-gray-800"}>
      {value.toUpperCase()}
    </Badge>
  );
};

// Address Cell Renderer - Join multiple fields
const AddressCellRenderer = (params: any) => {
  const { data } = params;
  const address = [
    data.street_address,
    data.ward,
    data.district,
    data.state_province,
    data.country
  ].filter(Boolean).join(", ");

  return (
    <div className="text-sm">
      {address || "-"}
    </div>
  );
};

// Date Cell Renderer với format Việt Nam
const DateCellRenderer = (params: any) => {
  const { value } = params;
  if (!value) return "-";

  const date = new Date(value);
  return (
    <div className="text-sm text-gray-600">
      {date.toLocaleDateString("vi-VN")}
    </div>
  );
};

// Image Cell Renderer với fallback
const ImageCellRenderer = (params: any) => {
  const { data } = params;
  const fileKey = data.file_key;

  return (
    <div className="flex items-center justify-center h-full">
      <OptimizedImage
        fileKey={fileKey}
        alt="Customer Image"
        className="w-10 h-10 rounded-md object-cover"
        showLoading={false}
        fallbackComponent={
          <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-gray-400" />
          </div>
        }
      />
    </div>
  );
};
```

### 3. Table Component Setup

```typescript
// src/pages/CustomerManagement/index.tsx
export function CustomerManagementPage() {
  const {
    customerList,
    total,
    isGetCustomerListPending,
    colDefs,
    pagination,
    setPage,
    setLimit,
    setSearch,
    refetch,
  } = useCustomerManagement();

  const handleRowClick = (event: any) => {
    const rowData = event.data;
    if (!rowData) return;

    // Navigate to detail page
    if (rowData.id) {
      navigate(`/dashboard/customers/detail/${rowData.id}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Search và Controls */}
      <div className="flex flex-col gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>
          <Button onClick={handleSearch} size="sm">
            Search
          </Button>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          {total} customer{total !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* AG Grid Table */}
      <div className="w-full">
        <div className="flex flex-col border border-none rounded-md">
          <Table
            className={cn(
              "mt-[12px] gray-highlight-table",
              !customerList?.length && "h-[150px]"
            )}
            rowData={customerList}
            columnDefs={colDefs}
            pagination={false} // Disable AG Grid pagination
            onSortChanged={() => {}}
            onFirstDataRendered={() => {}}
            isLoading={isGetCustomerListPending}
            popupParent={null}
            suppressRowHoverHighlight={false}
            noRowsOverlayClassName="top-[50px]"
            gridOptions={{
              headerHeight: 60,
              rowHeight: 72,
              suppressRowHoverHighlight: true,
              getRowId: (params) => params.data.id,
              onRowClicked: handleRowClick,
              defaultColDef: {
                sortable: true,
                editable: false,
                resizable: true,
                headerClass: [
                  "!text-lg",
                  "text-text-default",
                  "bg-background-grayDark",
                  "text-left",
                  "[&_.ag-header-cell-label]:justify-start",
                  "[&_.ag-header-cell-label]:pl-[16px]",
                ],
              },
              getRowClass: () => {
                return "cursor-pointer hover:bg-gray-50";
              },
            }}
            domLayout="autoHeight"
          />
        </div>
      </div>

      {/* Custom Pagination */}
      {total > 0 && (
        <Pagination
          currentPage={pagination.current_page}
          totalPages={pagination.total_pages}
          totalItems={total}
          pageSize={pagination.records_per_page}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
          className="mt-4"
        />
      )}
    </div>
  );
}
```

## 🌳 Tree Table Pattern (Product với Variants)

### 1. Tree Data Structure

```typescript
// Transform products thành flattened table rows
const tableRows: ProductTableRow[] = (productListResponse?.data || []).reduce(
	(acc: ProductTableRow[], product: Product) => {
		// Add product row
		const productRow: ProductTableRow = {
			id: product.id,
			rowType: "product",
			level: 0,
			isExpanded: expandedProducts.has(product.id),
			name: product.name,
			// ... other fields
			rawProduct: product,
		};
		acc.push(productRow);

		// Add variant rows if expanded
		if (expandedProducts.has(product.id) && product.variants?.length) {
			product.variants.forEach((variant) => {
				const variantRow: ProductTableRow = {
					id: variant.id,
					rowType: "variant",
					level: 1,
					parentId: product.id,
					sku: variant.sku,
					// ... other fields
					rawVariant: variant,
				};
				acc.push(variantRow);
			});
		}

		return acc;
	},
	[]
);
```

### 2. Tree Cell Renderer

```typescript
const NameCellRenderer = (params: ICellRendererParams) => {
  const { data, node } = params;
  const { toggleProductExpansion } = params.colDef?.cellRendererParams || {};

  if (data.rowType === "product") {
    const hasVariants = data.rawProduct?.variants?.length > 0;

    return (
      <div className="flex items-center gap-2">
        {hasVariants && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleProductExpansion(data.id);
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {data.isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        <span className="font-medium">{data.name}</span>
      </div>
    );
  } else {
    // Variant row
    return (
      <div className="pl-8 flex items-center">
        <span className="text-sm text-gray-600">SKU: {data.sku}</span>
      </div>
    );
  }
};
```

## 🔧 Best Practices

### 1. Performance Optimization

```typescript
// ✅ Use proper keys cho row identification
getRowId: (params) => params.data.id;

// ✅ Virtualization cho large datasets
domLayout = "normal"; // instead of "autoHeight" for very large tables

// ✅ Lazy loading pagination
const queryParams = {
	page: pagination.current_page,
	limit: pagination.records_per_page,
};

// ✅ Debounce search input
const debouncedSearch = useDebounce(localSearch, 500);
useEffect(() => {
	setSearch(debouncedSearch);
}, [debouncedSearch]);
```

### 2. Column Configuration

```typescript
const colDefs: ColDef<Customer>[] = [
	{
		headerName: "Customer Code",
		field: "customer_code",
		width: 120,
		pinned: "left", // Pin important columns
		sortable: true,
		resizable: true,
	},
	{
		headerName: "Name",
		field: "name",
		flex: 1, // Flexible width
		minWidth: 150,
		maxWidth: 300, // Prevent too wide
	},
	{
		headerName: "Actions",
		field: "actions",
		width: 100,
		sortable: false, // No sorting for action columns
		cellRenderer: ActionsCellRenderer,
		pinned: "right",
	},
];
```

### 3. Loading States

```typescript
// ✅ Show loading overlay
<Table
  isLoading={isGetCustomerListPending}
  loadingOverlayComponent="Loading..."
/>

// ✅ Skeleton for initial load
if (isGetCustomerListPending && pagination.current_page === 1) {
  return <Loading />;
}

// ✅ Preserve data while reloading
// AG Grid tự động preserve data khi isLoading=true
```

### 4. Error Handling

```typescript
// ✅ Error boundary cho cell renderers
const SafeCellRenderer = (params: any) => {
  try {
    return <YourCellRenderer {...params} />;
  } catch (error) {
    console.error('Cell renderer error:', error);
    return <span>Error</span>;
  }
};

// ✅ Handle missing data
const AddressCellRenderer = (params: any) => {
  const { data } = params;
  if (!data) return "-";

  const address = [
    data.street_address,
    data.district,
    data.state_province
  ].filter(Boolean).join(", ");

  return address || "-";
};
```

## 📱 Responsive Design

```typescript
// ✅ Hide columns on mobile
const colDefs: ColDef<Customer>[] = [
  {
    headerName: "Customer Code",
    field: "customer_code",
    hide: window.innerWidth < 768, // Hide on mobile
  },
  {
    headerName: "Name",
    field: "name",
    flex: 1,
    minWidth: window.innerWidth < 768 ? 200 : 150,
  },
];

// ✅ Responsive grid options
gridOptions={{
  headerHeight: window.innerWidth < 768 ? 50 : 60,
  rowHeight: window.innerWidth < 768 ? 60 : 72,
}}
```

## 🧪 Testing

```typescript
describe('CustomerTable', () => {
  it('should render customer data correctly', () => {
    const mockData = [
      { id: '1', name: 'John Doe', email: 'john@example.com' }
    ];

    render(<CustomerTable data={mockData} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should handle row click navigation', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    render(<CustomerTable data={mockData} />);

    fireEvent.click(screen.getByText('John Doe'));

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/customers/detail/1');
  });

  it('should handle search functionality', async () => {
    render(<CustomerManagementPage />);

    const searchInput = screen.getByPlaceholderText('Search by name, email, phone...');
    fireEvent.change(searchInput, { target: { value: 'John' } });
    fireEvent.keyDown(searchInput, { key: 'Enter' });

    await waitFor(() => {
      expect(mockSetSearch).toHaveBeenCalledWith('John');
    });
  });
});
```

## 🚀 Migration Guide

Khi thêm table mới:

1. **Tạo management hook** trong `hooks/[module]/use[Module]Management.tsx`
2. **Define column definitions** với proper types
3. **Implement custom cell renderers** nếu cần
4. **Setup pagination** với usePagination hook
5. **Add search/filter functionality**
6. **Implement row click handlers** cho navigation
7. **Test responsive behavior** trên mobile
8. **Add proper loading states** và error handling

## 📊 Advanced Features

### 1. Export functionality

```typescript
const exportToCSV = () => {
	const csvData = customerList.map((customer) => ({
		"Customer Code": customer.customer_code,
		Name: customer.name,
		Email: customer.email,
		Phone: customer.phone_number,
	}));

	downloadCSV(csvData, "customers.csv");
};
```

### 2. Bulk actions

```typescript
const [selectedRows, setSelectedRows] = useState<string[]>([]);

// Checkbox column
{
  headerName: "",
  width: 50,
  checkboxSelection: true,
  headerCheckboxSelection: true,
}

// Handle selection
onSelectionChanged: (event) => {
  const selectedNodes = event.api.getSelectedNodes();
  setSelectedRows(selectedNodes.map(node => node.data.id));
}
```

### 3. Column state persistence

```typescript
// Save column state
onColumnStateChanged: (event) => {
	const columnState = event.columnApi.getColumnState();
	localStorage.setItem("customerTableColumns", JSON.stringify(columnState));
};

// Restore column state
useEffect(() => {
	const savedState = localStorage.getItem("customerTableColumns");
	if (savedState && gridApi) {
		gridApi.columnApi.applyColumnState({
			state: JSON.parse(savedState),
		});
	}
}, [gridApi]);
```
