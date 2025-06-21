import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useInviteUserChangePasswordForm } from "@/hooks/user/useInviteUserChangePassword";

export function ChangePassword() {
	const { form, onSubmit, isPending } = useInviteUserChangePasswordForm();

	return (
		<div className="flex items-center justify-center min-h-screen bg-background">
			<Card className="w-full max-w-md p-6">
				<div className="space-y-6">
					<div className="space-y-2 text-center">
						<h1 className="text-2xl font-semibold tracking-tight">
							Change Password
						</h1>
						<p className="text-sm text-muted-foreground">
							Please set a new password for your account
						</p>
					</div>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<div className="space-y-2">
								<FormField
									control={form.control}
									name="new_password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>New Password</FormLabel>
											<FormControl>
												<Input
													type="password"
													placeholder="Enter your new password"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="space-y-2">
								<FormField
									control={form.control}
									name="confirm_password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Confirm Password</FormLabel>
											<FormControl>
												<Input
													type="password"
													placeholder="Confirm your new password"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<Button type="submit" className="w-full">
								Change Password
							</Button>
						</form>
					</Form>
				</div>
			</Card>
		</div>
	);
}
