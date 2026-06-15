import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetSettings, useUpdateCompanyInfo } from "@/services/company-settings";

const schema = z.object({
	phone: z.string().max(50).optional(),
	address: z.string().optional(),
	logo_url: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export function CompanySettingsPage() {
	const { data: settings, isLoading } = useGetSettings();
	const { mutate: save, isPending } = useUpdateCompanyInfo();

	const form = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: { phone: "", address: "", logo_url: "" },
	});

	useEffect(() => {
		if (settings) {
			form.reset({
				phone: settings.phone ?? "",
				address: settings.address ?? "",
				logo_url: settings.logo_url ?? "",
			});
		}
	}, [settings]);

	const onSubmit = (values: FormValues) => save(values);

	if (isLoading) return <div className="p-8">Đang tải...</div>;

	return (
		<div className="p-8 max-w-2xl">
			<h1 className="text-2xl font-bold mb-6">Thông tin công ty</h1>
			<Card>
				<CardHeader>
					<CardTitle>Cập nhật thông tin</CardTitle>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Số điện thoại</FormLabel>
										<FormControl>
											<Input placeholder="0901234567" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="address"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Địa chỉ</FormLabel>
										<FormControl>
											<Textarea placeholder="Địa chỉ công ty" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="logo_url"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Logo URL</FormLabel>
										<FormControl>
											<Input placeholder="https://..." {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" disabled={isPending}>
								{isPending ? "Đang lưu..." : "Lưu thay đổi"}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
