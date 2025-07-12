import { useState } from "react";
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
import { Check, ChevronsUpDown, Package, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderVariant } from "@/models/order-variant.model";
import { useTranslation } from "react-i18next";
import { useDebounced } from "@/hooks/common/useDebounced";
import { useQuery } from "@tanstack/react-query";
import { getAllVariants } from "@/services/product/request";
import { QUERY_KEYS } from "@/constants/query.constant";
import { OptimizedImage } from "@/components/molecules/optimized-image";

interface ProductSearchComboboxProps {
	value?: string;
	onValueChange?: (variantId: string, variant: OrderVariant) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
	excludedVariantIds?: string[];
}

export function ProductSearchCombobox({
	value,
	onValueChange,
	placeholder = "Search product variants...",
	className,
	disabled = false,
	excludedVariantIds = [],
}: ProductSearchComboboxProps) {
	const { t } = useTranslation("order");
	const [open, setOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	// Debounce search query to avoid too many API calls
	const debouncedSearchQuery = useDebounced(searchQuery, 300);

	// Fetch variants using new API
	const { data: variantResponse, isLoading } = useQuery({
		queryKey: [
			QUERY_KEYS.VARIANT.ALL,
			debouncedSearchQuery.trim().toLowerCase() || "default",
		],
		queryFn: () =>
			getAllVariants({
				q: debouncedSearchQuery.trim().toLowerCase() || undefined,
				limit: debouncedSearchQuery.length > 0 ? 10 : 20,
				page: 1,
			}),
		staleTime: 0,
		gcTime: 0,
		refetchOnMount: "always",
		refetchOnWindowFocus: false,
	});

	const variants = (variantResponse?.data || []).filter(
		(variant) => !excludedVariantIds.includes(variant.id)
	);

	// Find selected variant
	const selectedVariant = variants.find((variant) => variant.id === value);

	// Handle selection
	const handleSelect = (variant: OrderVariant) => {
		onValueChange?.(variant.id, variant);
		setOpen(false);
		setSearchQuery("");
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn("w-full justify-between", className)}
					disabled={disabled}>
					{selectedVariant ?
						<div className="flex items-center gap-3 text-left">
							<OptimizedImage
								fileKey={selectedVariant.file_key}
								alt={selectedVariant.display_name}
								className="w-10 h-10 rounded-md object-cover"
								showLoading={false}
								fallbackComponent={
									<div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
										<ImageIcon className="w-6 h-6 text-gray-400" />
									</div>
								}
							/>
							<div className="flex flex-col min-w-0 flex-1">
								<span className="font-medium truncate">
									{selectedVariant.display_name}
								</span>
								<span className="text-xs text-muted-foreground">
									{selectedVariant.sku} • ${selectedVariant.price.toFixed(2)}
								</span>
							</div>
						</div>
					:	<span className="text-muted-foreground">{placeholder}</span>}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[500px] p-0">
				<Command shouldFilter={false}>
					<CommandInput
						placeholder={t("productPlaceholder")}
						value={searchQuery}
						onValueChange={setSearchQuery}
					/>
					<CommandList>
						{isLoading && (
							<div className="p-2 text-sm text-muted-foreground">
								{searchQuery.length > 0 ?
									"Searching..."
								:	"Loading variants..."}
							</div>
						)}

						{!isLoading && searchQuery.length > 0 && variants.length === 0 && (
							<CommandEmpty>
								<div className="p-4 text-center text-sm text-muted-foreground">
									No product variants found
								</div>
							</CommandEmpty>
						)}

						{variants.length > 0 && (
							<CommandGroup heading="Product Variants">
								{variants.map((variant) => (
									<CommandItem
										key={variant.id}
										value={variant.id}
										onSelect={() => handleSelect(variant)}
										className="flex items-center gap-3 p-3">
										<Check
											className={cn(
												"h-4 w-4 shrink-0",
												value === variant.id ? "opacity-100" : "opacity-0"
											)}
										/>
										<OptimizedImage
											fileKey={variant.file_key}
											alt={variant.display_name}
											className="w-12 h-12 rounded-md object-cover shrink-0"
											showLoading={false}
											fallbackComponent={
												<div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
													<ImageIcon className="w-6 h-6 text-gray-400" />
												</div>
											}
										/>
										<div className="flex flex-col gap-1 flex-1 min-w-0">
											<div className="flex items-center justify-between">
												<span className="font-medium truncate">
													{variant.display_name}
												</span>
												<div className="flex items-center gap-2 shrink-0">
													<span className="text-sm font-medium text-green-600">
														${variant.price.toFixed(2)}
													</span>
													{!variant.is_in_stock && (
														<span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
															Out of Stock
														</span>
													)}
												</div>
											</div>
											<div className="flex items-center gap-2 text-xs text-muted-foreground">
												<span>SKU: {variant.sku}</span>
												<span>•</span>
												<span>{variant.size}</span>
												<span>•</span>
												<span>{variant.color}</span>
												<span>•</span>
												<span>{variant.gender}</span>
												{variant.category_name && (
													<>
														<span>•</span>
														<span>{variant.category_name}</span>
													</>
												)}
											</div>
											<div className="text-xs text-muted-foreground truncate">
												Product: {variant.product_name}
											</div>
										</div>
									</CommandItem>
								))}
							</CommandGroup>
						)}

						{searchQuery.length === 0 &&
							variants.length === 0 &&
							!isLoading && (
								<div className="p-2 text-sm text-muted-foreground">
									No variants available
								</div>
							)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
