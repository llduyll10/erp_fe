import { useCallback } from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { AutocompleteFieldConfig } from "@/components/molecules/autocomplete-search";

// Generic interface for API requests with search
export interface SearchableApiRequest {
	q?: string;
	page?: number;
	limit?: number;
}

// Generic interface for API responses
export interface ApiResponse<T> {
	data: T[];
	total?: number;
	page?: number;
	limit?: number;
}

// Type for query function
export type QueryFunction<T, P extends SearchableApiRequest> = (
	params?: P
) => UseQueryResult<ApiResponse<T>, any>;

// Hook to create a query function for AutocompleteSearch
export function useAutocompleteSearch<
	T,
	P extends SearchableApiRequest = SearchableApiRequest,
>(
	queryFn: QueryFunction<T, P>,
	fieldConfig: AutocompleteFieldConfig<T>,
	additionalParams?: Omit<P, "q" | "page" | "limit">
) {
	const createQueryFunction = useCallback(
		(searchQuery: string) => {
			const params = {
				...additionalParams,
				q: searchQuery || undefined,
				page: 1,
				limit: 50,
			} as P;

			return queryFn(params);
		},
		[queryFn, additionalParams]
	);

	return {
		useQuery: createQueryFunction,
		fieldConfig,
	};
}

// Specific implementations for common entities

// Category autocomplete hook
export function useCategoryAutocomplete() {
	return {
		fieldConfig: {
			value: "id" as const,
			label: "name" as const,
			description: "description" as const,
			extra: "code" as const,
		},
	};
}

// User autocomplete hook (if you have user API)
export function useUserAutocomplete() {
	return {
		fieldConfig: {
			value: "id" as const,
			label: "name" as const,
			subtitle: "email" as const,
			description: "role" as const,
		},
	};
}

// Product autocomplete hook (if you have product API)
export function useProductAutocomplete() {
	return {
		fieldConfig: {
			value: "id" as const,
			label: "name" as const,
			description: "description" as const,
			subtitle: "item_type" as const,
		},
	};
}

// Company autocomplete hook (if you have company API)
export function useCompanyAutocomplete() {
	return {
		fieldConfig: {
			value: "id" as const,
			label: "name" as const,
			description: "description" as const,
			subtitle: "address" as const,
		},
	};
}
