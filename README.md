# SaaS ERP Frontend

## Tech Stack 🛠

- **Core:** React 18+, TypeScript, Vite
- **UI:** TailwindCSS, shadcn/ui
- **State:** Zustand, TanStack Query v5
- **Forms:** React Hook Form, Zod
- **Utils:** Axios, clsx, date-fns

## Project Structure 📁

```
src/
├── features/            # Feature-based modules
│   ├── auth/
│   │   ├── hooks/      # Feature hooks (main: use-auth.ts)
│   │   ├── components/ # Feature-specific components
│   │   ├── schemas/    # Zod schemas
│   │   └── types/      # TypeScript types
│   ├── users/
│   └── products/
│
├── components/          # Shared components
│   ├── ui/             # Base UI components
│   └── layout/         # Layout components
│
├── lib/                # Core utilities
│   ├── api/           # API client setup
│   └── utils/         # Helper functions
│
└── pages/             # Route components
```

## Feature Hook Pattern 🎣

Each feature is organized around a main hook that encapsulates all related functionality:

```typescript
// src/features/auth/hooks/use-auth.ts
export function useAuth() {
  // 1. Schemas
  const schemas = {
    login: z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }),
  };

  // 2. API Functions
  const api = {
    login: async (credentials: LoginCredentials) => {
      return axios.post("/auth/login", credentials);
    },
  };

  // 3. Mutations/Queries
  const loginMutation = useMutation({
    mutationFn: api.login,
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data.user);
    },
  });

  // 4. Form Hooks
  const useLoginForm = () => {
    const form = useForm({
      resolver: zodResolver(schemas.login),
    });

    const onSubmit = async (data) => {
      await loginMutation.mutateAsync(data);
    };

    return { form, onSubmit };
  };

  // 5. Public API
  return {
    useLoginForm,
    isAuthenticated: Boolean(queryClient.getQueryData(["user"])),
    user: queryClient.getQueryData(["user"]),
    login: loginMutation.mutate,
    logout: () => queryClient.removeQueries({ queryKey: ["user"] }),
  };
}

// Usage in components
function LoginForm() {
  const { useLoginForm } = useAuth();
  const { form, onSubmit } = useLoginForm();

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* ... */}</form>;
}
```

## Development Guidelines 📋

### TypeScript

- Strict mode enabled
- Full type coverage
- Interface over type
- Zod for validation

### Components

- Functional components
- RORO pattern
- Named exports
- Error boundaries

### State Management

- Zustand: UI state
- TanStack Query: Server state
- Persistent when needed

### API Integration

- Axios instance
- Type-safe responses
- Error handling
- Response caching

## Getting Started 🚀

```bash
# Install
yarn install

# Development
yarn dev

# Build
yarn build
```

## Environment Variables 🔧

```env
VITE_API_URL=your_api_url
VITE_APP_ENV=development
```

## Best Practices ✨

1. **Single Entry Point**

   ```typescript
   const { useLoginForm, isAuthenticated, logout } = useAuth();
   ```

2. **Type Safety**

   ```typescript
   interface AuthHookResult {
   	useLoginForm: () => LoginFormHook;
   	isAuthenticated: boolean;
   	user: User | null;
   	logout: () => void;
   }
   ```

3. **Error Handling**

   ```typescript
   try {
   	await mutation.mutateAsync(data);
   } catch (error) {
   	toast.error(getErrorMessage(error));
   }
   ```

4. **File Naming**
   - Hooks: `use-{feature}.ts`
   - Components: `{PascalCase}.tsx`
   - Types: `{feature}.types.ts`

## Key Features

- 🔐 **Authentication**

  - JWT-based auth flow
  - Protected routes
  - Persistent sessions
  - Role-based access

- 🎨 **UI/UX**

  - Responsive design
  - Dark/Light themes
  - Toast notifications
  - Loading states
  - Error boundaries

- 🔄 **Data Management**

  - Cached API requests
  - Optimistic updates
  - Offline support
  - Error handling

- 📱 **Performance**
  - Code splitting
  - Lazy loading
  - Asset optimization
  - Route pre-fetching

## Documentation

- Component documentation with Storybook
- API documentation with Swagger/OpenAPI
- Inline code comments
- README files per feature

## License

MIT

## Code Organization Guidelines

### Feature Hook Pattern

Each feature should be organized around a main hook that encapsulates all related functionality:

```
src/features/
└── auth/
    ├── hooks/
    │   └── use-auth.ts        # Main feature hook
    ├── api/
    │   └── auth.api.ts        # API functions
    ├── schemas/
    │   └── auth.schema.ts     # Zod schemas
    └── types/
        └── auth.types.ts      # Type definitions
```

### Main Feature Hook Example

```typescript
// src/features/auth/hooks/use-auth.ts
export function useAuth() {
  const queryClient = useQueryClient();

  // Schema
  const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password too short"),
  });

  // API Functions
  const loginApi = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await axios.post("/auth/login", credentials);
    return response.data;
  };

  // Mutation
  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data.user);
    },
  });

  // Form Hook
  const useLoginForm = () => {
    const form = useForm<LoginFormData>({
      resolver: zodResolver(loginSchema),
      defaultValues: {
        email: "",
        password: "",
      },
    });

    const onSubmit = async (data: LoginFormData) => {
      try {
        await loginMutation.mutateAsync(data);
        // Handle success
      } catch (error) {
        // Handle error
      }
    };

    return {
      form,
      isLoading: loginMutation.isPending,
      onSubmit,
    };
  };

  // Public API
  return {
    useLoginForm,
    isAuthenticated: Boolean(queryClient.getQueryData(["user"])),
    user: queryClient.getQueryData(["user"]),
    login: loginMutation.mutate,
    logout: () => {
      queryClient.removeQueries({ queryKey: ["user"] });
    },
  };
}

// Usage in components
function LoginForm() {
  const { useLoginForm } = useAuth();
  const { form, isLoading, onSubmit } = useLoginForm();

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### Feature Hook Best Practices

1. **Single Entry Point**

   ```typescript
   // All auth functionality accessed through useAuth
   const { useLoginForm, isAuthenticated, user, logout } = useAuth();
   ```

2. **Encapsulated Logic**

   ```typescript
   // Schema, API, and mutations defined within the hook
   export function useAuth() {
   	// Schemas
   	const schemas = {
   		/* ... */
   	};

   	// API Functions
   	const api = {
   		/* ... */
   	};

   	// Mutations
   	const mutations = {
   		/* ... */
   	};

   	// Sub-hooks
   	const useLoginForm = () => {
   		/* ... */
   	};

   	return {
   		/* public API */
   	};
   }
   ```

3. **Type Safety**

   ```typescript
   // src/features/auth/types/auth.types.ts
   export interface AuthHookResult {
   	useLoginForm: () => LoginFormHook;
   	isAuthenticated: boolean;
   	user: User | null;
   	login: (credentials: LoginCredentials) => Promise<void>;
   	logout: () => void;
   }
   ```

4. **Error Handling**

   ```typescript
   export function useAuth() {
   	const handleError = (error: unknown) => {
   		if (error instanceof AuthError) {
   			toast.error(error.message);
   		}
   		// Handle other errors
   	};

   	return {
   		// ... other exports
   		handleError,
   	};
   }
   ```

### Feature Organization

```
src/features/
├── auth/
│   └── hooks/
│       └── use-auth.ts      # All auth functionality
├── users/
│   └── hooks/
│       └── use-users.ts     # All user management
└── products/
    └── hooks/
        └── use-products.ts  # All product functionality
```

### Benefits

- Single source of truth for feature functionality
- Simplified imports and usage
- Better encapsulation
- Easier testing and maintenance
- Consistent error handling
- Type-safe public API

### File Naming Conventions

- Main Hook: `use-{feature}.ts`
- Types: `{feature}.types.ts`
- Components: `{PascalCase}.tsx`
