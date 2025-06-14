import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { ERROR_CODES } from "@/constants/error.constant";
import { getAuthTokens, getAuthUser } from "@/utils/auth.util";

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

	useEffect(() => {
		// Check authentication from localStorage
		const tokens = getAuthTokens();
		const storedUser = getAuthUser();

		if (!tokens || !storedUser) {
			navigate(redirectTo);
			return;
		}

		// Check user type
		const userType = storedUser.role;
		if (!allowedTypes.includes(userType)) {
			throw new Error(ERROR_CODES.FORBIDDEN);
		}

		// Check user role if specified
		if (allowedRoles && !allowedRoles.includes(userType)) {
			throw new Error(ERROR_CODES.FORBIDDEN);
		}
	}, [navigate, redirectTo, allowedTypes, allowedRoles]);

	return <>{children}</>;
}
