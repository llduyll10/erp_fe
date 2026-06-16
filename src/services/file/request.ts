import { request, axiosInstance, baseApiURL } from "@/utils/request.util";
import type {
	GeneratePresignedUrlRequest,
	GeneratePresignedUrlResponse,
	ConfirmUploadRequest,
	ConfirmUploadResponse,
	GetViewUrlResponse,
} from "@/interfaces/file.interface";

const API_BASE = "/presigned-upload";

/**
 * Build the backend proxy URL for a file key.
 * The proxy endpoint (@Public) streams the file from S3/R2 through the backend,
 * avoiding presigned URL failures caused by wrong S3 region/endpoint/CORS config.
 */
export const getProxyUrl = (fileKey: string | null | undefined): string | null => {
	if (!fileKey) return null;
	const parts = fileKey.split("/");
	if (parts.length < 3) return null;
	const [folder, subfolder, ...rest] = parts;
	return `${baseApiURL}/presigned-upload/proxy/${folder}/${subfolder}/${rest.join("/")}`;
};

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
 * Upload file to S3 using presigned URL with minimal headers to avoid CORS issues
 */
export const uploadFileToS3 = async (
	uploadUrl: string,
	file: File
): Promise<void> => {
	console.log("🚀 Uploading to S3:", {
		uploadUrl,
		fileName: file.name,
		fileSize: file.size,
		fileType: file.type,
	});

	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();

		// Handle completion
		xhr.addEventListener("load", () => {
			console.log("✅ S3 upload response:", {
				status: xhr.status,
				statusText: xhr.statusText,
			});

			if (xhr.status >= 200 && xhr.status < 300) {
				console.log("✅ S3 upload completed successfully");
				resolve();
			} else {
				const errorText = xhr.responseText || "Unknown error";
				console.error("❌ S3 upload failed:", {
					status: xhr.status,
					statusText: xhr.statusText,
					error: errorText,
				});
				reject(
					new Error(
						`S3 upload failed: ${xhr.status} ${xhr.statusText} - ${errorText}`
					)
				);
			}
		});

		// Handle errors
		xhr.addEventListener("error", () => {
			console.error("❌ S3 upload network error");
			const error = new Error(
				"Network error: Failed to upload to S3. Please check CORS configuration."
			);
			reject(error);
		});

		// Handle timeout
		xhr.addEventListener("timeout", () => {
			console.error("❌ S3 upload timeout");
			reject(
				new Error("Upload timeout: The upload took too long to complete.")
			);
		});

		// Configure request
		xhr.open("PUT", uploadUrl, true);

		// Try without any custom headers first to avoid CORS preflight
		// S3 can often auto-detect content type from file extension
		xhr.timeout = 60000; // 60 second timeout

		// Start upload with raw file (no headers)
		xhr.send(file);
	});
};

/**
 * Alternative upload method using fetch with minimal headers
 */
export const uploadFileToS3WithFetch = async (
	uploadUrl: string,
	file: File
): Promise<void> => {
	console.log("🚀 Uploading to S3 with fetch (no headers):", {
		uploadUrl: uploadUrl.substring(0, 100) + "...",
		fileName: file.name,
		fileSize: file.size,
	});

	try {
		const response = await fetch(uploadUrl, {
			method: "PUT",
			body: file,
			// No headers at all to avoid CORS preflight
		});

		console.log("✅ S3 upload response:", {
			status: response.status,
			statusText: response.statusText,
		});

		if (!response.ok) {
			let errorText = "Unknown error";
			try {
				errorText = await response.text();
			} catch (e) {
				console.warn("Could not read error response:", e);
			}

			console.error("❌ S3 upload failed:", {
				status: response.status,
				statusText: response.statusText,
				error: errorText,
			});

			throw new Error(
				`S3 upload failed: ${response.status} ${response.statusText} - ${errorText}`
			);
		}

		console.log("✅ S3 upload completed successfully with fetch");
	} catch (error) {
		console.error("❌ S3 upload error with fetch:", error);
		throw error;
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
 * Requires authentication
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

	try {
		const response = await request({
			url,
			method: "GET",
		});

		console.log("✅ getViewUrl response:", response);
		return response.data || response;
	} catch (error) {
		console.error("❌ getViewUrl error:", error);
		throw error;
	}
};

/**
 * @deprecated Use getProxyUrl instead — proxy is now @Public so img src works directly.
 */
export const getImageAsBase64 = (fileKey: string): Promise<string | null> =>
	Promise.resolve(getProxyUrl(fileKey));
