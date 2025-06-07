import { Menu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserDropdown } from "./user-dropdown";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { LanguageSwitcher } from "../language-switcher";

export function Header() {
	const { open, setOpen } = useSidebar();

	return (
		<header className="w-full shrink-0 border-b border-border bg-background">
			<div className="flex h-14 items-center justify-between px-6">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setOpen(!open)}
						className="shrink-0">
						<Menu className="h-5 w-5 text-text-secondary" />
					</Button>

					<div className="bg-background text-foreground">
						<Button className="bg-primary text-primary-foreground">Test</Button>
					</div>

					<div className="flex items-center gap-2">
						<Search className="h-4 w-4 text-text-secondary" />
						<Input
							type="search"
							placeholder="Search or type command..."
							className="w-[300px] bg-transparent"
						/>
						<kbd className="pointer-events-none ml-3 hidden h-5 select-none items-center gap-1 rounded border bg-background-secondary px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
							<span className="text-xs">⌘</span>K
						</kbd>
					</div>
				</div>

				<div className="flex items-center gap-4">
					<LanguageSwitcher />
					<UserDropdown name="John Doe" email="john@example.com" />
				</div>
			</div>
		</header>
	);
}
