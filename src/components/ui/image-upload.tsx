import * as React from "react";
import { Upload, X, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
	generatePresignedUrl,
	uploadFileToS3,
	uploadFileToS3WithFetch,
	confirmUpload,
} from "@/services/file";
import type {
	FileUploadPurpose,
	UploadResult,
	GeneratePresignedUrlResponse,
} from "@/interfaces/file.interface";
import { validateFile, formatFileSize, isImageFile } from "@/utils/file.util";

interface ImageUploadProps {
	purpose: FileUploadPurpose;
	value?: string;
	onUploadComplete?: (result: UploadResult) => void;
	onUploadStart?: () => void;
	onUploadError?: (error: string) => void;
	disabled?: boolean;
	className?: string;
	acceptedFileTypes?: string[];
	maxSize?: number;
	placeholder?: string;
}

interface PendingUpload {
	file: File;
	previewUrl: string;
	presignedData: GeneratePresignedUrlResponse;
}

export function ImageUpload({
	purpose,
	value,
	onUploadComplete,
	onUploadStart,
	onUploadError,
	disabled = false,
	className,
	acceptedFileTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
	maxSize = 5 * 1024 * 1024, // 5MB default
	placeholder = "Click to upload image",
}: ImageUploadProps) {
	const [isGeneratingUrl, setIsGeneratingUrl] = React.useState(false);
	const [isUploading, setIsUploading] = React.useState(false);
	const [uploadProgress, setUploadProgress] = React.useState(0);
	// Helper function to check if value is a valid URL
	const isValidUrl = (str: string): boolean => {
		try {
			return (
				str.startsWith("http") ||
				str.startsWith("blob:") ||
				str.startsWith("data:")
			);
		} catch {
			return false;
		}
	};

	const [finalImageUrl, setFinalImageUrl] = React.useState<string | null>(
		value && isValidUrl(value) ? value : null
	);
	const [pendingUpload, setPendingUpload] =
		React.useState<PendingUpload | null>(null);
	const [dragActive, setDragActive] = React.useState(false);
	const fileInputRef = React.useRef<HTMLInputElement>(null);

	React.useEffect(() => {
		// Only update finalImageUrl if value is a valid URL
		// Don't override local preview URLs with invalid file paths
		if (value && isValidUrl(value)) {
			setFinalImageUrl(value);
		} else if (!value) {
			// Only clear if explicitly set to empty/null
			setFinalImageUrl(null);
		}
		// If value is invalid (like a fileKey), keep existing finalImageUrl
	}, [value]);

	// Step 1: Generate presigned URL when file is selected
	const handleFileSelect = async (file: File) => {
		if (disabled) return;

		try {
			setIsGeneratingUrl(true);

			// Validate file before proceeding
			const validation = validateFile(file, purpose);
			if (!validation.isValid) {
				throw new Error(validation.error);
			}

			// Additional client-side validation
			if (!isImageFile(file)) {
				throw new Error("Please select an image file");
			}

			if (file.size > maxSize) {
				throw new Error(
					`File size must be less than ${formatFileSize(maxSize)}`
				);
			}

			if (!acceptedFileTypes.includes(file.type)) {
				throw new Error(
					`File type not supported. Accepted: ${acceptedFileTypes.join(", ")}`
				);
			}

			// Generate presigned URL
			console.log("🚀 Step 1: Generating presigned URL...");
			const presignedData = await generatePresignedUrl({
				fileName: file.name,
				fileType: file.type,
				purpose,
				fileSize: file.size,
			});

			// Create preview URL for display
			const previewUrl = URL.createObjectURL(file);

			// Store pending upload data
			setPendingUpload({
				file,
				previewUrl,
				presignedData,
			});

			toast.success(
				"File ready for upload. Click 'Confirm Upload' to proceed."
			);
			console.log("✅ Step 1 completed: Presigned URL generated");
		} catch (error) {
			console.error("❌ Step 1 failed:", error);
			const errorMessage =
				error instanceof Error ?
					error.message
				:	"Failed to prepare file upload";

			onUploadError?.(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsGeneratingUrl(false);
		}
	};

	// Step 2: Upload file to S3 using presigned URL
	const handleConfirmUpload = async () => {
		if (!pendingUpload || disabled) return;

		try {
			setIsUploading(true);
			setUploadProgress(0);
			onUploadStart?.();

			const { file, presignedData } = pendingUpload;

			console.log("🚀 Step 2: Uploading to S3...");
			setUploadProgress(30);

			// Try XMLHttpRequest first, fallback to fetch if it fails
			try {
				await uploadFileToS3(presignedData.uploadUrl, file);
				console.log("✅ Step 2 completed: File uploaded to S3 with XHR");
			} catch (xhrError) {
				console.warn("⚠️ XHR upload failed, trying fetch method:", xhrError);
				setUploadProgress(35);
				await uploadFileToS3WithFetch(presignedData.uploadUrl, file);
				console.log("✅ Step 2 completed: File uploaded to S3 with fetch");
			}

			setUploadProgress(70);

			console.log("🚀 Step 3: Confirming upload...");
			// Confirm upload
			const confirmData = await confirmUpload({
				fileKey: presignedData.fileKey,
				fileName: file.name,
				fileType: file.type,
				fileSize: file.size,
			});

			setUploadProgress(100);

			// Step 3: Emit result
			const result: UploadResult = {
				id: confirmData.id,
				url: confirmData.url,
				fileKey: presignedData.fileKey,
				viewUrl: undefined, // No longer needed as per simplification
			};

			console.log(
				"✅ Step 3 completed: Upload confirmed, emitting result:",
				result
			);

			// Keep local preview for immediate display instead of cleaning up
			const localPreviewUrl = pendingUpload.previewUrl;
			console.log(
				"🖼️ [DEBUG] Keeping local preview after upload:",
				localPreviewUrl
			);

			setPendingUpload(null);

			// Set local preview for immediate display (don't cleanup)
			setFinalImageUrl(localPreviewUrl);

			console.log("📋 [DEBUG] Upload result:", result);
			onUploadComplete?.(result);

			toast.success("Image uploaded successfully!");
		} catch (error) {
			console.error("❌ Upload failed:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Upload failed";

			onUploadError?.(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsUploading(false);
			setUploadProgress(0);
		}
	};

	const handleFileInputChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (file) {
			handleFileSelect(file);
		}
		// Reset input value to allow selecting the same file again
		event.target.value = "";
	};

	const handleClick = () => {
		if (!disabled && !isGeneratingUrl && !isUploading) {
			fileInputRef.current?.click();
		}
	};

	const handleRemove = (e: React.MouseEvent) => {
		e.stopPropagation();

		// Clean up pending upload if exists
		if (pendingUpload) {
			URL.revokeObjectURL(pendingUpload.previewUrl);
			setPendingUpload(null);
		}

		// Clean up final image URL if it's a blob URL
		if (finalImageUrl && finalImageUrl.startsWith("blob:")) {
			URL.revokeObjectURL(finalImageUrl);
		}

		setFinalImageUrl(null);
		onUploadComplete?.({
			id: "",
			url: "",
			fileKey: "",
			viewUrl: "",
		});
	};

	const handleCancelPending = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (pendingUpload) {
			URL.revokeObjectURL(pendingUpload.previewUrl);
			setPendingUpload(null);
		}
	};

	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		if (disabled || isGeneratingUrl || isUploading) return;

		const files = e.dataTransfer.files;
		if (files && files[0]) {
			handleFileSelect(files[0]);
		}
	};

	// Debug logging
	console.log("🔍 [DEBUG] ImageUpload render state:", {
		value,
		isValueValidUrl: value ? isValidUrl(value) : false,
		finalImageUrl,
		hasPendingUpload: !!pendingUpload,
		isUploading,
		isGeneratingUrl,
	});

	// Show final uploaded image with smart priority logic
	const shouldShowFinalImage =
		!pendingUpload && (finalImageUrl || (value && isValidUrl(value)));

	// Priority: 1) Local preview URL, 2) Valid external URL, 3) Nothing
	const displayUrl =
		finalImageUrl || (value && isValidUrl(value) ? value : null);

	console.log("🎯 [DEBUG] Display logic:", {
		shouldShowFinalImage,
		displayUrl,
		finalImageUrl,
		valueIsValid: value ? isValidUrl(value) : false,
		hasPendingUpload: !!pendingUpload,
	});

	if (shouldShowFinalImage && displayUrl) {
		return (
			<div className={cn("relative", className)}>
				<div className="relative flex flex-col items-center justify-center rounded-lg border-2 border-solid border-gray-200 bg-gray-50 p-6">
					<div className="relative">
						<img
							src={displayUrl}
							alt="Uploaded"
							className="max-h-32 max-w-full rounded-md object-contain"
						/>
						{!disabled && (
							<Button
								type="button"
								variant="destructive"
								size="sm"
								className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0"
								onClick={handleRemove}>
								<X className="h-3 w-3" />
							</Button>
						)}
					</div>
					<p className="mt-2 text-sm text-green-600">Upload completed</p>
				</div>
			</div>
		);
	}

	// Show pending upload
	if (pendingUpload) {
		return (
			<div className={cn("relative", className)}>
				<div className="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-6">
					<div className="relative">
						<img
							src={pendingUpload.previewUrl}
							alt="Preview"
							className="max-h-32 max-w-full rounded-md object-contain"
						/>
						{!isUploading && (
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0"
								onClick={handleCancelPending}>
								<X className="h-3 w-3" />
							</Button>
						)}
					</div>

					{isUploading ?
						<div className="mt-4 w-full">
							<Progress value={uploadProgress} className="h-2" />
							<p className="mt-2 text-sm text-blue-600">
								Uploading... {Math.round(uploadProgress)}%
							</p>
						</div>
					:	<div className="mt-4 flex gap-2">
							<Button
								type="button"
								size="sm"
								onClick={handleConfirmUpload}
								disabled={disabled}
								className="bg-green-600 hover:bg-green-700">
								<Check className="mr-1 h-3 w-3" />
								Confirm Upload
							</Button>
							<Button
								type="button"
								size="sm"
								variant="outline"
								onClick={handleCancelPending}
								disabled={disabled}>
								Cancel
							</Button>
						</div>
					}
				</div>
			</div>
		);
	}

	// Show initial upload area
	return (
		<div className={cn("relative", className)}>
			<input
				type="file"
				ref={fileInputRef}
				onChange={handleFileInputChange}
				accept={acceptedFileTypes.join(",")}
				className="hidden"
				disabled={disabled || isGeneratingUrl || isUploading}
			/>

			<div
				onClick={handleClick}
				onDragEnter={handleDrag}
				onDragLeave={handleDrag}
				onDragOver={handleDrag}
				onDrop={handleDrop}
				className={cn(
					"relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-colors hover:bg-gray-100",
					dragActive && "border-primary bg-primary/5",
					disabled && "cursor-not-allowed opacity-50",
					(isGeneratingUrl || isUploading) && "cursor-not-allowed"
				)}>
				<div className="text-center">
					{isGeneratingUrl ?
						<>
							<Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />
							<div className="mt-4">
								<p className="text-sm font-medium text-blue-600">
									Preparing upload...
								</p>
								<p className="text-xs text-gray-500">
									Generating secure upload URL
								</p>
							</div>
						</>
					:	<>
							<Upload className="mx-auto h-12 w-12 text-gray-400" />
							<div className="mt-4">
								<p className="text-sm font-medium text-gray-900">
									{placeholder}
								</p>
								<p className="text-xs text-gray-500">
									PNG, JPG, WebP up to {formatFileSize(maxSize)}
								</p>
							</div>
						</>
					}
				</div>
			</div>
		</div>
	);
}
