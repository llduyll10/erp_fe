import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ERROR_CODES } from "@/constants/error.constant";
import { getAuthTokens, getAuthUser, clearAuth } from "@/utils/auth.util";
import { UserRoleEnum } from "@/enums/user.enums";
import { hasMinimumRole } from "@/constants/user.constant";
import { useAuthStore } from "@/stores/auth.store";
import Loading from "@/components/layout/loading";

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
	const { login, logout } = useAuthStore();
	const [isChecking, setIsChecking] = useState(true);

	useEffect(() => {
		const checkAuth = async () => {
			setIsChecking(true);

			try {
				// Check authentication from localStorage
				const tokens = getAuthTokens();
				const storedUser = getAuthUser();

				if (!tokens || !storedUser) {
					// Clear any stale data and redirect
					clearAuth();
					logout();
					navigate(redirectTo, {
						state: { from: location.pathname },
						replace: true,
					});
					return;
				}

				// Sync localStorage data with store
				login(
					{
						access_token: tokens.access_token,
						refresh_token: tokens.refresh_token,
					},
					storedUser
				);

				// Check if user must change password
				if (
					storedUser.must_change_password &&
					location.pathname !== "/change-password"
				) {
					navigate("/change-password", {
						state: {
							returnTo: location.pathname,
						},
						replace: true,
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
			} catch (error) {
				console.error("Auth check failed:", error);
				clearAuth();
				logout();
				navigate(redirectTo, {
					state: { from: location.pathname },
					replace: true,
				});
			} finally {
				setIsChecking(false);
			}
		};

		checkAuth();
	}, [
		navigate,
		redirectTo,
		allowedTypes,
		allowedRoles,
		minimumRole,
		location.pathname,
		login,
		logout,
	]);

	if (isChecking) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loading />
			</div>
		);
	}

	return <>{children}</>;
}
