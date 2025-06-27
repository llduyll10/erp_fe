import { useState, useCallback } from "react";
import type {
	FileUploadPurpose,
	UploadResult,
} from "@/interfaces/file.interface";

interface UseImageUploadProps {
	purpose: FileUploadPurpose;
	onUploadComplete?: (result: UploadResult) => void;
	onUploadError?: (error: string) => void;
}

interface UseImageUploadReturn {
	imageUrl: string | null;
	isUploading: boolean;
	error: string | null;
	uploadProgress: number;
	setImageUrl: (url: string | null) => void;
	handleUploadStart: () => void;
	handleUploadComplete: (result: UploadResult) => void;
	handleUploadError: (error: string) => void;
	clearError: () => void;
	reset: () => void;
}

export function useImageUpload({
	purpose,
	onUploadComplete,
	onUploadError,
}: UseImageUploadProps): UseImageUploadReturn {
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [uploadProgress, setUploadProgress] = useState(0);

	const handleUploadStart = useCallback(() => {
		setIsUploading(true);
		setError(null);
		setUploadProgress(0);
	}, []);

	const handleUploadComplete = useCallback(
		(result: UploadResult) => {
			setIsUploading(false);
			setUploadProgress(100);
			setImageUrl(result.viewUrl || result.url);
			setError(null);
			onUploadComplete?.(result);
		},
		[onUploadComplete]
	);

	const handleUploadError = useCallback(
		(errorMessage: string) => {
			setIsUploading(false);
			setUploadProgress(0);
			setError(errorMessage);
			onUploadError?.(errorMessage);
		},
		[onUploadError]
	);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	const reset = useCallback(() => {
		setImageUrl(null);
		setIsUploading(false);
		setError(null);
		setUploadProgress(0);
	}, []);

	return {
		imageUrl,
		isUploading,
		error,
		uploadProgress,
		setImageUrl,
		handleUploadStart,
		handleUploadComplete,
		handleUploadError,
		clearError,
		reset,
	};
}
