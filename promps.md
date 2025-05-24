Sure! Here’s the updated and optimized prompt to use in Cursor or any AI code assistant to auto-generate a complete React + Vite + Shadcn UI frontend project tailored for a SaaS ERP:

🛠️ Prompt (English):

Create a new frontend project template using the following stack and requirements.

Tech Stack:

- Framework: React 18+ with Vite and TypeScript
- Styling: TailwindCSS
- UI Components: shadcn/ui (based on Radix UI)
- Routing: react-router-dom
- State Management: Zustand
- Data Fetching: TanStack Query (v5)
- Animations: framer-motion
- Notifications: sonner (toast)
- Icons: lucide-react
- Utilities: clsx, date-fns

Project Structure (modular and scalable):

src/
├── components/ → Shared UI components (e.g., Button, Input, Dialog)
├── features/ → Feature-based modules (e.g., auth, products)
├── hooks/ → Custom React hooks
├── layouts/ → Page layouts (e.g., MainLayout with sidebar + topbar)
├── lib/ → API clients, helpers (e.g., axios.ts, cn.ts)
├── pages/ → Route-level components (React Router routes)
├── router/ → Route configuration
├── stores/ → Zustand stores (e.g., auth.ts)
├── types/ → Global TypeScript types (e.g., User, Product)
└── App.tsx

Project Requirements:

1. Setup TailwindCSS with PostCSS and default Tailwind theme.
2. Integrate shadcn/ui:

   - Add base components (Button, Input, Switch, Dialog, Sheet, etc.)
   - Theme should support dark/light toggle

3. Implement MainLayout:

   - Sidebar navigation (Dashboard, Products)
   - Topbar with user avatar, dark mode toggle, logout

4. Initial Routes (using react-router-dom):

   - /login (basic auth form)
   - /dashboard (empty placeholder)
   - /products (empty placeholder)

5. Auth State:

   - Zustand store to track isAuthenticated and user info
   - Redirect to /login if not authenticated

6. TanStack Query setup:

   - QueryClientProvider in root
   - Sample API hook in lib/api.ts (e.g., useUser)

7. Toast setup:

   - Add Toaster provider (sonner)
   - Show example success/error toast on login

8. Add basic light/dark mode toggle via shadcn Switch
9. Animations:

   - Page transitions using framer-motion

Bonus (if possible):

- Include configured tailwind.config.js and postcss.config.js
- Add Prettier + ESLint with tailwind/prettier plugin
- Add animated route transitions with framer-motion in App.tsx
- Setup absolute import aliases (e.g., @/components)

Deliverables:

✅ Fully functional Vite + React + TypeScript project
✅ Working routes with layout
✅ Zustand and TanStack Query initialized
✅ Login form with toast
✅ Responsive layout using Tailwind and Shadcn
