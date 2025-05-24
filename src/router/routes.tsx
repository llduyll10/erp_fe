import { createBrowserRouter, Navigate } from 'react-router-dom'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { UserRoleEnum } from '@/enums/user.enums'
import { MainLayout } from '@/layouts/main-layout'
import { LoginPage } from '@/pages/login'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute allowedTypes={[UserRoleEnum.ADMIN, UserRoleEnum.SALES]}>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <div>Dashboard</div>,
      },
      {
        path: 'products',
        element: <div>Products</div>,
      },
      {
        path: 'analytics',
        element: <div>Analytics</div>,
      },
      {
        path: 'users',
        element: <div>Users</div>,
      },
      {
        path: 'settings',
        element: <div>Settings</div>,
      },
    ],
  },
]) 