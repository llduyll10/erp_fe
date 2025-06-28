# Service Workflow Documentation

## 📋 Tổng quan

Dự án sử dụng **TanStack Query v5** để quản lý server state với caching, background updates, và optimistic updates. Tất cả service đều follow pattern tương tự để đảm bảo consistency và type safety.

## 🏗️ Cấu trúc Service

### 1. API Request Functions

```typescript
// src/services/customer/request.ts
import { apiRequest } from "@/utils/request.util";
import {
	CreateCustomerRequest,
	UpdateCustomerRequest,
	GetCustomerListRequest,
} from "@/interfaces/customer.interface";

const API_ENDPOINTS = {
	CUSTOMERS: "/customers",
	CUSTOMER_DETAIL: (id: string) => `/customers/${id}`,
};

export const createCustomer = async (data: CreateCustomerRequest) => {
	return apiRequest<Customer>({
		method: "POST",
		url: API_ENDPOINTS.CUSTOMERS,
		data,
	});
};

export const getCustomerList = async (params?: GetCustomerListRequest) => {
	return apiRequest<ApiListResponse<Customer>>({
		method: "GET",
		url: API_ENDPOINTS.CUSTOMERS,
		params,
	});
};

export const getCustomerDetail = async (id: string) => {
	return apiRequest<Customer>({
		method: "GET",
		url: API_ENDPOINTS.CUSTOMER_DETAIL(id),
	});
};

export const updateCustomer = async (
	id: string,
	data: UpdateCustomerRequest
) => {
	return apiRequest<Customer>({
		method: "PUT",
		url: API_ENDPOINTS.CUSTOMER_DETAIL(id),
		data,
	});
};

export const deleteCustomer = async (id: string) => {
	return apiRequest<void>({
		method: "DELETE",
		url: API_ENDPOINTS.CUSTOMER_DETAIL(id),
	});
};
```

### 2. TanStack Query Hooks

```typescript
// src/services/customer/index.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query.constant";
import { toast } from "sonner";

// Create Customer Mutation
export const useCreateCustomer = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateCustomerRequest) => {
			const response = await createCustomer(data);
			return response;
		},
		onSuccess: (newCustomer) => {
			// Invalidate and refetch customer list
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.CUSTOMER.LIST],
			});

			// Add to cache if needed
			queryClient.setQueryData(
				[QUERY_KEYS.CUSTOMER.DETAIL, newCustomer.id],
				newCustomer
			);

			toast.success("Customer created successfully");
		},
		onError: (error: any) => {
			toast.error(error.message || "Failed to create customer");
		},
	});
};

// Get Customer List Query
export const useGetCustomerList = (
	params?: GetCustomerListRequest,
	enabled = true
) => {
	return useQuery({
		queryKey: [QUERY_KEYS.CUSTOMER.LIST, params],
		queryFn: () => getCustomerList(params),
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in v4)
		retry: (failureCount, error) => {
			// Don't retry on 4xx errors
			if (error?.response?.status >= 400 && error?.response?.status < 500) {
				return false;
			}
			return failureCount < 3;
		},
	});
};

// Get Customer Detail Query
export const useGetCustomerDetail = (id: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.CUSTOMER.DETAIL, id],
		queryFn: () => getCustomerDetail(id),
		enabled: !!id,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
};

// Update Customer Mutation
export const useUpdateCustomer = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateCustomerRequest;
		}) => {
			const response = await updateCustomer(id, data);
			return response;
		},
		onMutate: async ({ id, data }) => {
			// Optimistic update
			await queryClient.cancelQueries({
				queryKey: [QUERY_KEYS.CUSTOMER.DETAIL, id],
			});

			const previousCustomer = queryClient.getQueryData([
				QUERY_KEYS.CUSTOMER.DETAIL,
				id,
			]);

			queryClient.setQueryData([QUERY_KEYS.CUSTOMER.DETAIL, id], {
				...previousCustomer,
				...data,
			});

			return { previousCustomer };
		},
		onError: (error: any, variables, context) => {
			// Rollback on error
			if (context?.previousCustomer) {
				queryClient.setQueryData(
					[QUERY_KEYS.CUSTOMER.DETAIL, variables.id],
					context.previousCustomer
				);
			}
			toast.error(error.message || "Failed to update customer");
		},
		onSuccess: (updatedCustomer, { id }) => {
			// Update cache with fresh data
			queryClient.setQueryData(
				[QUERY_KEYS.CUSTOMER.DETAIL, id],
				updatedCustomer
			);

			// Invalidate list to refresh
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.CUSTOMER.LIST],
			});

			toast.success("Customer updated successfully");
		},
	});
};

// Delete Customer Mutation
export const useDeleteCustomer = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			await deleteCustomer(id);
			return id;
		},
		onSuccess: (deletedId) => {
			// Remove from cache
			queryClient.removeQueries({
				queryKey: [QUERY_KEYS.CUSTOMER.DETAIL, deletedId],
			});

			// Update list cache by removing the deleted item
			queryClient.setQueriesData(
				{ queryKey: [QUERY_KEYS.CUSTOMER.LIST] },
				(oldData: any) => {
					if (!oldData) return oldData;

					return {
						...oldData,
						data: oldData.data.filter(
							(customer: Customer) => customer.id !== deletedId
						),
						pagination: {
							...oldData.pagination,
							total_records: oldData.pagination.total_records - 1,
						},
					};
				}
			);

			toast.success("Customer deleted successfully");
		},
		onError: (error: any) => {
			toast.error(error.message || "Failed to delete customer");
		},
	});
};
```

### 3. Query Keys Constants

```typescript
// src/constants/query.constant.ts
export const QUERY_KEYS = {
	CUSTOMER: {
		ALL: ["customers"] as const,
		LIST: ["customers", "list"] as const,
		DETAIL: ["customers", "detail"] as const,
		INFINITE: ["customers", "infinite"] as const,
	},
	PRODUCT: {
		ALL: ["products"] as const,
		LIST: ["products", "list"] as const,
		DETAIL: ["products", "detail"] as const,
		VARIANTS: ["products", "variants"] as const,
	},
	USER: {
		ALL: ["users"] as const,
		LIST: ["users", "list"] as const,
		DETAIL: ["users", "detail"] as const,
		PROFILE: ["users", "profile"] as const,
	},
} as const;
```

### 4. Request Utility

```typescript
// src/utils/request.util.ts
import axios, { AxiosRequestConfig } from "axios";
import { getAccessToken, removeAccessToken } from "./auth.util";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance
const apiClient = axios.create({
	baseURL: API_BASE_URL,
	timeout: 30000,
});

// Request interceptor để add auth token
apiClient.interceptors.request.use(
	(config) => {
		const token = getAccessToken();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor để handle errors
apiClient.interceptors.response.use(
	(response) => {
		return response.data; // Return only data, not the full axios response
	},
	(error) => {
		if (error.response?.status === 401) {
			// Unauthorized - clear token and redirect to login
			removeAccessToken();
			window.location.href = "/login";
		}

		// Transform error to consistent format
		const errorMessage =
			error.response?.data?.message ||
			error.message ||
			"An unexpected error occurred";

		return Promise.reject(new Error(errorMessage));
	}
);

// Generic API request function
export const apiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
	try {
		const response = await apiClient(config);
		return response;
	} catch (error) {
		throw error;
	}
};
```

## 🎯 Advanced Patterns

### 1. Infinite Queries cho Pagination

```typescript
export const useGetCustomerListInfinite = (
	params?: Omit<GetCustomerListRequest, "page">
) => {
	return useInfiniteQuery({
		queryKey: [QUERY_KEYS.CUSTOMER.INFINITE, params],
		queryFn: ({ pageParam = 1 }) =>
			getCustomerList({ ...params, page: pageParam }),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const { current_page, total_pages } = lastPage.pagination;
			return current_page < total_pages ? current_page + 1 : undefined;
		},
		getPreviousPageParam: (firstPage) => {
			const { current_page } = firstPage.pagination;
			return current_page > 1 ? current_page - 1 : undefined;
		},
	});
};

// Usage trong component
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
	useGetCustomerListInfinite({ q: searchTerm });

const allCustomers = data?.pages.flatMap((page) => page.data) ?? [];
```

### 2. Background Sync với Polling

```typescript
export const useGetCustomerListWithPolling = (
	params?: GetCustomerListRequest
) => {
	return useQuery({
		queryKey: [QUERY_KEYS.CUSTOMER.LIST, params],
		queryFn: () => getCustomerList(params),
		refetchInterval: 30000, // Poll every 30 seconds
		refetchIntervalInBackground: false, // Only when tab is active
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
	});
};
```

### 3. Dependent Queries

```typescript
export const useCustomerWithDetails = (customerId: string) => {
	// First query: Get customer basic info
	const { data: customer, isLoading: isCustomerLoading } =
		useGetCustomerDetail(customerId);

	// Second query: Get customer orders (depends on customer data)
	const { data: orders, isLoading: isOrdersLoading } = useQuery({
		queryKey: ["orders", "customer", customerId],
		queryFn: () => getCustomerOrders(customerId),
		enabled: !!customer?.id, // Only run if customer exists
	});

	return {
		customer,
		orders,
		isLoading: isCustomerLoading || isOrdersLoading,
	};
};
```

### 4. Bulk Operations

```typescript
export const useBulkUpdateCustomers = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (
			updates: Array<{ id: string; data: Partial<Customer> }>
		) => {
			// Execute all updates in parallel
			const promises = updates.map(({ id, data }) => updateCustomer(id, data));
			return Promise.all(promises);
		},
		onSuccess: () => {
			// Invalidate all customer queries
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.CUSTOMER.ALL],
			});
			toast.success("Customers updated successfully");
		},
		onError: (error: any) => {
			toast.error("Failed to update some customers");
		},
	});
};
```

## 🔧 Best Practices

### 1. Error Handling

```typescript
// ✅ Consistent error handling
const { data, error, isError } = useGetCustomerList();

if (isError) {
	return <ErrorBoundary error={error} />;
}

// ✅ Granular error handling trong mutations
const createMutation = useCreateCustomer();

const handleSubmit = async (data: CustomerFormData) => {
	try {
		await createMutation.mutateAsync(data);
		navigate("/customers");
	} catch (error) {
		// Error đã được handle trong mutation onError
		// UI sẽ show toast message tự động
	}
};
```

### 2. Loading States

```typescript
// ✅ Multiple loading states
const {
	data,
	isLoading,     // Initial loading
	isFetching,    // Any fetch including background
	isRefetching,  // Manual refetch
} = useGetCustomerList();

// ✅ Loading state cho mutations
const createMutation = useCreateCustomer();

<Button
	disabled={createMutation.isPending}
	onClick={() => createMutation.mutate(data)}
>
	{createMutation.isPending && <Spinner />}
	Create Customer
</Button>
```

### 3. Cache Management

```typescript
// ✅ Smart invalidation
const updateMutation = useUpdateCustomer();

updateMutation.mutate(
	{ id, data },
	{
		onSuccess: () => {
			// Invalidate specific queries
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.CUSTOMER.LIST],
			});

			// Keep detail cache fresh
			queryClient.setQueryData([QUERY_KEYS.CUSTOMER.DETAIL, id], updatedData);
		},
	}
);

// ✅ Prefetch related data
const prefetchCustomerDetail = (id: string) => {
	queryClient.prefetchQuery({
		queryKey: [QUERY_KEYS.CUSTOMER.DETAIL, id],
		queryFn: () => getCustomerDetail(id),
		staleTime: 5 * 60 * 1000,
	});
};
```

### 4. Type Safety

```typescript
// ✅ Proper typing cho responses
interface ApiResponse<T> {
	data: T;
	message?: string;
	success: boolean;
}

interface ApiListResponse<T> extends ApiResponse<T[]> {
	pagination: {
		current_page: number;
		total_pages: number;
		total_records: number;
		records_per_page: number;
	};
}

// ✅ Generic service functions
const createApiService = <T, CreateRequest, UpdateRequest>(endpoints: {
	list: string;
	detail: (id: string) => string;
}) => {
	return {
		useList: (params?: any) =>
			useQuery({
				queryKey: [endpoints.list, params],
				queryFn: () =>
					apiRequest<ApiListResponse<T>>({
						method: "GET",
						url: endpoints.list,
						params,
					}),
			}),

		useCreate: () =>
			useMutation({
				mutationFn: (data: CreateRequest) =>
					apiRequest<T>({
						method: "POST",
						url: endpoints.list,
						data,
					}),
			}),

		// ... other methods
	};
};
```

### 5. Background Updates

```typescript
// ✅ Stale-while-revalidate pattern
export const useGetCustomerList = (params?: GetCustomerListRequest) => {
	return useQuery({
		queryKey: [QUERY_KEYS.CUSTOMER.LIST, params],
		queryFn: () => getCustomerList(params),
		staleTime: 2 * 60 * 1000, // 2 minutes fresh
		gcTime: 5 * 60 * 1000, // 5 minutes in cache
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
	});
};
```

## 🧪 Testing

### 1. Mock Service Functions

```typescript
// __mocks__/services/customer.ts
export const mockCustomerService = {
	useCreateCustomer: () => ({
		mutate: jest.fn(),
		isPending: false,
	}),

	useGetCustomerList: () => ({
		data: {
			data: [{ id: "1", name: "John Doe", email: "john@example.com" }],
			pagination: { current_page: 1, total_pages: 1, total_records: 1 },
		},
		isLoading: false,
		error: null,
	}),
};
```

### 2. Integration Testing

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

describe('useGetCustomerList', () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
				mutations: { retry: false },
			},
		});
	});

	it('should fetch customer list successfully', async () => {
		const wrapper = ({ children }: any) => (
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		);

		const { result } = renderHook(() => useGetCustomerList(), { wrapper });

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(result.current.data).toBeDefined();
		expect(Array.isArray(result.current.data?.data)).toBe(true);
	});
});
```

## 🚀 Migration Guide

Khi thêm service mới:

1. **Tạo request functions** trong `services/[module]/request.ts`
2. **Define interfaces** cho requests/responses trong `interfaces/`
3. **Tạo TanStack Query hooks** trong `services/[module]/index.ts`
4. **Add query keys** vào `constants/query.constant.ts`
5. **Implement error handling** và loading states
6. **Add optimistic updates** cho mutations quan trọng
7. **Setup proper cache invalidation**
8. **Write tests** cho service functions

## 🔍 Debugging

### 1. React Query DevTools

```typescript
// src/main.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			{/* Your app */}
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
```

### 2. Query Client Configuration

```typescript
// src/lib/query-client.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000,
			gcTime: 10 * 60 * 1000,
			retry: (failureCount, error) => {
				if (error?.response?.status >= 400 && error?.response?.status < 500) {
					return false;
				}
				return failureCount < 3;
			},
		},
		mutations: {
			retry: false,
		},
	},
});
```

### 3. Logging và Monitoring

```typescript
// Add logging to mutations
export const useCreateCustomer = () => {
	return useMutation({
		mutationFn: createCustomer,
		onMutate: (variables) => {
			console.log("Creating customer:", variables);
		},
		onError: (error, variables) => {
			console.error("Failed to create customer:", error, variables);
			// Send to monitoring service
			// analytics.track('customer_creation_failed', { error: error.message });
		},
		onSuccess: (data) => {
			console.log("Customer created successfully:", data);
			// analytics.track('customer_created', { customerId: data.id });
		},
	});
};
```
