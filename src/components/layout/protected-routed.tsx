import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ERROR_CODES } from "@/constants/error.constant";
import { getAuthTokens, getAuthUser } from "@/utils/auth.util";
import { UserRoleEnum } from "@/enums/user.enums";
import { hasMinimumRole } from "@/constants/user.constant";

interface ProtectedRouteProps {
	children: React.ReactNode;
	allowedTypes?: UserRoleEnum[];
	allowedRoles?: UserRoleEnum[];
	minimumRole?: UserRoleEnum;
	redirectTo?: string;
}

export function ProtectedRoute({
	children,
	allowedTypes,
	allowedRoles,
	minimumRole,
	redirectTo = "/login",
}: ProtectedRouteProps) {
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		// Check authentication from localStorage
		const tokens = getAuthTokens();
		const storedUser = getAuthUser();

		if (!tokens || !storedUser) {
			navigate(redirectTo);
			return;
		}

		// Check if user must change password
		if (
			storedUser.must_change_password &&
			location.pathname !== "/change-password"
		) {
			navigate("/change-password", {
				state: {
					returnTo: location.pathname,
				},
			});
			return;
		}

		// Check user role/permissions
		const userRole = storedUser.role as UserRoleEnum;
		
		// Check specific allowed types
		if (allowedTypes && !allowedTypes.includes(userRole)) {
			throw new Error(ERROR_CODES.FORBIDDEN);
		}

		// Check specific allowed roles
		if (allowedRoles && !allowedRoles.includes(userRole)) {
			throw new Error(ERROR_CODES.FORBIDDEN);
		}

		// Check minimum role requirement
		if (minimumRole && !hasMinimumRole(userRole, minimumRole)) {
			throw new Error(ERROR_CODES.FORBIDDEN);
		}
	}, [navigate, redirectTo, allowedTypes, allowedRoles, minimumRole, location.pathname]);

	return <>{children}</>;
}
