import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { ERROR_CODES } from "@/constants/error.constant";

interface ProtectedRouteProps {
	children: React.ReactNode;
	allowedTypes: string[];
	allowedRoles?: string[];
	redirectTo?: string;
}

export function ProtectedRoute({
	children,
	allowedTypes,
	allowedRoles,
	redirectTo = "/login",
}: ProtectedRouteProps) {
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuthStore();

	useEffect(() => {
		if (!isAuthenticated || !user) {
			navigate(redirectTo);
		}
	}, [isAuthenticated, user, navigate, redirectTo]);

	if (!isAuthenticated || !user) {
		return null;
	}

	// Check user type
	const userType = user.role; // Assuming role is used as type
	if (!allowedTypes.includes(userType)) {
		throw new Error(ERROR_CODES.FORBIDDEN);
	}

	// Check user role if specified
	if (allowedRoles && !allowedRoles.includes(userType)) {
		throw new Error(ERROR_CODES.FORBIDDEN);
	}

	return <>{children}</>;
} 