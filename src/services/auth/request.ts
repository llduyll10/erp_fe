import type { LoginRequest } from "../../interfaces/auth.interface";
import type { AuthResponse } from "@/interfaces/auth.interface";
import { request } from "../../utils/request.util";

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
	return await request({
		url: "/auth/login",
		method: "POST",
		data,
	});
};
