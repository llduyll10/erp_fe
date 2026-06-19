import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
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
	useGetListCategory,
	useCreateCategory,
	useUpdateCategory,
	useDeleteCategory,
} from "@/services/category";
import type { Category } from "@/models/category.model";

const createSchema = z.object({
	name: z.string().min(1, "Bắt buộc"),
	code: z.string().optional(),
	description: z.string().optional(),
});

const editSchema = z.object({
	name: z.string().min(1, "Bắt buộc"),
	code: z.string().optional(),
	description: z.string().optional(),
});

function CreateCategoryDialog() {
	const [open, setOpen] = useState(false);
	const { mutate: create, isPending } = useCreateCategory();
	const form = useForm({
		resolver: zodResolver(createSchema),
		defaultValues: { name: "", code: "", description: "" },
	});

	const onSubmit = (data: z.infer<typeof createSchema>) => {
		create(data, {
			onSuccess: () => {
				setOpen(false);
				form.reset();
			},
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm">
					<Plus size={14} className="mr-1" /> Thêm danh mục
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Tạo danh mục mới</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 mt-2">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Tên danh mục</FormLabel>
									<FormControl>
										<Input {...field} placeholder="VD: Áo thể thao" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="code"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Mã danh mục (tùy chọn)</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder="VD: AO-TT"
											onChange={(e) => field.onChange(e.target.value.toUpperCase())}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Mô tả</FormLabel>
									<FormControl>
										<Textarea rows={2} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setOpen(false)}>
								Hủy
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending ? "Đang lưu..." : "Tạo"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

function EditCategoryDialog({ category }: { category: Category }) {
	const [open, setOpen] = useState(false);
	const { mutate: update, isPending } = useUpdateCategory();
	const form = useForm({
		resolver: zodResolver(editSchema),
		defaultValues: {
			name: category.name,
			code: category.code ?? "",
			description: category.description ?? "",
		},
	});

	const onSubmit = (data: z.infer<typeof editSchema>) => {
		update({ id: category.id, data }, { onSuccess: () => setOpen(false) });
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="sm">
					<Pencil size={14} />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Chỉnh sửa danh mục</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 mt-2">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Tên danh mục</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="code"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Mã danh mục</FormLabel>
									<FormControl>
										<Input
											{...field}
											onChange={(e) => field.onChange(e.target.value.toUpperCase())}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Mô tả</FormLabel>
									<FormControl>
										<Textarea rows={2} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setOpen(false)}>
								Hủy
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending ? "Đang lưu..." : "Lưu"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export function CategoriesPage() {
	const [q, setQ] = useState("");
	const [search, setSearch] = useState("");
	const { data, isLoading, refetch } = useGetListCategory({ q: search || undefined, limit: 100 });
	const { mutate: deleteCategory } = useDeleteCategory();
	const categories = data?.data ?? [];

	return (
		<div className="flex flex-col gap-6 p-8">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Danh mục sản phẩm</h1>
				<div className="flex gap-2">
					<Button variant="outline" size="sm" onClick={() => refetch()}>
						<RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
					</Button>
					<CreateCategoryDialog />
				</div>
			</div>

			<div className="flex gap-2 max-w-sm">
				<div className="relative flex-1">
					<Search
						size={14}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						className="pl-8"
						placeholder="Tìm danh mục..."
						value={q}
						onChange={(e) => setQ(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && setSearch(q)}
					/>
				</div>
				<Button size="sm" onClick={() => setSearch(q)}>
					Tìm
				</Button>
			</div>

			<div className="border rounded-lg">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Tên danh mục</TableHead>
							<TableHead>Mã</TableHead>
							<TableHead>Mô tả</TableHead>
							<TableHead className="w-24">Thao tác</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
									Đang tải...
								</TableCell>
							</TableRow>
						) : categories.length === 0 ? (
							<TableRow>
								<TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
									Chưa có danh mục nào. Nhấn "Thêm danh mục" để tạo mới.
								</TableCell>
							</TableRow>
						) : (
							categories.map((cat) => (
								<TableRow key={cat.id}>
									<TableCell className="font-medium">{cat.name}</TableCell>
									<TableCell className="text-sm text-muted-foreground">
										{cat.code ?? "—"}
									</TableCell>
									<TableCell className="text-sm text-muted-foreground">
										{cat.description ?? "—"}
									</TableCell>
									<TableCell>
										<div className="flex gap-1">
											<EditCategoryDialog category={cat} />
											<Button
												variant="ghost"
												size="sm"
												className="text-red-500 hover:text-red-700"
												onClick={() =>
													confirm(`Xóa danh mục "${cat.name}"?`) &&
													deleteCategory(cat.id)
												}>
												<Trash2 size={14} />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
