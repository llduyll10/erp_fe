import { useMutation } from "@tanstack/react-query";
import { login } from "./request";

export const useLogin = () => {
	const mutation = useMutation({
		mutationFn: login,
	});

	return mutation;
};
