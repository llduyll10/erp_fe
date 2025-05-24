import { Bell, Menu, Search, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "react-router-dom";

interface HeaderProps {
	onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
	const { pathname } = useLocation();
	const isLoginPage = pathname === "/login";

	return (
		<header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 dark:border-gray-700 dark:bg-gray-800 md:px-6">
			<div className="flex items-center gap-2">
				{!isLoginPage && (
					<Button
						variant="ghost"
						size="icon"
						className="md:hidden"
						onClick={onMenuClick}
					>
						<Menu className="h-6 w-6" />
					</Button>
				)}
				
				{!isLoginPage && (
					<div className="hidden items-center gap-2 md:flex">
						<Search className="h-4 w-4 text-gray-500" />
						<Input
							type="search"
							placeholder="Search..."
							className="w-[200px] bg-transparent"
						/>
					</div>
				)}
			</div>

			<div className="flex items-center gap-2">
				<Button variant="ghost" size="icon">
					<Sun className="h-5 w-5" />
				</Button>
				
				{!isLoginPage && (
					<>
						<Button variant="ghost" size="icon">
							<Bell className="h-5 w-5" />
						</Button>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon">
									<User className="h-5 w-5" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>My Account</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem>Profile</DropdownMenuItem>
								<DropdownMenuItem>Settings</DropdownMenuItem>
								<DropdownMenuItem className="text-red-600">
									Logout
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</>
				)}
			</div>
		</header>
	);
} 