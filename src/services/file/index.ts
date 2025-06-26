import { validateFile } from "@/utils/file.util";
import type {
	FileUploadPurpose,
	UploadResult,
} from "@/interfaces/file.interface";
import {
	generatePresignedUrl,
	uploadFileToS3,
	confirmUpload,
	getViewUrl,
} from "./request";

/**
 * Complete file upload workflow
 * 1. Validate file
 * 2. Generate presigned URL
 * 3. Upload to S3
 * 4. Confirm upload
 * 5. Get view URL (optional)
 */
export const uploadFile = async (
	file: File,
	purpose: FileUploadPurpose,
	options?: {
		generateViewUrl?: boolean;
		onProgress?: (progress: number) => void;
	}
): Promise<UploadResult> => {
	const { generateViewUrl = true, onProgress } = options || {};

	try {
		// Step 1: Validate file
		onProgress?.(0);
		const validation = validateFile(file, purpose);
		if (!validation.isValid) {
			throw new Error(validation.error);
		}

		// Step 2: Generate presigned URL
		onProgress?.(10);
		const presignedData = await generatePresignedUrl({
			fileName: file.name,
			fileType: file.type,
			purpose,
			fileSize: file.size,
		});

		// Step 3: Upload to S3
		onProgress?.(30);
		console.log("presignedData", presignedData);
		await uploadFileToS3(presignedData.uploadUrl, file);

		// Step 4: Confirm upload
		onProgress?.(70);
		const confirmData = await confirmUpload({
			fileKey: presignedData.fileKey,
			fileName: file.name,
			fileType: file.type,
			fileSize: file.size,
		});

		onProgress?.(90);

		// Step 5: Get view URL (optional)
		let viewUrl: string | undefined;
		if (generateViewUrl) {
			try {
				const viewData = await getViewUrl(presignedData.fileKey);
				viewUrl = viewData.url;
			} catch (error) {
				console.warn("Failed to get view URL:", error);
				// Don't fail the entire upload for this
			}
		}

		onProgress?.(100);

		return {
			id: confirmData.id,
			url: confirmData.url,
			fileKey: presignedData.fileKey,
			viewUrl,
		};
	} catch (error) {
		console.error("File upload failed:", error);
		throw error;
	}
};

/**
 * Upload multiple files concurrently
 */
export const uploadMultipleFiles = async (
	files: { file: File; purpose: FileUploadPurpose }[],
	options?: {
		generateViewUrl?: boolean;
		onProgress?: (fileIndex: number, progress: number) => void;
		onFileComplete?: (fileIndex: number, result: UploadResult) => void;
	}
): Promise<UploadResult[]> => {
	const { generateViewUrl = true, onProgress, onFileComplete } = options || {};

	const uploadPromises = files.map(async ({ file, purpose }, index) => {
		try {
			const result = await uploadFile(file, purpose, {
				generateViewUrl,
				onProgress: (progress) => onProgress?.(index, progress),
			});

			onFileComplete?.(index, result);
			return result;
		} catch (error) {
			console.error(`Failed to upload file ${index}:`, error);
			throw error;
		}
	});

	return Promise.all(uploadPromises);
};

/**
 * Get viewable URL for an existing file
 */
export const getFileViewUrl = async (fileKey: string): Promise<string> => {
	const viewData = await getViewUrl(fileKey);
	return viewData.url;
};

// Re-export request functions for direct use if needed
export {
	generatePresignedUrl,
	uploadFileToS3,
	confirmUpload,
	getViewUrl,
} from "./request";

// Re-export utilities
export { validateFile } from "@/utils/file.util";
export { FILE_VALIDATION_RULES } from "@/interfaces/file.interface";

// Re-export types
export type {
	FileUploadPurpose,
	GeneratePresignedUrlRequest,
	GeneratePresignedUrlResponse,
	ConfirmUploadRequest,
	ConfirmUploadResponse,
	GetViewUrlResponse,
	UploadResult,
} from "@/interfaces/file.interface";
