export interface User {
	id: string;
	email: string;
	name: string;
	avatar?: string;
}

export interface ApiResponse<T> {
	data?: T;
	error?: string;
}

export type ActionResponse<T> = Promise<ApiResponse<T>>;
