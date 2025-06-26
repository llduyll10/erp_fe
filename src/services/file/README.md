# File Upload Service với Presigned URL

Hệ thống upload file sử dụng S3 Presigned URL cho phép upload file trực tiếp lên AWS S3 mà không cần gửi qua backend server.

## 📁 Cấu trúc Files

```
src/
├── interfaces/file.interface.ts     # Type definitions
├── services/file/
│   ├── index.ts                     # Main service exports
│   ├── request.ts                   # API request functions
│   └── README.md                    # Documentation
├── utils/file.util.ts               # File validation utilities
├── hooks/common/useFileUpload.ts    # React hooks
└── components/file-upload-example.tsx # Example component
```

## 🚀 Quick Start

### 1. Basic Upload

```tsx
import { useFileUpload } from "@/hooks/common/useFileUpload";

function MyComponent() {
	const { upload, uploading, progress, error } = useFileUpload();

	const handleFileUpload = async (file: File) => {
		const result = await upload(file, "product-image");
		if (result) {
			console.log("Upload successful:", result);
			// Use result.viewUrl to display image
		}
	};

	return (
		<div>
			<input
				type="file"
				onChange={(e) => {
					const file = e.target.files?.[0];
					if (file) handleFileUpload(file);
				}}
			/>

			{uploading && <div>Progress: {progress}%</div>}
			{error && <div>Error: {error}</div>}
		</div>
	);
}
```

### 2. Upload với Progress Tracking

```tsx
import { uploadFile } from "@/services/file";

const handleUpload = async (file: File) => {
	try {
		const result = await uploadFile(file, "product-image", {
			onProgress: (progress) => {
				console.log(`Upload progress: ${progress}%`);
			},
			generateViewUrl: true,
		});

		console.log("File uploaded:", result);
		// result.viewUrl chứa URL để hiển thị file
	} catch (error) {
		console.error("Upload failed:", error);
	}
};
```

### 3. Multiple Files Upload

```tsx
import { useMultipleFileUpload } from "@/hooks/common/useFileUpload";

function MultipleUpload() {
	const { uploadMultiple, uploading, uploadedFiles, progress } =
		useMultipleFileUpload();

	const handleMultipleUpload = async (files: FileList) => {
		const fileArray = Array.from(files).map((file) => ({
			file,
			purpose: "product-image" as const,
		}));

		const results = await uploadMultiple(fileArray);
		console.log("All files uploaded:", results);
	};

	return (
		<div>
			<input
				type="file"
				multiple
				onChange={(e) => e.target.files && handleMultipleUpload(e.target.files)}
			/>

			{uploading && (
				<div>
					Uploading... ({uploadedFiles.length} completed)
					{Object.entries(progress).map(([index, prog]) => (
						<div key={index}>
							File {index}: {prog}%
						</div>
					))}
				</div>
			)}
		</div>
	);
}
```

## 📋 Supported File Types

### Product Images (`product-image`)

- **Max Size**: 5MB
- **Types**: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`

### Product Documents (`product-document`)

- **Max Size**: 10MB
- **Types**: PDF, Word, Excel files

### Company Logo (`company-logo`)

- **Max Size**: 2MB
- **Types**: `image/jpeg`, `image/jpg`, `image/png`, `image/svg+xml`

### User Avatar (`user-avatar`)

- **Max Size**: 2MB
- **Types**: `image/jpeg`, `image/jpg`, `image/png`

## 🔧 API Functions

### `uploadFile(file, purpose, options)`

Complete upload workflow:

1. Validate file
2. Generate presigned URL
3. Upload to S3
4. Confirm upload
5. Get view URL

```tsx
import { uploadFile } from "@/services/file";

const result = await uploadFile(file, "product-image", {
	generateViewUrl: true,
	onProgress: (progress) => console.log(progress),
});
```

### `getFileViewUrl(fileKey)`

Get viewable URL for existing file:

```tsx
import { getFileViewUrl } from "@/services/file";

const viewUrl = await getFileViewUrl("products/images/uuid-filename.jpg");
// Use viewUrl in <img src={viewUrl} />
```

### `validateFile(file, purpose)`

Validate file before upload:

```tsx
import { validateFile } from "@/utils/file.util";

const validation = validateFile(file, "product-image");
if (!validation.isValid) {
	console.error(validation.error);
}
```

## 🎣 React Hooks

### `useFileUpload(options)`

```tsx
const {
	upload, // Function to upload file
	uploading, // Boolean: upload in progress
	progress, // Number: 0-100 progress
	error, // String: error message
	resetState, // Function: reset state
} = useFileUpload({
	showToast: true, // Show success/error toasts
	generateViewUrl: true, // Generate viewable URL
});
```

### `useMultipleFileUpload(options)`

```tsx
const {
	uploadMultiple, // Function to upload multiple files
	uploading, // Boolean: upload in progress
	uploadedFiles, // Array: successfully uploaded files
	failedFiles, // Array: failed file names
	progress, // Object: progress per file
	error, // String: error message
	resetState, // Function: reset state
} = useMultipleFileUpload();
```

### `useImageUrl()`

```tsx
const {
	getImageUrl, // Function to get image URL
	loading, // Boolean: loading state
	error, // String: error message
} = useImageUrl();

const imageUrl = await getImageUrl("products/images/uuid-filename.jpg");
```

## 🛠️ File Utilities

```tsx
import {
	validateFile,
	formatFileSize,
	generateSafeFilename,
	isImageFile,
	parseFileKey,
} from "@/utils/file.util";

// Validate file
const { isValid, error } = validateFile(file, "product-image");

// Format file size
const sizeText = formatFileSize(1024000); // "1 MB"

// Generate safe filename
const safeName = generateSafeFilename("My File Name!.jpg"); // "my-file-name.jpg"

// Check if image
const isImage = isImageFile(file); // true/false

// Parse file key
const { folder, subfolder, filename } = parseFileKey(
	"products/images/uuid-file.jpg"
);
```

## 🎨 Example Component

```tsx
import { FileUploadExample } from "@/components/file-upload-example";

function MyPage() {
	return (
		<FileUploadExample
			purpose="product-image"
			onUploadComplete={(result) => {
				console.log("Upload completed:", result);
				// Handle upload completion
			}}
		/>
	);
}
```

## 🔄 Complete Workflow

1. **Client validates** file size & type
2. **Client requests** presigned URL from backend
3. **Client uploads** file directly to S3 using presigned URL
4. **Client confirms** upload completion with backend
5. **Client gets** viewable URL for display (optional)

## ⚡ Best Practices

### File Validation

```tsx
// Always validate before upload
const validation = validateFile(file, purpose);
if (!validation.isValid) {
	toast.error(validation.error);
	return;
}
```

### Error Handling

```tsx
try {
	const result = await upload(file, "product-image");
	// Handle success
} catch (error) {
	console.error("Upload failed:", error);
	// Handle error
}
```

### Progress Feedback

```tsx
const { upload, progress, uploading } = useFileUpload();

// Show progress to user
{
	uploading && <div>Uploading... {progress}%</div>;
}
```

### Image Display

```tsx
// For uploaded images, use viewUrl
if (result.viewUrl) {
	setImageSrc(result.viewUrl);
}

// Or get URL separately
const imageUrl = await getFileViewUrl(result.fileKey);
```

## 🚨 Common Issues

### Upload Fails with "SignatureDoesNotMatch"

- **Cause**: Using FormData instead of raw binary
- **Solution**: Upload file directly: `body: file`

### Image Downloads Instead of Displaying

- **Cause**: Wrong Content-Type during upload
- **Solution**: Use correct MIME type in headers

### File Not Found Error

- **Cause**: Trying to get view URL before upload completion
- **Solution**: Wait for upload confirmation before getting view URL

## 🔗 Integration Examples

### With Product Creation

```tsx
// 1. Upload image first
const imageResult = await upload(imageFile, "product-image");

// 2. Create product with image ID
const product = await createProduct({
	name: "Product Name",
	image_id: imageResult.id,
	// ... other fields
});

// 3. Display product with image
<img src={imageResult.viewUrl} alt={product.name} />;
```

### With Form Validation

```tsx
const ProductForm = () => {
	const [imageResult, setImageResult] = useState<UploadResult | null>(null);

	const handleSubmit = async (data: ProductFormData) => {
		if (!imageResult) {
			toast.error("Please upload an image");
			return;
		}

		await createProduct({
			...data,
			image_id: imageResult.id,
		});
	};

	return (
		<form onSubmit={handleSubmit}>
			<FileUploadExample
				purpose="product-image"
				onUploadComplete={setImageResult}
			/>
			{/* Other form fields */}
		</form>
	);
};
```

Hệ thống này cung cấp một giải pháp upload file hoàn chỉnh, an toàn và hiệu quả với UX tốt cho người dùng.
