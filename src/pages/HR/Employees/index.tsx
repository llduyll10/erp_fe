import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, RefreshCw, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	useGetEmployees,
	useCreateEmployee,
	useUpdateEmployee,
	useDeleteEmployee,
} from "@/services/hr";
import { useGetDepartments } from "@/services/hr";
import type { Employee } from "@/models/employee.model";

const createSchema = z.object({
	name: z.string().min(1, "Bắt buộc"),
	department_id: z.string().optional(),
	phone: z.string().optional(),
	joined_at: z.string().optional(),
});

const editSchema = z.object({
	name: z.string().min(1, "Bắt buộc"),
	department_id: z.string().optional(),
	phone: z.string().optional(),
	status: z.enum(["active", "inactive"]),
});

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" }> = {
	active: { label: "Đang làm", variant: "default" },
	inactive: { label: "Nghỉ việc", variant: "secondary" },
};

const NO_DEPT = "__none__";

function DepartmentSelect({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
	const { data } = useGetDepartments({ limit: 100 });
	const depts = data?.data ?? [];
	return (
		<Select
			value={value || NO_DEPT}
			onValueChange={(v) => onChange(v === NO_DEPT ? "" : v)}>
			<SelectTrigger><SelectValue placeholder="Chọn phòng ban" /></SelectTrigger>
			<SelectContent>
				<SelectItem value={NO_DEPT}>-- Không có --</SelectItem>
				{depts.map((d) => (
					<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function CreateEmployeeDialog() {
	const [open, setOpen] = useState(false);
	const { mutate: create, isPending } = useCreateEmployee();
	const form = useForm({ resolver: zodResolver(createSchema), defaultValues: { name: "", department_id: "", phone: "", joined_at: "" } });

	const onSubmit = (data: z.infer<typeof createSchema>) => {
		const payload = { ...data };
		if (!payload.department_id) delete payload.department_id;
		if (!payload.joined_at) delete payload.joined_at;
		create(payload, { onSuccess: () => { setOpen(false); form.reset(); } });
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm"><Plus size={14} className="mr-1" /> Thêm nhân viên</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader><DialogTitle>Thêm nhân viên</DialogTitle></DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 mt-2">
						<FormField control={form.control} name="name" render={({ field }) => (
							<FormItem><FormLabel>Họ tên</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
						)} />
						<FormField control={form.control} name="department_id" render={({ field }) => (
							<FormItem><FormLabel>Phòng ban</FormLabel><FormControl><DepartmentSelect value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
						)} />
						<FormField control={form.control} name="phone" render={({ field }) => (
							<FormItem><FormLabel>Số điện thoại</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
						)} />
						<FormField control={form.control} name="joined_at" render={({ field }) => (
							<FormItem><FormLabel>Ngày vào làm</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
						)} />
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
							<Button type="submit" disabled={isPending}>{isPending ? "Đang lưu..." : "Thêm"}</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

function EditEmployeeDialog({ emp }: { emp: Employee }) {
	const [open, setOpen] = useState(false);
	const { mutate: update, isPending } = useUpdateEmployee();
	const form = useForm({
		resolver: zodResolver(editSchema),
		defaultValues: {
			name: emp.name,
			department_id: emp.department_id ?? "",
			phone: emp.phone ?? "",
			status: emp.status,
		},
	});

	const onSubmit = (data: z.infer<typeof editSchema>) => {
		const payload = { ...data } as Record<string, string | undefined>;
		if (!payload.department_id) delete payload.department_id;
		update({ id: emp.id, data: payload }, { onSuccess: () => setOpen(false) });
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="sm"><Pencil size={14} /></Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader><DialogTitle>Chỉnh sửa nhân viên</DialogTitle></DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 mt-2">
						<FormField control={form.control} name="name" render={({ field }) => (
							<FormItem><FormLabel>Họ tên</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
						)} />
						<FormField control={form.control} name="department_id" render={({ field }) => (
							<FormItem><FormLabel>Phòng ban</FormLabel><FormControl><DepartmentSelect value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
						)} />
						<FormField control={form.control} name="phone" render={({ field }) => (
							<FormItem><FormLabel>Số điện thoại</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
						)} />
						<FormField control={form.control} name="status" render={({ field }) => (
							<FormItem><FormLabel>Trạng thái</FormLabel>
								<Select value={field.value} onValueChange={field.onChange}>
									<SelectTrigger><SelectValue /></SelectTrigger>
									<SelectContent>
										<SelectItem value="active">Đang làm</SelectItem>
										<SelectItem value="inactive">Nghỉ việc</SelectItem>
									</SelectContent>
								</Select>
							<FormMessage /></FormItem>
						)} />
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
							<Button type="submit" disabled={isPending}>{isPending ? "Đang lưu..." : "Lưu"}</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export function EmployeesPage() {
	const [q, setQ] = useState("");
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("");
	const { data, isLoading, refetch } = useGetEmployees({ q: search, status: statusFilter || undefined });
	const { mutate: deleteEmp } = useDeleteEmployee();
	const employees = data?.data ?? [];

	return (
		<div className="flex flex-col gap-6 p-8">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Nhân viên</h1>
				<div className="flex gap-2">
					<Button variant="outline" size="sm" onClick={() => refetch()}>
						<RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
					</Button>
					<CreateEmployeeDialog />
				</div>
			</div>

			<div className="flex gap-2">
				<div className="relative flex-1 max-w-sm">
					<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
					<Input className="pl-8" placeholder="Tìm theo tên, SĐT..." value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setSearch(q)} />
				</div>
				<Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
					<SelectTrigger className="w-36"><SelectValue placeholder="Tất cả trạng thái" /></SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tất cả</SelectItem>
						<SelectItem value="active">Đang làm</SelectItem>
						<SelectItem value="inactive">Nghỉ việc</SelectItem>
					</SelectContent>
				</Select>
				<Button size="sm" onClick={() => setSearch(q)}>Tìm</Button>
			</div>

			<div className="border rounded-lg">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Họ tên</TableHead>
							<TableHead>Phòng ban</TableHead>
							<TableHead>Số điện thoại</TableHead>
							<TableHead>Trạng thái</TableHead>
							<TableHead>Ngày vào làm</TableHead>
							<TableHead className="w-24">Thao tác</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Đang tải...</TableCell></TableRow>
						) : employees.length === 0 ? (
							<TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Chưa có nhân viên nào</TableCell></TableRow>
						) : (
							employees.map((emp) => {
								const statusInfo = STATUS_LABELS[emp.status] ?? { label: emp.status, variant: "secondary" as const };
								return (
									<TableRow key={emp.id}>
										<TableCell className="font-medium">{emp.name}</TableCell>
										<TableCell>{emp.department?.name ?? <span className="text-muted-foreground">—</span>}</TableCell>
										<TableCell>{emp.phone ?? "—"}</TableCell>
										<TableCell>
											<Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
										</TableCell>
										<TableCell className="text-muted-foreground text-sm">
											{emp.joined_at ? new Date(emp.joined_at).toLocaleDateString("vi-VN") : "—"}
										</TableCell>
										<TableCell>
											<div className="flex gap-1">
												<EditEmployeeDialog emp={emp} />
												<Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => confirm(`Xóa nhân viên "${emp.name}"?`) && deleteEmp(emp.id)}>
													<Trash2 size={14} />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
