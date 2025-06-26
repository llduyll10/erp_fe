import type { FileUploadPurpose } from "@/interfaces/file.interface";
import { FILE_VALIDATION_RULES } from "@/interfaces/file.interface";

/**
 * Validate file before upload
 */
export const validateFile = (
	file: File,
	purpose: FileUploadPurpose
): { isValid: boolean; error?: string } => {
	const rules = FILE_VALIDATION_RULES[purpose];

	// Check file size
	if (file.size > rules.maxSize) {
		return {
			isValid: false,
			error: `File size exceeds maximum allowed size of ${formatFileSize(rules.maxSize)} for ${purpose}`,
		};
	}

	// Check file type
	if (!rules.allowedTypes.includes(file.type)) {
		return {
			isValid: false,
			error: `File type ${file.type} is not allowed for ${purpose}. Allowed types: ${rules.allowedTypes.join(", ")}`,
		};
	}

	return { isValid: true };
};

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
	return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
};

/**
 * Generate safe filename
 */
export const generateSafeFilename = (originalName: string): string => {
	// Remove special characters and spaces, keep only letters, numbers, dots, dashes
	const safeName = originalName
		.toLowerCase()
		.replace(/[^a-z0-9.-]/g, "-")
		.replace(/-+/g, "-") // Replace multiple dashes with single dash
		.replace(/^-|-$/g, ""); // Remove leading/trailing dashes

	return safeName;
};

/**
 * Check if file is an image
 */
export const isImageFile = (file: File): boolean => {
	return file.type.startsWith("image/");
};

/**
 * Extract folder structure from fileKey
 */
export const parseFileKey = (
	fileKey: string
): { folder: string; subfolder: string; filename: string } => {
	const parts = fileKey.split("/");

	if (parts.length < 3) {
		throw new Error(`Invalid fileKey format: ${fileKey}`);
	}

	return {
		folder: parts[0],
		subfolder: parts[1],
		filename: parts.slice(2).join("/"), // In case filename contains "/"
	};
};
