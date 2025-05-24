# SaaS ERP Frontend

A modern React-based frontend for SaaS ERP applications built with best practices and a robust tech stack.

## Tech Stack

- 🚀 **Framework**: React 18+ with Vite and TypeScript
- 🎨 **Styling**: TailwindCSS + shadcn/ui (Radix UI)
- 🔄 **State Management**: Zustand + TanStack Query v5
- 🛣️ **Routing**: React Router DOM
- 🎭 **Animations**: Framer Motion
- 📝 **Forms**: React Hook Form + Zod
- 🔔 **Notifications**: Sonner
- 🎯 **Icons**: Lucide React

## Project Structure

```
src/
├── components/ # Reusable UI components
│   └── ui/     # Base UI components
├── features/   # Feature-based modules (auth, products)
├── hooks/      # Custom React hooks
├── lib/        # API clients, services, utils
├── layouts/    # Page layouts
├── pages/      # Route-level components
├── router/     # React Router config
├── stores/     # Zustand stores
└── types/      # TypeScript interfaces
```

## Getting Started

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build
```

## Development Guidelines

- TypeScript strict mode with full type coverage
- Functional components with RORO pattern
- Feature-based folder structure
- Lowercase with dashes for directories
- Named exports over default exports
- Error handling with Result<T, E> pattern

## Architecture

- 🔐 API responses modeled as { data, error }
- 🎨 TanStack Query for data fetching/caching
- 📱 Zustand for UI state management
- 🚦 Form validation with Zod
- 🔄 Graceful error handling with toasts
- 🎭 Framer Motion transitions

## Best Practices

- Type-safe development
- Modular architecture
- Consistent error boundaries
- Responsive design
- Skeleton loading states
- Lazy-loaded routes

## Key Features

- 🔐 Authentication system
- 🎨 Theme switching
- 📱 Responsive layout
- 🚦 Route protection
- 🔄 Data caching
- �� Page transitions
