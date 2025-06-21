import React from "react";
import { Button } from "./button";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	pageSize: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (pageSize: number) => void;
	pageSizeOptions?: number[];
	showPageSizeSelector?: boolean;
	className?: string;
}

export function Pagination({
	currentPage,
	totalPages,
	totalItems,
	pageSize,
	onPageChange,
	onPageSizeChange,
	pageSizeOptions = [10, 20, 50, 100],
	showPageSizeSelector = true,
	className,
}: PaginationProps) {
	const startItem = (currentPage - 1) * pageSize + 1;
	const endItem = Math.min(currentPage * pageSize, totalItems);

	const canGoPrevious = currentPage > 1;
	const canGoNext = currentPage < totalPages;

	// Generate page numbers to display
	const getPageNumbers = () => {
		const delta = 2;
		const range = [];
		const rangeWithDots = [];

		for (
			let i = Math.max(2, currentPage - delta);
			i <= Math.min(totalPages - 1, currentPage + delta);
			i++
		) {
			range.push(i);
		}

		if (currentPage - delta > 2) {
			rangeWithDots.push(1, "...");
		} else {
			rangeWithDots.push(1);
		}

		rangeWithDots.push(...range);

		if (currentPage + delta < totalPages - 1) {
			rangeWithDots.push("...", totalPages);
		} else if (totalPages > 1) {
			rangeWithDots.push(totalPages);
		}

		return rangeWithDots.filter(
			(item, index, array) => array.indexOf(item) === index
		);
	};

	const pageNumbers = getPageNumbers();

	return (
		<div
			className={cn("flex items-center justify-between space-x-2", className)}>
			{/* Page size selector */}
			{showPageSizeSelector && (
				<div className="flex items-center space-x-2">
					<span className="text-sm text-muted-foreground">Show</span>
					<select
						value={pageSize}
						onChange={(e) => onPageSizeChange(Number(e.target.value))}
						className="border rounded px-2 py-1 text-sm bg-background">
						{pageSizeOptions.map((size) => (
							<option key={size} value={size}>
								{size}
							</option>
						))}
					</select>
					<span className="text-sm text-muted-foreground">entries</span>
				</div>
			)}
			{/* Pagination controls */}
			<div className="flex items-center space-x-1">
				{/* First page */}
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(1)}
					disabled={!canGoPrevious}
					className="h-8 w-8 p-0">
					<ChevronsLeft className="h-4 w-4" />
				</Button>

				{/* Previous page */}
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={!canGoPrevious}
					className="h-8 w-8 p-0">
					<ChevronLeft className="h-4 w-4" />
				</Button>

				{/* Page numbers */}
				{pageNumbers.map((pageNumber, index) => (
					<React.Fragment key={index}>
						{pageNumber === "..." ?
							<span className="px-2 text-muted-foreground">...</span>
						:	<Button
								variant={pageNumber === currentPage ? "default" : "outline"}
								size="sm"
								onClick={() => onPageChange(pageNumber as number)}
								className="h-8 w-8 p-0">
								{pageNumber}
							</Button>
						}
					</React.Fragment>
				))}

				{/* Next page */}
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={!canGoNext}
					className="h-8 w-8 p-0">
					<ChevronRight className="h-4 w-4" />
				</Button>

				{/* Last page */}
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(totalPages)}
					disabled={!canGoNext}
					className="h-8 w-8 p-0">
					<ChevronsRight className="h-4 w-4" />
				</Button>
			</div>

			{/* Page info */}
			<div className="text-sm text-muted-foreground">
				Showing {totalItems > 0 ? startItem : 0} to {endItem} of {totalItems}{" "}
				entries
			</div>
		</div>
	);
}
