import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	generatePresignedUrl,
	uploadFileToS3,
	confirmUpload,
	getViewUrl,
} from "@/services/file/request";
import type {
	FileUploadPurpose,
	UploadResult,
	GeneratePresignedUrlRequest,
	GeneratePresignedUrlResponse,
	ConfirmUploadRequest,
} from "@/interfaces/file.interface";
import { validateFile } from "@/utils/file.util";

interface UseFileUploadState {
	// Presigned URL state
	generatingUrl: boolean;
	presignedData: GeneratePresignedUrlResponse | null;
	generateError: string | null;

	// Upload state
	uploading: boolean;
	progress: number;
	uploadError: string | null;

	// Result
	uploadResult: UploadResult | null;
}

interface UseFileUploadOptions {
	showToast?: boolean;
	generateViewUrl?: boolean;
}

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
	const { showToast = true, generateViewUrl = true } = options;

	const [state, setState] = useState<UseFileUploadState>({
		generatingUrl: false,
		presignedData: null,
		generateError: null,
		uploading: false,
		progress: 0,
		uploadError: null,
		uploadResult: null,
	});

	const [uploadData, setUploadData] = useState<{
		file: File;
		purpose: FileUploadPurpose;
		onComplete?: (result: UploadResult) => void;
	} | null>(null);

	const resetState = useCallback(() => {
		setState({
			generatingUrl: false,
			presignedData: null,
			generateError: null,
			uploading: false,
			progress: 0,
			uploadError: null,
			uploadResult: null,
		});
		setUploadData(null);
	}, []);

	// Step 1: Generate presigned URL mutation (called when user clicks upload button)
	const generateUrlMutation = useMutation({
		mutationFn: generatePresignedUrl,
		onMutate: () => {
			setState((prev) => ({
				...prev,
				generatingUrl: true,
				generateError: null,
				presignedData: null,
			}));
		},
		onSuccess: (presignedData) => {
			console.log("presignedData", presignedData);
			setState((prev) => ({
				...prev,
				generatingUrl: false,
				presignedData,
				generateError: null,
			}));

			if (showToast) {
				toast.success("Ready to upload file!");
			}
		},
		onError: (error) => {
			const errorMessage =
				error instanceof Error ?
					error.message
				:	"Failed to generate presigned URL";
			setState((prev) => ({
				...prev,
				generatingUrl: false,
				generateError: errorMessage,
			}));

			if (showToast) {
				toast.error(`Generate URL failed: ${errorMessage}`);
			}
		},
	});

	// Step 2: Upload to S3 mutation (called when user submits file)
	const uploadToS3Mutation = useMutation({
		mutationFn: async ({
			uploadUrl,
			file,
			fileKey,
		}: {
			uploadUrl: string;
			file: File;
			fileKey: string;
		}) => {
			await uploadFileToS3(uploadUrl, file);
			return { file, fileKey };
		},
		onSuccess: (data) => {
			setState((prev) => ({ ...prev, progress: 70 }));

			// Step 3: Confirm upload
			if (uploadData) {
				confirmUploadMutation.mutate({
					fileKey: data.fileKey,
					fileName: data.file.name,
					fileType: data.file.type,
					fileSize: data.file.size,
				});
			}
		},
		onError: (error) => {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to upload to S3";
			setState((prev) => ({
				...prev,
				uploading: false,
				uploadError: errorMessage,
			}));

			if (showToast) {
				toast.error(`S3 upload failed: ${errorMessage}`);
			}
		},
	});

	// Step 3: Confirm upload mutation
	const confirmUploadMutation = useMutation({
		mutationFn: confirmUpload,
		onSuccess: (confirmData, variables) => {
			setState((prev) => ({ ...prev, progress: 90 }));

			const result: UploadResult = {
				id: confirmData.id,
				url: confirmData.url,
				fileKey: variables.fileKey,
			};

			// Step 4: Get view URL (optional)
			if (generateViewUrl) {
				getViewUrlMutation.mutate({
					fileKey: variables.fileKey,
					result,
				});
			} else {
				// Complete without view URL
				completeUpload(result);
			}
		},
		onError: (error) => {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to confirm upload";
			setState((prev) => ({
				...prev,
				uploading: false,
				uploadError: errorMessage,
			}));

			if (showToast) {
				toast.error(`Confirm upload failed: ${errorMessage}`);
			}
		},
	});

	// Step 4: Get view URL mutation (optional)
	const getViewUrlMutation = useMutation({
		mutationFn: async ({
			fileKey,
			result,
		}: {
			fileKey: string;
			result: UploadResult;
		}) => {
			const viewData = await getViewUrl(fileKey);
			return { viewUrl: viewData.url, result };
		},
		onSuccess: ({ viewUrl, result }) => {
			const finalResult = { ...result, viewUrl };
			completeUpload(finalResult);
		},
		onError: (error, variables) => {
			// Don't fail the entire upload for view URL error
			console.warn("Failed to get view URL:", error);
			completeUpload(variables.result);
		},
	});

	const completeUpload = (result: UploadResult) => {
		setState((prev) => ({
			...prev,
			uploading: false,
			progress: 100,
			uploadResult: result,
		}));

		if (showToast && uploadData?.file) {
			toast.success(`File "${uploadData.file.name}" uploaded successfully!`);
		}

		uploadData?.onComplete?.(result);
	};

	// Function to generate presigned URL (call this when user clicks upload button)
	const generateUploadUrl = useCallback(
		async (
			fileName: string,
			fileType: string,
			purpose: FileUploadPurpose,
			fileSize: number
		) => {
			const requestData: GeneratePresignedUrlRequest = {
				fileName,
				fileType,
				purpose,
				fileSize,
			};

			return generateUrlMutation.mutateAsync(requestData);
		},
		[generateUrlMutation]
	);

	// Function to upload file using existing presigned URL (call this when user submits file)
	const submitFile = useCallback(
		async (file: File): Promise<UploadResult | null> => {
			if (!state.presignedData) {
				const error =
					"No presigned URL available. Please click upload button first.";
				setState((prev) => ({ ...prev, uploadError: error }));

				if (showToast) {
					toast.error(error);
				}

				return null;
			}

			return new Promise((resolve, reject) => {
				// Validate file
				const validation = validateFile(
					file,
					uploadData?.purpose || "product-image"
				);
				if (!validation.isValid) {
					const error = validation.error || "File validation failed";
					setState((prev) => ({ ...prev, uploadError: error }));

					if (showToast) {
						toast.error(error);
					}

					reject(new Error(error));
					return;
				}

				// Reset upload state
				setState((prev) => ({
					...prev,
					uploading: true,
					progress: 30,
					uploadError: null,
					uploadResult: null,
				}));

				// Set upload data with callback
				setUploadData({
					file,
					purpose: uploadData?.purpose || "product-image",
					onComplete: (result) => {
						resolve(result);
					},
				});

				// Start upload to S3
				uploadToS3Mutation.mutate({
					uploadUrl: state.presignedData!.uploadUrl,
					file,
					fileKey: state.presignedData!.fileKey,
				});
			});
		},
		[state.presignedData, uploadData?.purpose, showToast, uploadToS3Mutation]
	);

	// Legacy function for backward compatibility (generates URL and uploads in one go)
	const upload = useCallback(
		async (
			file: File,
			purpose: FileUploadPurpose
		): Promise<UploadResult | null> => {
			try {
				// Step 1: Generate presigned URL
				await generateUploadUrl(file.name, file.type, purpose, file.size);

				// Step 2: Upload file
				const result = await submitFile(file);
				return result;
			} catch (error) {
				console.error("Upload failed:", error);
				return null;
			}
		},
		[generateUploadUrl, submitFile]
	);

	return {
		// States
		generatingUrl: state.generatingUrl,
		presignedData: state.presignedData,
		generateError: state.generateError,
		uploading: state.uploading,
		progress: state.progress,
		uploadError: state.uploadError,
		uploadResult: state.uploadResult,

		// Actions
		generateUploadUrl, // NEW: Call this when user clicks upload button
		submitFile, // NEW: Call this when user submits file
		upload, // Legacy: One-step upload (for backward compatibility)
		resetState,

		// Individual mutation states
		isGeneratingUrl: generateUrlMutation.isPending,
		isUploadingToS3: uploadToS3Mutation.isPending,
		isConfirming: confirmUploadMutation.isPending,
		isGettingViewUrl: getViewUrlMutation.isPending,
	};
};

interface UseMultipleFileUploadState {
	uploading: boolean;
	uploadedFiles: UploadResult[];
	failedFiles: string[];
	progress: Record<number, number>;
	error: string | null;
}

export const useMultipleFileUpload = (options: UseFileUploadOptions = {}) => {
	const { showToast = true, generateViewUrl = true } = options;

	const [state, setState] = useState<UseMultipleFileUploadState>({
		uploading: false,
		uploadedFiles: [],
		failedFiles: [],
		progress: {},
		error: null,
	});

	const resetState = useCallback(() => {
		setState({
			uploading: false,
			uploadedFiles: [],
			failedFiles: [],
			progress: {},
			error: null,
		});
	}, []);

	const uploadMultiple = useCallback(
		async (
			files: { file: File; purpose: FileUploadPurpose }[]
		): Promise<UploadResult[]> => {
			setState((prev) => ({
				...prev,
				uploading: true,
				uploadedFiles: [],
				failedFiles: [],
				progress: {},
				error: null,
			}));

			try {
				// TODO: Implement multiple file upload with onSuccess pattern
				// For now, just return empty array
				const results: UploadResult[] = [];

				setState((prev) => ({
					...prev,
					uploading: false,
				}));

				if (showToast) {
					toast.success(`All ${results.length} files uploaded successfully!`);
				}

				return results;
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Upload failed";

				setState((prev) => ({
					...prev,
					uploading: false,
					error: errorMessage,
				}));

				if (showToast) {
					toast.error(`Upload failed: ${errorMessage}`);
				}

				return [];
			}
		},
		[generateViewUrl, showToast]
	);

	return {
		...state,
		uploadMultiple,
		resetState,
	};
};

export const useImageUrl = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const getImageUrlMutation = useMutation({
		mutationFn: getViewUrl,
		onSuccess: () => {
			setLoading(false);
			setError(null);
		},
		onError: (err) => {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to get image URL";
			setError(errorMessage);
			setLoading(false);
		},
	});

	const getImageUrl = useCallback(
		async (fileKey: string): Promise<string | null> => {
			setLoading(true);
			setError(null);

			try {
				const result = await getImageUrlMutation.mutateAsync(fileKey);
				return result.url;
			} catch (err) {
				return null;
			}
		},
		[getImageUrlMutation]
	);

	return {
		getImageUrl,
		loading,
		error,
	};
};
