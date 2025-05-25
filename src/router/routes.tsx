import { createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "@/layouts/auth-layout";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { ProtectedRoute } from "@/components/layout/protected-routed";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <div>Login</div>,
      },
      {
        path: "register",
        element: <div>Register</div>,
      },
    ],
  },
  {
    path: "/",
    element: (
      // <ProtectedRoute allowedTypes={["admin", "user"]}>
        <DashboardLayout />
      // </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <div>Dashboard</div>,
      },
      {
        path: "users",
        element: <div>Users</div>,
      },
      {
        path: "settings",
        element: <div>Settings</div>,
      },
    ],
  },
]); 