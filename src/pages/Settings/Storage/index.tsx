import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import {
	useGetSettings,
	useUpdateStorageSettings,
} from "@/services/company-settings";

const schema = z.object({
	s3_bucket: z.string().optional(),
	s3_region: z.string().optional(),
	s3_endpoint: z.string().optional(),
	s3_access_key: z.string().optional(),
	s3_secret_key: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function StorageSettingsPage() {
	const { data: settings, isLoading } = useGetSettings();
	const { mutate: save, isPending } = useUpdateStorageSettings();

	const form = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			s3_bucket: "",
			s3_region: "",
			s3_endpoint: "",
			s3_access_key: "",
			s3_secret_key: "",
		},
	});

	useEffect(() => {
		if (settings) {
			form.reset({
				s3_bucket: settings.s3_bucket ?? "",
				s3_region: settings.s3_region ?? "",
				s3_endpoint: settings.s3_endpoint ?? "",
				s3_access_key: settings.s3_access_key ?? "",
				s3_secret_key: "",
			});
		}
	}, [settings]);

	const onSubmit = (values: FormValues) => {
		const payload = { ...values };
		if (!payload.s3_secret_key) delete payload.s3_secret_key;
		save(payload);
	};

	if (isLoading) return <div className="p-8">Đang tải...</div>;

	return (
		<div className="p-8 max-w-2xl">
			<h1 className="text-2xl font-bold mb-6">Cấu hình lưu trữ ảnh (S3/R2)</h1>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						Kết nối S3 / Cloudflare R2
						{settings?.has_s3_secret ? (
							<Badge variant="default" className="gap-1 text-xs">
								<CheckCircle2 size={12} /> Đã cấu hình
							</Badge>
						) : (
							<Badge variant="secondary" className="gap-1 text-xs">
								<XCircle size={12} /> Chưa cấu hình
							</Badge>
						)}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="s3_bucket"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Bucket</FormLabel>
										<FormControl>
											<Input placeholder="my-bucket" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="s3_region"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Region</FormLabel>
										<FormControl>
											<Input placeholder="ap-southeast-1" {...field} />
										</FormControl>
										<FormDescription>
											Với Cloudflare R2 dùng <code>auto</code>
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="s3_endpoint"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Endpoint (tuỳ chọn)</FormLabel>
										<FormControl>
											<Input
												placeholder="https://<account-id>.r2.cloudflarestorage.com"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Để trống nếu dùng AWS S3 tiêu chuẩn
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="s3_access_key"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Access Key ID</FormLabel>
										<FormControl>
											<Input placeholder="AKIAIOSFODNN7EXAMPLE" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="s3_secret_key"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Secret Access Key
											{settings?.has_s3_secret && (
												<span className="ml-2 text-xs text-muted-foreground font-normal">
													(để trống để giữ nguyên)
												</span>
											)}
										</FormLabel>
										<FormControl>
											<Input
												type="password"
												placeholder={
													settings?.has_s3_secret
														? "••••••••••••••••"
														: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
												}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" disabled={isPending}>
								{isPending ? "Đang lưu..." : "Lưu cấu hình"}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
