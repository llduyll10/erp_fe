import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	FormControl,
	Form,
	FormLabel,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInviteUserForm } from "@/hooks/user/useInviteUser";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { USER_ROLE_OPTIONS } from "@/constants/user.constant";

export function AddUserModal() {
	const { form, onSubmit, isPending, open, setOpen } = useInviteUserForm();

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className="w-fit">
					Add User
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<DialogHeader>
							<DialogTitle>Add User</DialogTitle>
							<DialogDescription>
								Add a new user to the system.
							</DialogDescription>
						</DialogHeader>
						<div className="flex items-center gap-2 mt-4">
							<div className="grid flex-1 gap-2">
								<Label htmlFor="link" className="sr-only">
									Link
								</Label>

								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								{/* Name */}
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Name</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								{/* Role */}
								<FormField
									control={form.control}
									name="role"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Role</FormLabel>
											<FormControl>
												<Select
													value={field.value}
													onValueChange={field.onChange}>
													<SelectTrigger>
														<SelectValue placeholder="Select a role" />
													</SelectTrigger>
													<SelectContent>
														{USER_ROLE_OPTIONS.map((option) => (
															<SelectItem
																key={option.value}
																value={option.value}>
																{option.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>
						<DialogFooter className="sm:justify-center mt-4">
							<DialogClose asChild>
								<Button type="button" variant="secondary">
									Close
								</Button>
							</DialogClose>
							<Button type="submit" disabled={isPending}>
								{isPending ? "Inviting..." : "Invite"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
