import { Outlet } from "react-router-dom";
import { LanguageSwitcher } from "@/components/language-switcher";

export function AuthLayout() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 relative">
			<div className="absolute top-4 right-4">
				<LanguageSwitcher />
			</div>
			<Outlet />
		</div>
	);
}
