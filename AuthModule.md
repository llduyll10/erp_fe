Here is the fully updated and consolidated AuthModule.md in English based on your current architecture, tech stack, and practices:

---

# 📘 Auth Module Guide

This document outlines the complete authentication flow and technical implementation based on the latest architecture.

---

## 📦 Tech Stack

- React + Vite + TypeScript
- TailwindCSS
- shadcn/ui (Radix UI)
- TanStack Query v5 (Query & Mutation services)
- Zustand (global auth state)
- React Router DOM
- Axios (with interceptors)
- Sonner (toast notifications)
- framer-motion (optional animation)
- zod (form validation – uses snake_case fields)
- clsx, date-fns (utility libraries)

---

## ✅ Functional Scope

Implement a full authentication module integrated with backend APIs.

### 🔐 Backend Auth API

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

- JWT payload:

  ```ts
  {
    user_id: string,
    company_id: string,
    role: string
  }
  ```

---

## 🧱 Folder Structure (Authentication Related)

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
│   └── auth.ts
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

## ⚙ Auth State (Zustand)

Path: src/states/auth.ts

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

✅ On completion:

✔ Auth store implemented

---

## 🛠 Services (TanStack Query)

Path: src/services/auth/

- useLoginMutation
- useRegisterCompanyMutation
- useRefreshTokenQuery

Usage pattern:

```ts
const loginMutation = useLoginMutation();
await loginMutation.mutateAsync({ email, password });
```

✅ On completion:

✔ Auth service implemented

---

## 🧾 Pages & Forms

Routes and layout:

- /login → pages/login/index.tsx + organisms/LoginForm.tsx
- /register → pages/register/index.tsx + organisms/RegisterForm.tsx
- /dashboard → Protected page (accessible only after login)

Requirements:

- Validate forms using zod (snake_case fields)
- UI built with shadcn/ui
- Use Sonner for toast messages
- Optional animations with framer-motion

✅ On completion:

✔ Login/Register/Dashboard page implemented

---

## 🔐 ProtectedRoute

Path: routes/ProtectedRoute.tsx

Logic:

- If not authenticated → redirect to /login
- If authenticated and accessing /login → redirect to /dashboard

✅ On completion:

✔ Protected route logic implemented

---

## 🔑 JWT Handling

- Store access_token and refresh_token in Zustand (optional persistence)
- Axios interceptor attaches Authorization: Bearer token
- On 401 response → clear session and redirect to login

✅ On completion:

✔ JWT token handling implemented

---

## 🎨 UI Consistency

- Follow component patterns: atoms → molecules → organisms
- Use shadcn/ui’s <Button /> and others consistently
- Handle loading, disabled, and variant props properly
- Stick to design system (padding, radius, colors, etc.)

✅ On completion:

✔ Form UI + validation implemented

---

## 🧪 Bonus Features

- Dark mode support
- Logout button in dashboard layout
- Page transitions using framer-motion

✅ If implemented:

✔ Bonus: Dark mode / Logout / Transitions implemented

---
