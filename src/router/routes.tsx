import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '@/layouts/main-layout'
import { LoginPage } from '@/pages/login'
import { DashboardPage } from '@/pages/dashboard'
import { ProductsPage } from '@/pages/products'
import { ProtectedRoute } from './protected-route'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: '/',
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          {
            path: '/products',
            element: <ProductsPage />,
          },
        ],
      },
    ],
  },
]) 