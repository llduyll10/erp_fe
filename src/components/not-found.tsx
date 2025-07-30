import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function NotFound() {
	const navigate = useNavigate();
	const { t } = useTranslation();

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="text-center">
				<h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
				<h2 className="text-2xl font-semibold text-gray-700 mb-4">
					{t("errors.page_not_found", "Trang không tìm thấy")}
				</h2>
				<p className="text-gray-600 mb-8">
					{t(
						"errors.page_not_found_description",
						"Trang bạn đang tìm kiếm không tồn tại."
					)}
				</p>
				<div className="space-x-4">
					<Button onClick={() => navigate(-1)} variant="outline">
						{t("common.go_back", "Quay lại")}
					</Button>
					<Button onClick={() => navigate("/dashboard/products")}>
						{t("common.go_to_dashboard", "Về trang chủ")}
					</Button>
				</div>
			</div>
		</div>
	);
}
