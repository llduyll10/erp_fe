# Form Workflow Documentation

## 📋 Tổng quan

Dự án sử dụng **React Hook Form + Zod** để quản lý form với validation mạnh mẽ và type-safe. Tất cả form đều follow pattern tương tự để đảm bảo consistency.

## 🏗️ Cấu trúc Form

### 1. Schema Definition (Zod)

```typescript
// src/utils/schema.util.ts hoặc trong hook
const CustomerFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email format").optional(),
	phone_number: z.string().min(1, "Phone number is required"),
	customer_group: z.nativeEnum(CustomerGroup).optional(),
	customer_type: z.nativeEnum(CustomerType).optional(),
	customer_source: z.nativeEnum(CustomerSource).optional(),
	status: z.nativeEnum(CustomerStatus).optional(),
	// Address fields
	street_address: z.string().optional(),
	country: z.string().optional(),
	state_province: z.string().optional(),
	district: z.string().optional(),
	ward: z.string().optional(),
	postal_code: z.string().optional(),
	// Backend compatibility
	city: z.string().optional(),
	// Shipping address (same structure)
	shipping_street_address: z.string().optional(),
	// ... other shipping fields
	note: z.string().optional(),
});

type CustomerFormData = z.infer<typeof CustomerFormSchema>;
```

### 2. Form Hook Pattern

```typescript
// src/hooks/customer/useCustomerForm.tsx
export function useCustomerForm(defaultValues?: Partial<Customer>) {
	const form = useForm<CustomerFormData>({
		resolver: zodResolver(CustomerFormSchema),
		defaultValues: {
			name: "",
			email: "",
			phone_number: "",
			country: "Việt Nam",
			shipping_country: "Việt Nam",
			status: CustomerStatus.ACTIVE,
			...defaultValues,
		},
	});

	const createMutation = useCreateCustomer();
	const updateMutation = useUpdateCustomer();

	const onSubmit = async (data: CustomerFormData) => {
		try {
			// Transform data cho backend compatibility
			const submitData = {
				...data,
				city: data.state_province, // Map state_province to city
				shipping_city: data.shipping_state_province,
			};

			if (defaultValues?.id) {
				await updateMutation.mutateAsync({
					id: defaultValues.id,
					data: submitData,
				});
			} else {
				await createMutation.mutateAsync(submitData);
			}

			toast.success("Customer saved successfully");
		} catch (error) {
			toast.error("Failed to save customer");
		}
	};

	return {
		form,
		onSubmit: form.handleSubmit(onSubmit),
		isLoading: createMutation.isPending || updateMutation.isPending,
	};
}
```

### 3. Form Component Structure

```typescript
// src/pages/CustomerManagement/CustomerForm/index.tsx
export function CustomerForm({ customer }: { customer?: Customer }) {
  const { form, onSubmit, isLoading } = useCustomerForm(customer);
  const [sameAsBilling, setSameAsBilling] = useState(false);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Other basic fields... */}
          </CardContent>
        </Card>

        {/* Address Section */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Address</CardTitle>
          </CardHeader>
          <CardContent>
            <AddressForm
              form={form}
              prefix="" // billing fields
            />
          </CardContent>
        </Card>

        {/* Shipping Address with Copy Feature */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="sameAsBillingAddress"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={sameAsBilling}
                        onCheckedChange={(checked) => {
                          setSameAsBilling(!!checked);
                          if (checked) {
                            // Copy billing to shipping
                            const billing = form.getValues();
                            form.setValue("shipping_street_address", billing.street_address);
                            // ... copy other fields
                          } else {
                            // Clear shipping fields
                            form.setValue("shipping_street_address", "");
                            // ... clear other fields
                          }
                        }}
                      />
                    </FormControl>
                    <FormLabel>Same as billing address</FormLabel>
                  </FormItem>
                )}
              />

              <AddressForm
                form={form}
                prefix="shipping_"
                key={sameAsBilling ? "same" : "different"} // Force re-render
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {customer ? "Update" : "Create"} Customer
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

## 🧩 Reusable Components

### 1. AddressForm Component

```typescript
// src/components/molecules/address-form.tsx
interface AddressFormProps {
  form: UseFormReturn<any>;
  prefix?: string; // "" for billing, "shipping_" for shipping
}

export function AddressForm({ form, prefix = "" }: AddressFormProps) {
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);

  // Province/District/Ward filtering logic using dvhcvn library
  // Three-tier filtering: Province -> District -> Ward

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Street Address */}
      <FormField
        control={form.control}
        name={`${prefix}street_address`}
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Street Address</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Province Combobox */}
      <FormField
        control={form.control}
        name={`${prefix}state_province`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Province/City</FormLabel>
            <FormControl>
              <Combobox
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  setSelectedProvince(provinces.find(p => p.name === value));
                  setSelectedDistrict(null);
                }}
                options={provinces.map(p => ({ value: p.name, label: p.name }))}
                placeholder="Search province..."
                emptyText="No province found"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* District & Ward similar pattern... */}
    </div>
  );
}
```

## 🔧 Best Practices

### 1. Form Validation

- ✅ Sử dụng Zod schema cho type-safe validation
- ✅ Required fields có dấu `*` trong label
- ✅ Error messages rõ ràng và user-friendly
- ✅ Real-time validation khi user nhập

### 2. State Management

- ✅ React Hook Form quản lý form state
- ✅ useState cho UI state (sameAsBilling, province selection)
- ✅ TanStack Query cho server state

### 3. Performance

- ✅ useCallback cho event handlers
- ✅ Proper key prop để force re-render khi cần
- ✅ Debounce cho search/autocomplete

### 4. UX Improvements

- ✅ Loading states với spinner
- ✅ Toast notifications cho success/error
- ✅ Keyboard navigation (Enter to search)
- ✅ Auto-focus các field quan trọng

### 5. Backend Compatibility

- ✅ Map frontend fields sang backend format
- ✅ Handle null/undefined values
- ✅ Backward compatibility với existing API

## 📝 Example Usage

```typescript
// Create new customer
<CustomerForm />

// Edit existing customer
<CustomerForm customer={existingCustomer} />

// With custom default values
const form = useCustomerForm({
  name: "Default Name",
  status: CustomerStatus.ACTIVE,
});
```

## 🔍 Testing

```typescript
// Form validation testing
describe('CustomerForm', () => {
  it('should show required field errors', async () => {
    render(<CustomerForm />);
    fireEvent.click(screen.getByText('Create Customer'));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Phone number is required')).toBeInTheDocument();
    });
  });

  it('should copy billing to shipping address', () => {
    render(<CustomerForm />);

    // Fill billing address
    fireEvent.change(screen.getByLabelText('Street Address'), {
      target: { value: '123 Main St' }
    });

    // Check same as billing
    fireEvent.click(screen.getByText('Same as billing address'));

    // Verify shipping address is copied
    expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument();
  });
});
```

## 🚀 Migration Guide

Khi thêm form mới:

1. **Tạo Zod schema** trong `utils/schema.util.ts`
2. **Tạo form hook** trong `hooks/[module]/use[Module]Form.tsx`
3. **Tạo form component** trong `pages/[Module]/[Module]Form/`
4. **Sử dụng reusable components** như AddressForm, ImageUpload
5. **Add i18n translations** cho labels và messages
6. **Test form validation** và submit flow
