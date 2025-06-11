import type {
	LoginRequest,
	LoginResponse,
} from "../../interfaces/auth.interface";
import { request } from "../../utils/request.util";

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
	return await request({
		url: "/auth/login",
		method: "POST",
		data,
	});
};
