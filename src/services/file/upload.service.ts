import { toast } from "sonner";
import {
	generatePresignedUrl,
	uploadFileToS3,
	uploadFileToS3WithFetch,
	confirmUpload as confirmUploadRequest,
} from "./request";
import { validateFile, formatFileSize } from "@/utils/file.util";
import type {
	FileUploadPurpose,
	UploadResult,
	GeneratePresignedUrlResponse,
} from "@/interfaces/file.interface";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface UploadOptions {
	purpose: FileUploadPurpose;
	onProgress?: (progress: number) => void;
	onStatusUpdate?: (status: string) => void;
}

export interface UploadServiceResult {
	success: boolean;
	data?: UploadResult;
	error?: string;
}

// ============================================================================
// UPLOAD SERVICE CLASS
// ============================================================================

/**
 * Centralized file upload service with comprehensive error handling
 * and progress tracking. Implements the 3-step upload flow:
 * 1. Generate presigned URL
 * 2. Upload to S3 with fallback methods
 * 3. Confirm upload with server
 */
export class FileUploadService {
	// ============================================================================
	// VALIDATION METHODS
	// ============================================================================

	/**
	 * Validates file before upload
	 */
	static validateFile(
		file: File,
		purpose: FileUploadPurpose
	): {
		isValid: boolean;
		error?: string;
	} {
		const validation = validateFile(file, purpose);
		if (!validation.isValid) {
			return {
				isValid: false,
				error: validation.error || "File validation failed",
			};
		}

		// Additional client-side validations
		const maxSize = 5 * 1024 * 1024; // 5MB
		const acceptedTypes = [
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/webp",
		];

		if (file.size > maxSize) {
			return {
				isValid: false,
				error: `File size must be less than ${formatFileSize(maxSize)}`,
			};
		}

		if (!acceptedTypes.includes(file.type)) {
			return {
				isValid: false,
				error: `File type not supported. Accepted: ${acceptedTypes.join(", ")}`,
			};
		}

		return { isValid: true };
	}

	// ============================================================================
	// CORE UPLOAD METHODS
	// ============================================================================

	/**
	 * STEP 1: Generate presigned URL from server
	 */
	static async generateUploadUrl(
		file: File,
		purpose: FileUploadPurpose,
		onStatusUpdate?: (status: string) => void
	): Promise<GeneratePresignedUrlResponse> {
		onStatusUpdate?.("Preparing secure upload...");

		console.log("📝 [STEP 1] Generating presigned URL...", {
			fileName: file.name,
			fileSize: formatFileSize(file.size),
			fileType: file.type,
			purpose,
		});

		try {
			const presignedData = await generatePresignedUrl({
				fileName: file.name,
				fileType: file.type,
				purpose,
				fileSize: file.size,
			});

			console.log("✅ [STEP 1] Presigned URL generated successfully");
			onStatusUpdate?.("Upload URL ready");

			return presignedData;
		} catch (error) {
			console.error("❌ [STEP 1] Failed to generate presigned URL:", error);
			throw new Error(
				error instanceof Error ? error.message : "Failed to generate upload URL"
			);
		}
	}

	/**
	 * STEP 2: Upload file to S3 with fallback mechanism
	 */
	static async uploadToCloud(
		uploadUrl: string,
		file: File,
		onProgress?: (progress: number) => void,
		onStatusUpdate?: (status: string) => void
	): Promise<void> {
		onStatusUpdate?.("Uploading to cloud storage...");
		onProgress?.(10);

		console.log("☁️ [STEP 2] Starting S3 upload...");

		try {
			// Primary method: XMLHttpRequest (better CORS handling)
			await uploadFileToS3(uploadUrl, file);
			console.log("✅ [STEP 2] Upload successful with XMLHttpRequest");
			onProgress?.(60);
		} catch (xhrError) {
			console.warn(
				"⚠️ [STEP 2] XMLHttpRequest failed, trying fetch fallback:",
				xhrError
			);
			onProgress?.(25);
			onStatusUpdate?.("Retrying upload...");

			try {
				// Fallback method: Fetch API
				await uploadFileToS3WithFetch(uploadUrl, file);
				console.log("✅ [STEP 2] Upload successful with fetch fallback");
				onProgress?.(60);
			} catch (fetchError) {
				console.error("❌ [STEP 2] All upload methods failed:", {
					xhrError,
					fetchError,
				});
				throw new Error("Failed to upload file to cloud storage");
			}
		}
	}

	/**
	 * STEP 3: Confirm upload with server and get final result
	 */
	static async confirmUpload(
		file: File,
		presignedData: GeneratePresignedUrlResponse,
		onProgress?: (progress: number) => void,
		onStatusUpdate?: (status: string) => void
	): Promise<UploadResult> {
		onStatusUpdate?.("Confirming upload...");
		onProgress?.(70);

		console.log("📋 [STEP 3] Confirming upload with server...");

		try {
			// Confirm upload with server
			const confirmData = await confirmUploadRequest({
				fileKey: presignedData.fileKey,
				fileName: file.name,
				fileType: file.type,
				fileSize: file.size,
			});

			onProgress?.(85);

			// Finalize result using confirmUpload URL (ready to use)
			const result: UploadResult = {
				id: confirmData.id,
				url: confirmData.url, // Ready-to-use URL from confirmUpload
				fileKey: presignedData.fileKey,
				viewUrl: confirmData.url, // Same as url - no need for separate endpoint
			};

			onProgress?.(100);
			onStatusUpdate?.("Upload completed successfully!");

			console.log("✅ [STEP 3] Upload confirmation completed:", result);
			return result;
		} catch (error) {
			console.error("❌ [STEP 3] Failed to confirm upload:", error);
			throw new Error(
				error instanceof Error ? error.message : "Failed to confirm upload"
			);
		}
	}

	// ============================================================================
	// HIGH-LEVEL UPLOAD METHOD
	// ============================================================================

	/**
	 * Complete upload flow: validate → generate URL → upload → confirm
	 * This is the main method that orchestrates the entire upload process
	 */
	static async uploadFile(
		file: File,
		options: UploadOptions
	): Promise<UploadServiceResult> {
		const { purpose, onProgress, onStatusUpdate } = options;

		try {
			// Reset progress
			onProgress?.(0);

			// VALIDATION
			console.log("🚀 [UPLOAD START] Initiating file upload process...");
			onStatusUpdate?.("Validating file...");

			const validation = this.validateFile(file, purpose);
			if (!validation.isValid) {
				throw new Error(validation.error || "File validation failed");
			}

			onProgress?.(5);

			// STEP 1: Generate presigned URL
			const presignedData = await this.generateUploadUrl(
				file,
				purpose,
				onStatusUpdate
			);
			onProgress?.(20);

			// STEP 2: Upload to S3
			await this.uploadToCloud(
				presignedData.uploadUrl,
				file,
				onProgress,
				onStatusUpdate
			);

			// STEP 3: Confirm upload
			const result = await this.confirmUpload(
				file,
				presignedData,
				onProgress,
				onStatusUpdate
			);

			console.log("🎉 [UPLOAD COMPLETE] File upload successful:", {
				fileName: file.name,
				fileKey: result.fileKey,
				uploadId: result.id,
			});

			toast.success(`File "${file.name}" uploaded successfully!`);

			return {
				success: true,
				data: result,
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Upload failed";

			console.error("❌ [UPLOAD FAILED] Upload process failed:", {
				fileName: file.name,
				error: errorMessage,
				stack: error instanceof Error ? error.stack : undefined,
			});

			onStatusUpdate?.(`Upload failed: ${errorMessage}`);
			onProgress?.(0);

			toast.error(`Upload failed: ${errorMessage}`);

			return {
				success: false,
				error: errorMessage,
			};
		}
	}

	// ============================================================================
	// UTILITY METHODS
	// ============================================================================

	/**
	 * Create preview URL for immediate UI feedback
	 */
	static createPreviewUrl(file: File): string {
		return URL.createObjectURL(file);
	}

	/**
	 * Clean up preview URL to prevent memory leaks
	 */
	static revokePreviewUrl(url: string): void {
		URL.revokeObjectURL(url);
	}

	/**
	 * Get human-readable file size
	 */
	static getFileSize(file: File): string {
		return formatFileSize(file.size);
	}

	/**
	 * Check if file is an image
	 */
	static isImageFile(file: File): boolean {
		return file.type.startsWith("image/");
	}
}
