import axios, { type AxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { getAuthTokens, clearAuth } from "./auth.util";
import i18next from "i18next";

export const backendDomain = import.meta.env.VITE_API_URL;
export const baseApiURL = backendDomain + "/api/v1";

export const axiosInstance = axios.create({
	timeout: 30000, // 30 seconds timeout
});

axiosInstance.defaults.withCredentials = true;

axiosInstance.interceptors.request.use(async function (config) {
	config.baseURL = baseApiURL;
	config.headers["Accept"] = "application/json";

	// Add auth token to header if exists
	const tokens = getAuthTokens();
	if (tokens?.access_token) {
		config.headers["Authorization"] =
			`${tokens.token_type} ${tokens.access_token}`;
	}

	return config;
});

axiosInstance.interceptors.response.use(
	(response) => response,
	async (error) => {
		const status = error.response?.status;
		const statusCode = String(status);

		// Handle timeout error specifically
		if (error.code === "ECONNABORTED" && error.message.includes("timeout")) {
			toast.error("Something went wrong. Please try again later.");
			return Promise.reject(error);
		}

		const errorMessage =
			error.response?.data?.message ?
				i18next.t(`errors:server_errors.${error.response?.data?.message}`)
			:	i18next.t(`errors:server_errors.common.internal_server_error`);

		switch (statusCode) {
			case "401":
				clearAuth(); // Clear auth data on unauthorized
				toast.error("Unauthorized. Please login again.");
				break;
			default:
				toast.error(errorMessage);
				break;
		}
		return Promise.reject(error);
	}
);

export const request = async (options: AxiosRequestConfig) => {
	try {
		const res = await axiosInstance(options);
		return res?.data;
	} catch (error) {
		console.log("request error: ", error);
		throw error;
	}
};
