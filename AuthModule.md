### 📦 Tech Stack

- React + Vite + TypeScript
- TailwindCSS
- shadcn/ui (Radix UI)
- TanStack Query v5 (Query & Mutation services)
- Zustand (global auth state)
- React Router DOM
- Axios (interceptor, instance)
- Sonner (toast notifications)
- framer-motion (optional animation)
- zod (form validation – use snake_case fields)
- clsx, date-fns (utilities)

---

### ✅ Functional Scope

Implement a complete authentication flow that integrates with the backend AuthModule.

#### 🔐 Auth API (Backend)

- POST /auth/register

  ```ts
  {
    company_name: string,
    admin: {
      full_name: string,
      email: string,
      password: string
    }
  }
  ```

- POST /auth/login

  ```ts
  {
    email: string,
    password: string
  }
  ```

- JWT payload (from backend):

  ```ts
  {
    user_id: string,
    company_id: string,
    role: string
  }
  ```

---

### 🧱 Folder Structure (Auth Related)

```
src/
│
├── services/
│   └── auth/
│       ├── mutations/
│       │   ├── useLoginMutation.ts
│       │   └── useRegisterCompanyMutation.ts
│       └── queries/
│           └── useRefreshTokenQuery.ts
│
├── states/
│   └── auth.ts          # Zustand store for auth
│
├── pages/
│   ├── login/
│   │   └── index.tsx
│   ├── register/
│   │   └── index.tsx
│   └── dashboard/
│       └── index.tsx
│
├── components/
│   ├── atoms/
│   ├── molecules/
│   └── organisms/
│       ├── LoginForm.tsx
│       └── RegisterForm.tsx
│
├── hooks/
│   └── useAuth.ts
│
├── routes/
│   └── ProtectedRoute.tsx
```

---

### ⚙ Auth State (Zustand)

Path: `src/states/auth.ts`

```ts
type AuthState = {
  is_authenticated: boolean;
  access_token: string | null;
  refresh_token: string | null;
  user: {
    user_id: string;
    company_id: string;
    full_name: string;
    email: string;
    role: string;
  } | null;
  actions: {
    login: (...);
    logout: () => void;
    register_company: (...);
    refresh_token: (...);
    set_user: (...);
    clear_session: () => void;
  };
};
```

✅ Upon completion, update `AuthModuleCheckList.md` with:

```
✔ Auth store implemented
```

---

### 🛠 Service (TanStack)

Path: `src/services/auth/`

- useLoginMutation
- useRegisterCompanyMutation
- useRefreshTokenQuery

Pattern:

```ts
const loginMutation = useLoginMutation();
await loginMutation.mutateAsync({ email, password });
```

✅ Upon completion:

```
✔ Auth service implemented
```

---

### 🧾 Pages & Forms

- /login → `pages/login/index.tsx` + `organisms/LoginForm.tsx`
- /register → `pages/register/index.tsx` + `organisms/RegisterForm.tsx`
- /dashboard → Protected page

Use:

- zod for form validation (snake_case fields)
- shadcn/ui for UI components
- sonner for toast
- framer-motion for transitions (optional)

✅ Upon completion of each:

```
✔ Login/Register/Dashboard page implemented
```

---

### 🔐 ProtectedRoute

Path: `routes/ProtectedRoute.tsx`

- Redirect to `/login` if unauthenticated
- Redirect to `/dashboard` if authenticated and accessing `/login`

✅ Upon completion:

```
✔ Protected route logic implemented
```

---

### 🔑 JWT Handling

- Store access_token in Zustand (optionally persist)
- Axios interceptor to attach `Authorization: Bearer ...`
- On 401 response → clear state + redirect

✅ Upon completion:

```
✔ JWT token handling implemented
```

---

### 🎨 UI Consistency

- Follow design system docs
- Use atoms/molecules/organisms appropriately
- Use `<Button />` from `@components/atoms/Button`
- Handle `disabled`, `isLoading`, `variant` props consistently

✅ Upon completion:

```
✔ Form UI + validation implemented
```

---

### 🧪 Bonus Features

- Dark mode support
- Logout button
- Page transitions

✅ If added, append:

```
✔ Bonus: [item name] implemented
```

---
