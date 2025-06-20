import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ERROR_CODES } from "@/constants/error.constant";
import { getAuthTokens, getAuthUser } from "@/utils/auth.util";
import { UserRoleEnum } from "@/enums/user.enums";

interface ProtectedRouteProps {
	children: React.ReactNode;
	allowedTypes: UserRoleEnum[];
	allowedRoles?: UserRoleEnum[];
	redirectTo?: string;
}

export function ProtectedRoute({
	children,
	allowedTypes,
	allowedRoles,
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

		// Check user type
		const userType = storedUser.role as UserRoleEnum;
		if (!allowedTypes.includes(userType)) {
			throw new Error(ERROR_CODES.FORBIDDEN);
		}

		// Check user role if specified
		if (allowedRoles && !allowedRoles.includes(userType)) {
			throw new Error(ERROR_CODES.FORBIDDEN);
		}
	}, [navigate, redirectTo, allowedTypes, allowedRoles, location.pathname]);

	return <>{children}</>;
}
