import React, { useState, useEffect } from "react";
import { getViewUrl } from "@/services/file/request";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

interface ImageProps
	extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
	fileKey: string | null | undefined;
	fallbackSrc?: string;
	showLoading?: boolean;
}

/**
 * Image component that loads images from S3 using fileKey
 */
export function Image({
	fileKey,
	fallbackSrc,
	showLoading = true,
	className,
	alt = "",
	...props
}: ImageProps) {
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<boolean>(false);

	useEffect(() => {
		const fetchImageUrl = async () => {
			if (!fileKey) {
				setImageUrl(fallbackSrc || null);
				return;
			}

			setIsLoading(true);
			setError(false);

			try {
				const viewData = await getViewUrl(fileKey);
				setImageUrl(viewData.url);
			} catch (err) {
				console.error("Failed to get image URL:", err);
				setError(true);
				setImageUrl(fallbackSrc || null);
			} finally {
				setIsLoading(false);
			}
		};

		fetchImageUrl();
	}, [fileKey, fallbackSrc]);

	// Show loading skeleton
	if (isLoading && showLoading) {
		return <Skeleton className={cn("w-full h-auto", className)} />;
	}

	// Show error state or fallback
	if (error && !imageUrl) {
		return (
			<div
				className={cn(
					"flex items-center justify-center bg-muted text-muted-foreground p-4 rounded-md",
					className
				)}>
				<span className="text-sm">Failed to load image</span>
			</div>
		);
	}

	// Show image
	if (imageUrl) {
		return (
			<img
				src={imageUrl}
				alt={alt}
				className={cn("w-full h-auto", className)}
				{...props}
			/>
		);
	}

	return null;
}
