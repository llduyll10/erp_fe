import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { OptimizedImage } from "@/components/molecules/optimized-image";
import { ImageIcon } from "lucide-react";
import { useGetSettings, useUpdateCompanyInfo } from "@/services/company-settings";
import { FileUploadPurpose } from "@/enums/file.enum";

const schema = z.object({
  name:     z.string().min(1, "Vui lòng nhập tên công ty"),
  tax_code: z.string().optional(),
  phone:    z.string().optional(),
  address:  z.string().optional(),
  logo_url: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CompanySettingsPage() {
  const { data: settings, isLoading } = useGetSettings();
  const { mutate: save, isPending } = useUpdateCompanyInfo();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", tax_code: "", phone: "", address: "", logo_url: "" },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        name:     settings.name ?? "",
        tax_code: settings.tax_code ?? "",
        phone:    settings.phone ?? "",
        address:  settings.address ?? "",
        logo_url: settings.logo_url ?? "",
      });
    }
  }, [settings]);

  const onSubmit = (values: FormValues) => save(values);
  const logoKey = form.watch("logo_url");

  if (isLoading) return <div className="p-8 text-muted-foreground">Đang tải...</div>;

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Thông tin công ty</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Logo */}
          <Card>
            <CardHeader><CardTitle className="text-base">Logo công ty</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {logoKey && (
                <div className="w-40 h-40 rounded-lg border overflow-hidden bg-muted flex items-center justify-center">
                  <OptimizedImage
                    fileKey={logoKey}
                    alt="Logo"
                    className="w-full h-full object-contain"
                    showLoading
                    fallbackComponent={<ImageIcon size={28} className="text-muted-foreground" />}
                  />
                </div>
              )}
              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUpload
                        purpose={FileUploadPurpose.COMPANY_LOGO}
                        value={field.value}
                        onUploadComplete={(r) => field.onChange(r.fileKey)}
                        placeholder={logoKey ? "Thay logo khác" : "Tải logo lên"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Thông tin pháp lý */}
          <Card>
            <CardHeader><CardTitle className="text-base">Thông tin pháp lý</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Tên công ty</FormLabel>
                    <FormControl>
                      <Input placeholder="CÔNG TY TNHH ..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tax_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã số thuế</FormLabel>
                    <FormControl>
                      <Input placeholder="0319173127" className="max-w-xs font-mono" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Liên hệ */}
          <Card>
            <CardHeader><CardTitle className="text-base">Liên hệ & Địa chỉ</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input placeholder="0901234567" className="max-w-xs" {...field} />
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
                      <Textarea placeholder="Số nhà, đường, phường, quận, tỉnh/thành phố" rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
