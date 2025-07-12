import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
	Check,
	ChevronsUpDown,
	Plus,
	Phone,
	Mail,
	MapPin,
	User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Customer } from "@/models/customer.model";
import { useGetCustomerList } from "@/services/customer";
import { useTranslation } from "react-i18next";
import { useDebounced } from "@/hooks/common/useDebounced";
import { useQuery } from "@tanstack/react-query";
import { getCustomerList } from "@/services/customer/request";
import { QUERY_KEYS } from "@/constants/query.constant";

interface CustomerSearchComboboxProps {
	value?: string;
	onValueChange?: (customerId: string, customer: Customer) => void;
	onCreateNew?: (phoneNumber: string) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
}

export function CustomerSearchCombobox({
	value,
	onValueChange,
	onCreateNew,
	placeholder = "Search customer by name or phone...",
	className,
	disabled = false,
}: CustomerSearchComboboxProps) {
	const { t } = useTranslation("order");
	const [open, setOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	// Debounce search query to avoid too many API calls
	const debouncedSearchQuery = useDebounced(searchQuery, 300);

	// Custom query for customer search without cache
	// Load default 20 customers when no search query, or search when user types
	const { data: customerListResponse, isLoading } = useQuery({
		queryKey: [
			QUERY_KEYS.CUSTOMER.SEARCH,
			debouncedSearchQuery.trim().toLowerCase() || "default",
		],
		queryFn: () =>
			getCustomerList({
				q: debouncedSearchQuery.trim().toLowerCase() || undefined,
				limit: debouncedSearchQuery.length > 0 ? 10 : 20,
				page: 1,
			}),
		staleTime: 0, // Always fresh data
		gcTime: 0, // No cache
		refetchOnMount: "always",
		refetchOnWindowFocus: false,
	});

	const customers = customerListResponse?.data || [];
	const selectedCustomer = customers.find((customer) => customer.id === value);

	// Handle customer selection
	const handleCustomerSelect = (customer: Customer) => {
		onValueChange?.(customer.id!, customer);
		setOpen(false);
		setSearchQuery("");
	};

	// Handle create new customer
	const handleCreateNew = () => {
		onCreateNew?.(searchQuery);
		setOpen(false);
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
					{selectedCustomer ?
						<div className="flex items-center gap-2 text-left">
							<User className="h-4 w-4 text-muted-foreground" />
							<div className="flex flex-col">
								<span className="font-medium">{selectedCustomer.name}</span>
								<span className="text-xs text-muted-foreground">
									{selectedCustomer.phone_number}
								</span>
							</div>
						</div>
					:	<span className="text-muted-foreground">{placeholder}</span>}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[400px] p-0">
				<Command shouldFilter={false}>
					<CommandInput
						placeholder={t("customerPlaceholder")}
						value={searchQuery}
						onValueChange={setSearchQuery}
					/>
					<CommandList>
						{isLoading && (
							<div className="p-2 text-sm text-muted-foreground">
								{searchQuery.length > 0 ?
									"Searching..."
								:	"Loading customers..."}
							</div>
						)}

						{!isLoading && searchQuery.length > 0 && customers.length === 0 && (
							<CommandEmpty>
								<div className="flex flex-col items-center gap-2 p-4">
									<div className="text-sm text-muted-foreground">
										{t("customerNotFound")}
									</div>
									{onCreateNew && (
										<Button
											onClick={handleCreateNew}
											size="sm"
											variant="outline"
											className="gap-2">
											<Plus className="h-4 w-4" />
											{t("createNewCustomer")}
										</Button>
									)}
								</div>
							</CommandEmpty>
						)}

						{customers.length > 0 && (
							<CommandGroup>
								{customers.map((customer) => (
									<CommandItem
										key={customer.id}
										value={customer.id!}
										onSelect={() => handleCustomerSelect(customer)}
										className="flex items-center gap-3 p-3">
										<Check
											className={cn(
												"h-4 w-4",
												value === customer.id ? "opacity-100" : "opacity-0"
											)}
										/>
										<div className="flex flex-col gap-1 flex-1">
											<div className="flex items-center gap-2">
												<span className="font-medium">{customer.name}</span>
												{customer.customer_code && (
													<span className="text-xs text-muted-foreground bg-muted px-1 rounded">
														{customer.customer_code}
													</span>
												)}
											</div>
											<div className="flex items-center gap-4 text-xs text-muted-foreground">
												{customer.phone_number && (
													<div className="flex items-center gap-1">
														<Phone className="h-3 w-3" />
														{customer.phone_number}
													</div>
												)}
												{customer.email && (
													<div className="flex items-center gap-1">
														<Mail className="h-3 w-3" />
														{customer.email}
													</div>
												)}
											</div>
											{customer.street_address && (
												<div className="flex items-center gap-1 text-xs text-muted-foreground">
													<MapPin className="h-3 w-3" />
													<span className="truncate">
														{[
															customer.street_address,
															customer.ward,
															customer.district,
															customer.state_province,
														]
															.filter(Boolean)
															.join(", ")}
													</span>
												</div>
											)}
										</div>
									</CommandItem>
								))}
							</CommandGroup>
						)}

						{searchQuery.length === 0 &&
							customers.length === 0 &&
							!isLoading && (
								<div className="p-2 text-sm text-muted-foreground">
									No customers available
								</div>
							)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
