import { request } from "@/utils/request.util";
import type {
	GeneratePresignedUrlRequest,
	GeneratePresignedUrlResponse,
	ConfirmUploadRequest,
	ConfirmUploadResponse,
	GetViewUrlResponse,
} from "@/interfaces/file.interface";

const API_BASE = "/presigned-upload";

/**
 * Generate presigned URL for file upload
 */
export const generatePresignedUrl = async (
	data: GeneratePresignedUrlRequest
): Promise<GeneratePresignedUrlResponse> => {
	console.log("🚀 Sending generatePresignedUrl request:", data);

	try {
		const response = await request({
			url: `${API_BASE}/generate-url`,
			method: "POST",
			data,
		});

		console.log("✅ generatePresignedUrl response:", response);
		return response.data || response;
	} catch (error) {
		console.error("❌ generatePresignedUrl error:", error);
		throw error;
	}
};

/**
 * Upload file to S3 using presigned URL
 * IMPORTANT: Must upload as raw binary data, NOT FormData
 */
export const uploadFileToS3 = async (
	uploadUrl: string,
	file: File
): Promise<void> => {
	console.log("🚀 Uploading to S3:", {
		uploadUrl,
		fileName: file.name,
		fileSize: file.size,
	});

	const response = await fetch(uploadUrl, {
		method: "PUT",
		headers: {
			"Content-Type": file.type,
		},
		body: file, // Raw file object, NOT FormData
	});

	console.log("✅ S3 upload response status:", response.status);

	if (!response.ok) {
		const errorText = await response.text();
		console.error("❌ S3 upload failed:", {
			status: response.status,
			error: errorText,
		});
		throw new Error(`S3 upload failed: ${response.status} - ${errorText}`);
	}
};

/**
 * Confirm upload completion
 */
export const confirmUpload = async (
	data: ConfirmUploadRequest
): Promise<ConfirmUploadResponse> => {
	console.log("🚀 Sending confirmUpload request:", data);

	try {
		const response = await request({
			url: `${API_BASE}/confirm`,
			method: "POST",
			data,
		});

		console.log("✅ confirmUpload response:", response);
		return response.data || response;
	} catch (error) {
		console.error("❌ confirmUpload error:", error);
		throw error;
	}
};

/**
 * Get viewable URL for file
 * Public endpoint - no auth required
 */
export const getViewUrl = async (
	fileKey: string
): Promise<GetViewUrlResponse> => {
	console.log("🚀 Getting view URL for fileKey:", fileKey);

	// Extract folder, subfolder, filename from fileKey
	// Example: "products/images/uuid-filename.jpg" -> ["products", "images", "uuid-filename.jpg"]
	const parts = fileKey.split("/");

	if (parts.length < 3) {
		throw new Error(`Invalid fileKey format: ${fileKey}`);
	}

	const folder = parts[0];
	const subfolder = parts[1];
	const filename = parts.slice(2).join("/"); // In case filename contains "/"

	const url = `${API_BASE}/view/${folder}/${subfolder}/${filename}`;
	console.log("🚀 Requesting view URL:", url);

	const response = await fetch(url, {
		method: "GET",
	});

	console.log("✅ getViewUrl response status:", response.status);

	if (!response.ok) {
		const errorText = await response.text();
		console.error("❌ getViewUrl failed:", {
			status: response.status,
			error: errorText,
		});
		throw new Error(`Get view URL failed: ${response.status} - ${errorText}`);
	}

	const result = await response.json();
	console.log("✅ getViewUrl result:", result);
	return result;
};
