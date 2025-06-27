# AutocompleteSearch Component

Một component autocomplete search generic có thể sử dụng cho nhiều loại API khác nhau mà không cần tạo riêng component cho từng loại.

## Tính năng

- ✅ **Generic & Type-safe**: Hỗ trợ TypeScript với generic types
- ✅ **Debounced Search**: Tự động debounce để tối ưu performance API calls
- ✅ **Customizable Fields**: Configure được fields để hiển thị (label, value, description, etc.)
- ✅ **Custom Rendering**: Có thể custom render options và trigger
- ✅ **Loading States**: Loading indicator tự động
- ✅ **Error Handling**: Xử lý lỗi API
- ✅ **Clear Selection**: Option để clear selection
- ✅ **Search Filtering**: Search theo API backend

## Cách sử dụng cơ bản

### 1. Sử dụng CategoryCombobox (đã wrap sẵn)

```tsx
import { CategoryCombobox } from "@/components/molecules/category-combobox";

function MyForm() {
	const [categoryId, setCategoryId] = useState("");

	return (
		<CategoryCombobox
			value={categoryId}
			onValueChange={setCategoryId}
			placeholder="Select category..."
		/>
	);
}
```

### 2. Sử dụng AutocompleteSearch trực tiếp

```tsx
import { AutocompleteSearch } from "@/components/molecules/autocomplete-search";
import { useGetListCategory } from "@/services/category";
import { Category } from "@/models/category.model";

function MyForm() {
	const [categoryId, setCategoryId] = useState("");

	// Define field configuration
	const fieldConfig = {
		value: "id" as const,
		label: "name" as const,
		description: "description" as const,
		extra: "code" as const,
	};

	// Create query function
	const useQuery = (searchQuery: string) => {
		return useGetListCategory({
			q: searchQuery || undefined,
			page: 1,
			limit: 50,
		});
	};

	return (
		<AutocompleteSearch<Category>
			useQuery={useQuery}
			fieldConfig={fieldConfig}
			value={categoryId}
			onValueChange={setCategoryId}
			placeholder="Select category..."
			searchPlaceholder="Search categories..."
		/>
	);
}
```

### 3. Sử dụng với useAutocompleteSearch hook

```tsx
import { AutocompleteSearch } from "@/components/molecules/autocomplete-search";
import {
	useAutocompleteSearch,
	useCategoryAutocomplete,
} from "@/hooks/common/useAutocompleteSearch";
import { useGetListCategory } from "@/services/category";

function MyForm() {
	const [categoryId, setCategoryId] = useState("");

	const { fieldConfig } = useCategoryAutocomplete();
	const { useQuery } = useAutocompleteSearch(useGetListCategory, fieldConfig);

	return (
		<AutocompleteSearch
			useQuery={useQuery}
			fieldConfig={fieldConfig}
			value={categoryId}
			onValueChange={setCategoryId}
			placeholder="Select category..."
		/>
	);
}
```

## API Reference

### AutocompleteSearch Props

| Prop                | Type                                                  | Default               | Description                 |
| ------------------- | ----------------------------------------------------- | --------------------- | --------------------------- |
| `useQuery`          | `(searchQuery: string) => UseQueryResult`             | **Required**          | Function để fetch data      |
| `fieldConfig`       | `AutocompleteFieldConfig<T>`                          | **Required**          | Configuration cho fields    |
| `value`             | `string`                                              | `undefined`           | Selected value              |
| `onValueChange`     | `(value: string) => void`                             | `undefined`           | Callback khi value thay đổi |
| `placeholder`       | `string`                                              | `"Select option..."`  | Placeholder text            |
| `searchPlaceholder` | `string`                                              | `"Search..."`         | Search input placeholder    |
| `emptyMessage`      | `string`                                              | `"No options found."` | Message khi không có data   |
| `loadingMessage`    | `string`                                              | `"Loading..."`        | Loading message             |
| `clearLabel`        | `string`                                              | `"Clear selection"`   | Clear option label          |
| `className`         | `string`                                              | `undefined`           | CSS class cho button        |
| `disabled`          | `boolean`                                             | `false`               | Disable component           |
| `enableClear`       | `boolean`                                             | `true`                | Show clear option           |
| `debounceMs`        | `number`                                              | `300`                 | Debounce delay (ms)         |
| `renderOption`      | `(item: T, isSelected: boolean) => ReactNode`         | `undefined`           | Custom option renderer      |
| `renderTrigger`     | `(selectedItem: T, placeholder: string) => ReactNode` | `undefined`           | Custom trigger renderer     |

### AutocompleteFieldConfig

```tsx
interface AutocompleteFieldConfig<T> {
	value: keyof T; // Field for value (thường là "id")
	label: keyof T; // Field for display label (thường là "name")
	description?: keyof T; // Field for description (optional)
	subtitle?: keyof T; // Field for subtitle (optional)
	extra?: keyof T; // Field for extra info (optional)
}
```

## Ví dụ nâng cao

### Custom Rendering

```tsx
<AutocompleteSearch
	// ... other props
	renderOption={(category, isSelected) => (
		<div className="flex items-center space-x-3">
			<div className="flex-1">
				<div className="font-medium">{category.name}</div>
				{category.description && (
					<div className="text-sm text-muted-foreground">
						{category.description}
					</div>
				)}
				{category.code && (
					<div className="text-xs text-blue-600 font-mono">
						#{category.code}
					</div>
				)}
			</div>
			{isSelected && <div className="w-2 h-2 bg-primary rounded-full"></div>}
		</div>
	)}
	renderTrigger={(selectedCategory, placeholder) => (
		<span>
			{selectedCategory ?
				<span className="flex items-center gap-2">
					<span>{selectedCategory.name}</span>
					{selectedCategory.code && (
						<span className="text-xs text-muted-foreground">
							({selectedCategory.code})
						</span>
					)}
				</span>
			:	placeholder}
		</span>
	)}
/>
```

### Sử dụng cho API khác

```tsx
// User AutocompleteSearch
const userFieldConfig = {
	value: "id" as const,
	label: "name" as const,
	subtitle: "email" as const,
	description: "role" as const,
};

// Product AutocompleteSearch
const productFieldConfig = {
	value: "id" as const,
	label: "name" as const,
	description: "description" as const,
	subtitle: "item_type" as const,
};
```

## Tạo AutocompleteSearch mới cho API khác

1. **Tạo wrapper component** (như CategoryCombobox):

```tsx
export function UserCombobox({
	value,
	onValueChange,
	...props
}: ComboboxProps) {
	const fieldConfig = {
		value: "id" as const,
		label: "name" as const,
		subtitle: "email" as const,
	};

	const { useQuery } = useAutocompleteSearch(useGetListUser, fieldConfig);

	return (
		<AutocompleteSearch<User>
			useQuery={useQuery}
			fieldConfig={fieldConfig}
			value={value}
			onValueChange={onValueChange}
			{...props}
		/>
	);
}
```

2. **Thêm field config helper** trong `useAutocompleteSearch.ts`:

```tsx
export function useUserAutocomplete() {
	return {
		fieldConfig: {
			value: "id" as const,
			label: "name" as const,
			subtitle: "email" as const,
			description: "role" as const,
		},
	};
}
```

## Best Practices

1. **Luôn sử dụng wrapper components** cho các entity thường dùng
2. **Đặt debounceMs phù hợp** (300ms là tốt cho hầu hết trường hợp)
3. **Limit kết quả API** để tối ưu performance (50 items là đủ)
4. **Handle loading và error states** properly
5. **Sử dụng TypeScript generics** để type-safe
6. **Custom render** khi cần hiển thị phức tạp hơn
