import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/models/user.model";

export interface AuthState {
	isAuthenticated: boolean;
	accessToken: string | null;
	refreshToken: string | null;
	user: User | null;
	login: (
		tokens: { access_token: string; refresh_token: string },
		user: User
	) => void;
	logout: () => void;
	setUser: (user: User) => void;
	clearSession: () => void;
	refreshTokens: (tokens: {
		access_token: string;
		refresh_token: string;
	}) => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			isAuthenticated: false,
			accessToken: null,
			refreshToken: null,
			user: null,

			login: ({ access_token, refresh_token }, user) =>
				set({
					isAuthenticated: true,
					accessToken: access_token,
					refreshToken: refresh_token,
					user,
				}),

			logout: () =>
				set({
					isAuthenticated: false,
					accessToken: null,
					refreshToken: null,
					user: null,
				}),

			setUser: (user) => set({ user }),

			clearSession: () =>
				set({
					isAuthenticated: false,
					accessToken: null,
					refreshToken: null,
					user: null,
				}),

			refreshTokens: ({ access_token, refresh_token }) =>
				set({
					accessToken: access_token,
					refreshToken: refresh_token,
				}),
		}),
		{
			name: "auth-storage",
		}
	)
);
