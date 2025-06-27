"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { UseQueryResult } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

// Generic types for the autocomplete search
export interface AutocompleteOption {
	value: string;
	label: string;
	description?: string;
	subtitle?: string;
	extra?: string;
}

export interface AutocompleteFieldConfig<T = any> {
	value: keyof T;
	label: keyof T;
	description?: keyof T;
	subtitle?: keyof T;
	extra?: keyof T;
}

export interface AutocompleteSearchProps<T = any> {
	// Data and query
	useQuery: (searchQuery: string) => UseQueryResult<{ data: T[] } | T[], any>;
	fieldConfig: AutocompleteFieldConfig<T>;

	// Component props
	value?: string;
	onValueChange?: (value: string) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyMessage?: string;
	loadingMessage?: string;
	clearLabel?: string;
	className?: string;
	disabled?: boolean;

	// Options
	enableClear?: boolean;
	debounceMs?: number;
	pageSize?: number;

	// Custom render functions (optional)
	renderOption?: (item: T, isSelected: boolean) => React.ReactNode;
	renderTrigger?: (
		selectedItem: T | null,
		placeholder: string
	) => React.ReactNode;
}

// Custom hook for debounced search
function useDebounced<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

	React.useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

export function AutocompleteSearch<T = any>({
	useQuery,
	fieldConfig,
	value,
	onValueChange,
	placeholder = "Select option...",
	searchPlaceholder = "Search...",
	emptyMessage = "No options found.",
	loadingMessage = "Loading...",
	clearLabel = "Clear selection",
	className,
	disabled = false,
	enableClear = true,
	debounceMs = 300,
	pageSize = 50,
	renderOption,
	renderTrigger,
}: AutocompleteSearchProps<T>) {
	const [open, setOpen] = React.useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");

	// Debounce search query to avoid too many API calls
	const debouncedSearchQuery = useDebounced(searchQuery, debounceMs);

	// Fetch data with debounced search query
	const { data: response, isLoading, error } = useQuery(debouncedSearchQuery);

	const items = React.useMemo(() => {
		if (!response) return [];
		// Handle both { data: T[] } and T[] response formats
		return Array.isArray(response) ? response : (response as any).data || [];
	}, [response]);

	// Find selected item
	const [selectedItem, setSelectedItem] = React.useState<T | null>(null);

	React.useEffect(() => {
		if (value && items.length > 0) {
			const found = items.find(
				(item: T) => String((item as any)[fieldConfig.value]) === value
			);
			if (found) {
				setSelectedItem(found);
			}
		} else if (!value) {
			setSelectedItem(null);
		}
	}, [value, items, fieldConfig.value]);

	// Convert item to AutocompleteOption format
	const convertToOption = React.useCallback(
		(item: T): AutocompleteOption => ({
			value: String((item as any)[fieldConfig.value]),
			label: String((item as any)[fieldConfig.label]),
			description:
				fieldConfig.description ?
					String((item as any)[fieldConfig.description] || "")
				:	undefined,
			subtitle:
				fieldConfig.subtitle ?
					String((item as any)[fieldConfig.subtitle] || "")
				:	undefined,
			extra:
				fieldConfig.extra ?
					String((item as any)[fieldConfig.extra] || "")
				:	undefined,
		}),
		[fieldConfig]
	);

	const options = React.useMemo(
		() => items.map(convertToOption),
		[items, convertToOption]
	);

	// Default option renderer
	const defaultRenderOption = React.useCallback(
		(item: T, isSelected: boolean) => {
			const option = convertToOption(item);
			return (
				<div className="flex flex-col flex-1">
					<span className="font-medium">{option.label}</span>
					{option.description && (
						<span className="text-xs text-muted-foreground truncate">
							{option.description}
						</span>
					)}
					{option.subtitle && (
						<span className="text-xs text-muted-foreground">
							{option.subtitle}
						</span>
					)}
					{option.extra && (
						<span className="text-xs text-muted-foreground">
							{option.extra}
						</span>
					)}
				</div>
			);
		},
		[convertToOption]
	);

	// Default trigger renderer
	const defaultRenderTrigger = React.useCallback(
		(selectedItem: T | null, placeholder: string) => {
			if (!selectedItem) return placeholder;
			const option = convertToOption(selectedItem);
			return option.label;
		},
		[convertToOption]
	);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn("w-full justify-between", className)}
					disabled={disabled}>
					{renderTrigger ?
						renderTrigger(selectedItem, placeholder)
					:	defaultRenderTrigger(selectedItem, placeholder)}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-[var(--radix-popover-trigger-width)] p-0"
				align="start">
				<Command shouldFilter={false}>
					<CommandInput
						placeholder={searchPlaceholder}
						value={searchQuery}
						onValueChange={setSearchQuery}
						className="h-9"
					/>
					<CommandList>
						{isLoading ?
							<div className="p-4 text-sm text-muted-foreground flex items-center justify-center">
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
								<span className="ml-2">{loadingMessage}</span>
							</div>
						: error ?
							<div className="p-4 text-sm text-destructive">
								Error loading data
							</div>
						:	<>
								<CommandEmpty>{emptyMessage}</CommandEmpty>
								{options.length > 0 && (
									<CommandGroup>
										{/* Clear selection option */}
										{enableClear && value && (
											<CommandItem
												value=""
												onSelect={() => {
													onValueChange?.("");
													setOpen(false);
												}}
												className="text-muted-foreground">
												{clearLabel}
											</CommandItem>
										)}
										{items.map((item: T) => {
											const option = convertToOption(item);
											const isSelected = value === option.value;

											return (
												<CommandItem
													key={option.value}
													value={option.value}
													onSelect={(currentValue) => {
														const newValue =
															currentValue === value ? "" : currentValue;
														onValueChange?.(newValue);
														setOpen(false);
													}}>
													{renderOption ?
														renderOption(item, isSelected)
													:	defaultRenderOption(item, isSelected)}
													<Check
														className={cn(
															"ml-auto h-4 w-4",
															isSelected ? "opacity-100" : "opacity-0"
														)}
													/>
												</CommandItem>
											);
										})}
									</CommandGroup>
								)}
							</>
						}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
