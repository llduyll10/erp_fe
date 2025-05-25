import { Header } from "@/components/layout/header";

export function LoginPage() {
	return (
		<div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
			<Header />
			
			<main className="flex flex-1 items-center justify-center px-4 py-8">
				<div className="w-full max-w-md space-y-8">
					<div className="text-center">
						<h2 className="text-3xl font-bold tracking-tight">
							Welcome back
						</h2>
						<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
							Please sign in to your account
						</p>
					</div>

					{/* Login form will go here */}
					<div className="mt-8 rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
						<p className="text-center text-gray-500">Login form coming soon...</p>
					</div>
				</div>
			</main>
		</div>
	);
} 