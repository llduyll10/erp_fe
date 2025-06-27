import React from "react";
import { useImageUrl } from "@/services/file";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import { ImageIcon } from "lucide-react";

interface OptimizedImageProps
	extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
	fileKey: string | null | undefined;
	fallbackSrc?: string;
	showLoading?: boolean;
	fallbackComponent?: React.ReactNode;
}

/**
 * Optimized Image component that uses React Query for caching
 * Prevents multiple API calls for the same image
 */
export function OptimizedImage({
	fileKey,
	fallbackSrc,
	showLoading = true,
	fallbackComponent,
	className,
	alt = "",
	...props
}: OptimizedImageProps) {
	const { data: imageData, isLoading, error } = useImageUrl(fileKey);

	// Show loading skeleton
	if (isLoading && showLoading) {
		return <Skeleton className={cn("w-full h-auto", className)} />;
	}

	// Show error state or fallback
	if (error || (!imageData && !fallbackSrc)) {
		if (fallbackComponent) {
			return <>{fallbackComponent}</>;
		}

		return (
			<div
				className={cn(
					"flex items-center justify-center bg-gray-100 rounded-md",
					className
				)}>
				<ImageIcon className="w-6 h-6 text-gray-400" />
			</div>
		);
	}

	// Show image
	const imageUrl = imageData?.url || fallbackSrc;
	if (imageUrl) {
		return (
			<img
				src={imageUrl}
				alt={alt}
				className={cn("w-full h-auto", className)}
				loading="lazy" // Native lazy loading
				{...props}
			/>
		);
	}

	return null;
}
