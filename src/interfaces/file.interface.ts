// File upload purpose types
export type FileUploadPurpose =
	| "product-image"
	| "product-document"
	| "company-logo"
	| "user-avatar";

// Generate presigned URL request
export interface GeneratePresignedUrlRequest {
	fileName: string;
	fileType: string;
	purpose: FileUploadPurpose;
	fileSize: number;
}

// Generate presigned URL response
export interface GeneratePresignedUrlResponse {
	uploadUrl: string;
	fileKey: string;
	expiresIn: number;
}

// Confirm upload request
export interface ConfirmUploadRequest {
	fileKey: string;
	fileName: string;
	fileType: string;
	fileSize: number;
}

// Confirm upload response
export interface ConfirmUploadResponse {
	id: string;
	url: string;
}

// Get view URL response
export interface GetViewUrlResponse {
	url: string;
	fileKey: string;
	expiresIn: number;
}

// Upload result interface
export interface UploadResult {
	id: string;
	url: string;
	fileKey: string;
	viewUrl?: string;
}

// File validation config
export interface FileValidationConfig {
	maxSize: number;
	allowedTypes: string[];
}

// File validation rules by purpose
export const FILE_VALIDATION_RULES: Record<
	FileUploadPurpose,
	FileValidationConfig
> = {
	"product-image": {
		maxSize: 5 * 1024 * 1024, // 5MB
		allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
	},
	"product-document": {
		maxSize: 10 * 1024 * 1024, // 10MB
		allowedTypes: [
			"application/pdf",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			"application/vnd.ms-excel",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		],
	},
	"company-logo": {
		maxSize: 2 * 1024 * 1024, // 2MB
		allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/svg+xml"],
	},
	"user-avatar": {
		maxSize: 2 * 1024 * 1024, // 2MB
		allowedTypes: ["image/jpeg", "image/jpg", "image/png"],
	},
};
