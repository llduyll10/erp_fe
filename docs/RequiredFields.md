# Required Fields Documentation

## 🎯 Overview

This document explains how required field indicators (red asterisks) are implemented in the ERP application forms.

## ✨ Enhanced FormLabel Component

The `FormLabel` component has been enhanced to automatically display a red asterisk (*) for required fields.

### Implementation

```tsx
// src/components/ui/form.tsx
interface FormLabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {
  required?: boolean;
}

function FormLabel({
  className,
  required,
  children,
  ...props
}: FormLabelProps) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </Label>
  )
}
```

## 📝 Usage Examples

### Required Field

```tsx
<FormField
  control={form.control}
  name="firstName"
  render={({ field }) => (
    <FormItem>
      <FormLabel required>First Name</FormLabel>
      <FormControl>
        <Input {...field} placeholder="Enter first name" />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Result**: `First Name *` (with red asterisk)

### Optional Field

```tsx
<FormField
  control={form.control}
  name="middleName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Middle Name</FormLabel>
      <FormControl>
        <Input {...field} placeholder="Enter middle name (optional)" />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Result**: `Middle Name` (no asterisk)

## 🔧 Schema Integration

### Required Schema Functions

Use these utility functions to create required field validations:

```tsx
import {
  createRequiredInputSchema,
  createRequiredEmailSchema,
  createRequiredPhoneNumberSchema,
  createRequiredNumberSchema,
  createRequiredEnumSchema,
} from "@/utils/schema.util";

const FormSchema = z.object({
  // Required fields
  firstName: createRequiredInputSchema("First Name"),
  email: createRequiredEmailSchema(),
  phone: createRequiredPhoneNumberSchema("Phone Number"),
  age: createRequiredNumberSchema("Age"),
  status: createRequiredEnumSchema(StatusEnum, "Status"),
  
  // Optional fields
  middleName: createOptionalInputSchema(),
  company: createOptionalInputSchema(),
});
```

### Form Implementation

```tsx
// Required field - use required prop
<FormField
  control={form.control}
  name="firstName"
  render={({ field }) => (
    <FormItem>
      <FormLabel required>First Name</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

// Optional field - no required prop
<FormField
  control={form.control}
  name="middleName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Middle Name</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

## 🎨 Visual Design

### Red Asterisk Styling

- **Color**: `text-red-500` (Tailwind red-500)
- **Spacing**: `ml-1` (0.25rem left margin)
- **Position**: After the label text
- **Font**: Inherits from parent label

### Example Visual Output

```
✅ First Name *     (required - shows red asterisk)
✅ Last Name *      (required - shows red asterisk)
✅ Email *          (required - shows red asterisk)
✅ Middle Name      (optional - no asterisk)
✅ Company          (optional - no asterisk)
```

## 📋 Best Practices

### 1. Consistency Rules

- ✅ **ALWAYS** use `required` prop on FormLabel for required fields
- ❌ **NEVER** manually add asterisks to label text
- ✅ Use schema utility functions for validation
- ✅ Ensure FormLabel `required` prop matches schema definition

### 2. Correct Implementation

```tsx
// ✅ CORRECT
<FormLabel required>Customer Name</FormLabel>

// ❌ INCORRECT
<FormLabel>Customer Name *</FormLabel>
```

### 3. Schema Alignment

```tsx
// Schema: Required field
firstName: createRequiredInputSchema("First Name"),

// Form: Use required prop
<FormLabel required>First Name</FormLabel>

// Schema: Optional field  
middleName: createOptionalInputSchema(),

// Form: No required prop
<FormLabel>Middle Name</FormLabel>
```

## 🔄 Migration from Manual Asterisks

### Before (Manual Asterisks)

```tsx
// Old way - manual asterisks in text
<FormLabel>{t("products.name")} *</FormLabel>
<FormLabel>{t("customer")} *</FormLabel>
<FormLabel>{t("phoneNumber")} *</FormLabel>
```

### After (Automatic Asterisks)

```tsx
// New way - using required prop
<FormLabel required>{t("products.name")}</FormLabel>
<FormLabel required>{t("customer")}</FormLabel>
<FormLabel required>{t("phoneNumber")}</FormLabel>
```

### Migration Steps

1. Remove manual `*` from label text
2. Add `required` prop to FormLabel for required fields
3. Ensure schema uses appropriate required/optional functions
4. Test visual output

## 🧪 Testing

### Example Test Component

```tsx
// src/components/examples/FormRequiredFieldExample.tsx
export function FormRequiredFieldExample() {
  const form = useForm({
    resolver: zodResolver(ExampleFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      middleName: "",
    },
  });

  return (
    <Form {...form}>
      <form className="space-y-4">
        {/* Required fields - show asterisks */}
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>First Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Optional fields - no asterisks */}
        <FormField
          control={form.control}
          name="middleName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Middle Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

## 🚨 Common Mistakes

### 1. Manual Asterisk in Text

```tsx
// ❌ DON'T DO THIS
<FormLabel required>Customer Name *</FormLabel>
// Result: "Customer Name * *" (double asterisk)
```

### 2. Missing Required Prop

```tsx
// ❌ INCORRECT - required field without required prop
// Schema: createRequiredInputSchema("Name")
<FormLabel>Customer Name</FormLabel>
// Result: No asterisk shown for required field
```

### 3. Wrong Required Prop

```tsx
// ❌ INCORRECT - optional field with required prop
// Schema: createOptionalInputSchema()
<FormLabel required>Middle Name</FormLabel>
// Result: Asterisk shown for optional field
```

## 📱 Responsive Behavior

The asterisk styling is responsive and works across all device sizes:

- **Desktop**: Clear red asterisk with proper spacing
- **Mobile**: Asterisk maintains visibility and spacing
- **Accessibility**: Screen readers will announce the asterisk

## 🎯 Benefits

1. **Consistency**: All required fields have the same visual indicator
2. **Maintainability**: Centralized styling and behavior
3. **Accessibility**: Proper semantic markup
4. **Developer Experience**: Simple prop-based API
5. **No Duplication**: Eliminates manual asterisk placement
6. **Type Safety**: TypeScript support for required prop

## 🔮 Future Enhancements

Potential future improvements:

1. **Automatic Detection**: Auto-detect required fields from schema
2. **Custom Indicators**: Support different indicators besides asterisk
3. **Theme Support**: Customizable colors and styles
4. **Animation**: Subtle animation for required field indicators
5. **Internationalization**: Support for different cultural indicators