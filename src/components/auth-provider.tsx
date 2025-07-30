import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { getAuthTokens, getAuthUser } from "@/utils/auth.util";

interface AuthProviderProps {
	children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const { login, logout } = useAuthStore();

	useEffect(() => {
		// Sync auth state from localStorage on app startup
		const tokens = getAuthTokens();
		const storedUser = getAuthUser();

		if (tokens && storedUser) {
			// User data exists in localStorage, sync with store
			login(
				{
					access_token: tokens.access_token,
					refresh_token: tokens.refresh_token,
				},
				storedUser
			);
		} else {
			// No user data, ensure store is clear
			logout();
		}
	}, [login, logout]);

	return <>{children}</>;
}
