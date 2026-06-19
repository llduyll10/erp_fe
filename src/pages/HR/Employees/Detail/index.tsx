import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
	Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
	ArrowLeft, Upload, Trash2, FileText, User, CreditCard,
	Phone, Building2, Calendar, Save,
} from "lucide-react";
import { OptimizedImage } from "@/components/molecules/optimized-image";
import {
	useGetEmployee, useUpdateEmployee, useAddEmployeeDocument, useDeleteEmployeeDocument,
} from "@/services/hr";
import { uploadFile } from "@/services/file";
import type { EmployeeDocumentType } from "@/models/employee.model";
import { toast } from "sonner";

const DOC_TYPE_LABELS: Record<EmployeeDocumentType, string> = {
	id_card: "CCCD / CMND",
	contract: "Hợp đồng lao động",
	degree: "Bằng cấp / Học vấn",
	certificate: "Chứng chỉ",
	other: "Khác",
};

const infoSchema = z.object({
	name: z.string().min(1, "Bắt buộc"),
	phone: z.string().optional(),
	joined_at: z.string().optional(),
	status: z.enum(["active", "inactive"]),
	// Cá nhân
	id_number: z.string().optional(),
	id_issued_date: z.string().optional(),
	id_issued_place: z.string().optional(),
	birth_date: z.string().optional(),
	address: z.string().optional(),
	// Ngân hàng
	bank_account: z.string().optional(),
	bank_name: z.string().optional(),
	// Khẩn cấp
	emergency_contact: z.string().optional(),
	emergency_phone: z.string().optional(),
	notes: z.string().optional(),
});

function AddDocumentDialog({ employeeId }: { employeeId: string }) {
	const [open, setOpen] = useState(false);
	const [uploading, setUploading] = useState(false);
	const { mutate: addDoc } = useAddEmployeeDocument(employeeId);
	const [form, setForm] = useState({ type: "other" as EmployeeDocumentType, name: "" });

	const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file || !form.name) { toast.error("Nhập tên tài liệu trước"); return; }
		setUploading(true);
		try {
			const result = await uploadFile(file, "document" as any);
			addDoc({ type: form.type, name: form.name, file_key: result.fileKey },
				{ onSuccess: () => { setOpen(false); setForm({ type: "other", name: "" }); } });
		} catch { toast.error("Upload thất bại"); }
		finally { setUploading(false); e.target.value = ""; }
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm"><Upload size={13} className="mr-1" /> Thêm tài liệu</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader><DialogTitle>Upload tài liệu</DialogTitle></DialogHeader>
				<div className="space-y-3 mt-2">
					<div>
						<label className="text-sm font-medium">Loại tài liệu</label>
						<Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as EmployeeDocumentType }))}>
							<SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
							<SelectContent>
								{Object.entries(DOC_TYPE_LABELS).map(([k, v]) => (
									<SelectItem key={k} value={k}>{v}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div>
						<label className="text-sm font-medium">Tên tài liệu</label>
						<Input className="mt-1" placeholder="VD: CCCD mặt trước"
							value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
					</div>
					<div>
						<label className="text-sm font-medium">Chọn file</label>
						<Input className="mt-1" type="file" disabled={uploading || !form.name}
							onChange={handleUpload} />
						{!form.name && <p className="text-xs text-muted-foreground mt-1">Nhập tên tài liệu trước</p>}
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>Đóng</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function EmployeeDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { data: emp, isLoading } = useGetEmployee(id!);
	const { mutate: update, isPending } = useUpdateEmployee();
	const { mutate: deleteDoc } = useDeleteEmployeeDocument(id!);

	const [avatarUploading, setAvatarUploading] = useState(false);

	const form = useForm<z.infer<typeof infoSchema>>({
		resolver: zodResolver(infoSchema),
		defaultValues: { name: "", phone: "", status: "active" },
	});

	useEffect(() => {
		if (!emp) return;
		form.reset({
			name: emp.name ?? "",
			phone: emp.phone ?? "",
			joined_at: emp.joined_at?.split("T")[0] ?? "",
			status: emp.status,
			id_number: emp.id_number ?? "",
			id_issued_date: emp.id_issued_date?.split("T")[0] ?? "",
			id_issued_place: emp.id_issued_place ?? "",
			birth_date: emp.birth_date?.split("T")[0] ?? "",
			address: emp.address ?? "",
			bank_account: emp.bank_account ?? "",
			bank_name: emp.bank_name ?? "",
			emergency_contact: emp.emergency_contact ?? "",
			emergency_phone: emp.emergency_phone ?? "",
			notes: emp.notes ?? "",
		});
	}, [emp]);

	const onSave = (data: z.infer<typeof infoSchema>) => {
		update({ id: id!, data }, { onSuccess: () => toast.success("Đã lưu thông tin") });
	};

	const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setAvatarUploading(true);
		try {
			const result = await uploadFile(file, "avatar" as any);
			update({ id: id!, data: { avatar_key: result.fileKey } },
				{ onSuccess: () => toast.success("Đã cập nhật avatar") });
		} catch { toast.error("Upload avatar thất bại"); }
		finally { setAvatarUploading(false); e.target.value = ""; }
	};

	if (isLoading || !emp) return <div className="p-8 text-muted-foreground">Đang tải...</div>;

	const docs = emp.documents ?? [];

	return (
		<div className="p-8 max-w-4xl space-y-6">
			{/* Header */}
			<div className="flex items-center gap-3">
				<Button variant="outline" size="sm" onClick={() => navigate(-1)}>
					<ArrowLeft size={14} className="mr-1" /> Quay lại
				</Button>
				<h1 className="text-2xl font-bold">{emp.name}</h1>
				<Badge variant={emp.status === "active" ? "default" : "secondary"}>
					{emp.status === "active" ? "Đang làm" : "Nghỉ việc"}
				</Badge>
				{emp.department && (
					<Badge variant="outline">{emp.department.name}</Badge>
				)}
			</div>

			<Tabs defaultValue="info">
				<TabsList>
					<TabsTrigger value="info"><User size={13} className="mr-1" />Thông tin</TabsTrigger>
					<TabsTrigger value="personal"><CreditCard size={13} className="mr-1" />Cá nhân & Ngân hàng</TabsTrigger>
					<TabsTrigger value="docs"><FileText size={13} className="mr-1" />Tài liệu ({docs.length})</TabsTrigger>
				</TabsList>

				{/* ── Tab 1: Thông tin cơ bản + Avatar ── */}
				<TabsContent value="info">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								{/* Avatar */}
								<Card>
									<CardHeader><CardTitle className="text-sm">Ảnh đại diện</CardTitle></CardHeader>
									<CardContent className="flex flex-col items-center gap-3">
										<div className="w-28 h-28 rounded-full overflow-hidden bg-muted flex items-center justify-center border">
											{emp.avatar_key ? (
												<OptimizedImage fileKey={emp.avatar_key}
													className="w-28 h-28 object-cover"
													fallbackComponent={<User size={40} className="text-muted-foreground" />} />
											) : (
												<User size={40} className="text-muted-foreground" />
											)}
										</div>
										<label className="cursor-pointer">
											<input type="file" accept="image/*" className="hidden"
												disabled={avatarUploading} onChange={handleAvatarUpload} />
											<Button type="button" variant="outline" size="sm" disabled={avatarUploading}
												onClick={(e) => { e.preventDefault(); (e.currentTarget.previousElementSibling as HTMLInputElement)?.click(); }}>
												<Upload size={13} className="mr-1" />
												{avatarUploading ? "Đang tải..." : "Đổi ảnh"}
											</Button>
										</label>
									</CardContent>
								</Card>

								{/* Basic info */}
								<div className="md:col-span-2 space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<FormField control={form.control} name="name" render={({ field }) => (
											<FormItem><FormLabel>Họ tên *</FormLabel>
												<FormControl><Input {...field} /></FormControl><FormMessage />
											</FormItem>)} />
										<FormField control={form.control} name="phone" render={({ field }) => (
											<FormItem><FormLabel>Số điện thoại</FormLabel>
												<FormControl><Input {...field} /></FormControl><FormMessage />
											</FormItem>)} />
									</div>
									<div className="grid grid-cols-2 gap-4">
										<FormField control={form.control} name="joined_at" render={({ field }) => (
											<FormItem><FormLabel><Calendar size={12} className="inline mr-1" />Ngày vào làm</FormLabel>
												<FormControl><Input type="date" {...field} /></FormControl><FormMessage />
											</FormItem>)} />
										<FormField control={form.control} name="status" render={({ field }) => (
											<FormItem><FormLabel>Trạng thái</FormLabel>
												<Select value={field.value} onValueChange={field.onChange}>
													<SelectTrigger><SelectValue /></SelectTrigger>
													<SelectContent>
														<SelectItem value="active">Đang làm</SelectItem>
														<SelectItem value="inactive">Nghỉ việc</SelectItem>
													</SelectContent>
												</Select><FormMessage />
											</FormItem>)} />
									</div>
									<FormField control={form.control} name="notes" render={({ field }) => (
										<FormItem><FormLabel>Ghi chú</FormLabel>
											<FormControl><Textarea rows={2} placeholder="Ghi chú về nhân viên..." {...field} /></FormControl>
											<FormMessage />
										</FormItem>)} />
								</div>
							</div>

							<Button type="submit" disabled={isPending}>
								<Save size={14} className="mr-1" /> {isPending ? "Đang lưu..." : "Lưu thông tin"}
							</Button>
						</form>
					</Form>
				</TabsContent>

				{/* ── Tab 2: Cá nhân & Ngân hàng ── */}
				<TabsContent value="personal">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
							<Card>
								<CardHeader><CardTitle className="text-sm flex items-center gap-2"><CreditCard size={14} />Giấy tờ tuỳ thân</CardTitle></CardHeader>
								<CardContent className="grid grid-cols-2 gap-4">
									<FormField control={form.control} name="id_number" render={({ field }) => (
										<FormItem><FormLabel>Số CCCD / CMND</FormLabel>
											<FormControl><Input placeholder="012345678901" {...field} /></FormControl><FormMessage />
										</FormItem>)} />
									<FormField control={form.control} name="birth_date" render={({ field }) => (
										<FormItem><FormLabel>Ngày sinh</FormLabel>
											<FormControl><Input type="date" {...field} /></FormControl><FormMessage />
										</FormItem>)} />
									<FormField control={form.control} name="id_issued_date" render={({ field }) => (
										<FormItem><FormLabel>Ngày cấp</FormLabel>
											<FormControl><Input type="date" {...field} /></FormControl><FormMessage />
										</FormItem>)} />
									<FormField control={form.control} name="id_issued_place" render={({ field }) => (
										<FormItem><FormLabel>Nơi cấp</FormLabel>
											<FormControl><Input placeholder="Cục CS ĐKQL cư trú..." {...field} /></FormControl><FormMessage />
										</FormItem>)} />
									<div className="col-span-2">
										<FormField control={form.control} name="address" render={({ field }) => (
											<FormItem><FormLabel>Địa chỉ thường trú</FormLabel>
												<FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage />
											</FormItem>)} />
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader><CardTitle className="text-sm flex items-center gap-2"><Building2 size={14} />Tài khoản ngân hàng</CardTitle></CardHeader>
								<CardContent className="grid grid-cols-2 gap-4">
									<FormField control={form.control} name="bank_account" render={({ field }) => (
										<FormItem><FormLabel>Số tài khoản</FormLabel>
											<FormControl><Input placeholder="0123456789" {...field} /></FormControl><FormMessage />
										</FormItem>)} />
									<FormField control={form.control} name="bank_name" render={({ field }) => (
										<FormItem><FormLabel>Ngân hàng</FormLabel>
											<FormControl><Input placeholder="Vietcombank, BIDV..." {...field} /></FormControl><FormMessage />
										</FormItem>)} />
								</CardContent>
							</Card>

							<Card>
								<CardHeader><CardTitle className="text-sm flex items-center gap-2"><Phone size={14} />Liên hệ khẩn cấp</CardTitle></CardHeader>
								<CardContent className="grid grid-cols-2 gap-4">
									<FormField control={form.control} name="emergency_contact" render={({ field }) => (
										<FormItem><FormLabel>Người liên hệ</FormLabel>
											<FormControl><Input placeholder="Tên người thân" {...field} /></FormControl><FormMessage />
										</FormItem>)} />
									<FormField control={form.control} name="emergency_phone" render={({ field }) => (
										<FormItem><FormLabel>Số điện thoại</FormLabel>
											<FormControl><Input placeholder="0901..." {...field} /></FormControl><FormMessage />
										</FormItem>)} />
								</CardContent>
							</Card>

							<Button type="submit" disabled={isPending}>
								<Save size={14} className="mr-1" /> {isPending ? "Đang lưu..." : "Lưu thông tin"}
							</Button>
						</form>
					</Form>
				</TabsContent>

				{/* ── Tab 3: Tài liệu ── */}
				<TabsContent value="docs">
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<p className="text-sm text-muted-foreground">Hợp đồng, CCCD, bằng cấp, chứng chỉ...</p>
							<AddDocumentDialog employeeId={id!} />
						</div>

						<div className="border rounded-lg">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Loại</TableHead>
										<TableHead>Tên tài liệu</TableHead>
										<TableHead>Người upload</TableHead>
										<TableHead>Ngày upload</TableHead>
										<TableHead className="w-24">Thao tác</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{docs.length === 0 ? (
										<TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
											Chưa có tài liệu nào. Upload CCCD, hợp đồng lao động...
										</TableCell></TableRow>
									) : docs.map((doc) => (
										<TableRow key={doc.id}>
											<TableCell>
												<Badge variant="outline" className="text-xs">
													{DOC_TYPE_LABELS[doc.type] ?? doc.type}
												</Badge>
											</TableCell>
											<TableCell>
												<OptimizedImage fileKey={doc.file_key}
													className="hidden"
													fallbackComponent={
														<a href="#" className="text-sky-600 hover:underline text-sm flex items-center gap-1"
															onClick={(e) => { e.preventDefault(); /* will use presigned URL */ }}>
															<FileText size={13} /> {doc.name}
														</a>
													} />
												<span className="text-sm">{doc.name}</span>
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{doc.uploaded_by_user?.name ?? "—"}
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{new Date(doc.created_at).toLocaleDateString("vi-VN")}
											</TableCell>
											<TableCell>
												<Button variant="ghost" size="sm"
													className="text-red-500 hover:text-red-700"
													onClick={() => confirm(`Xóa tài liệu "${doc.name}"?`) && deleteDoc(doc.id)}>
													<Trash2 size={13} />
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
