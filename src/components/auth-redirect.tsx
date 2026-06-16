import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { getAuthTokens, getAuthUser } from "@/utils/auth.util";
import Loading from "@/components/layout/loading";

export function AuthRedirect() {
	const navigate = useNavigate();
	const location = useLocation();
	const { isAuthenticated } = useAuthStore();

	useEffect(() => {
		// Check authentication from localStorage and store
		const tokens = getAuthTokens();
		const storedUser = getAuthUser();

		if (tokens && storedUser) {
			if (location.pathname === "/") {
				navigate("/dashboard", { replace: true });
			}
		} else {
			// User is not authenticated, redirect to login
			navigate("/login", { replace: true });
		}
	}, [navigate, location.pathname, isAuthenticated]);

	// Show loading while redirecting
	return (
		<div className="min-h-screen flex items-center justify-center">
			<Loading />
		</div>
	);
}
