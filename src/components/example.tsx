import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { LanguageSwitcher } from "./language-switcher";

export const Example = () => {
	const { t } = useTranslation();

	return (
		<div className="p-4">
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-2xl font-bold">{t("common.welcome")}</h1>
				<LanguageSwitcher />
			</div>

			<div className="space-y-4">
				<Button onClick={() => alert(t("common.success"))}>
					{t("common.submit")}
				</Button>

				{/* Example of using translation with variables */}
				<p className="text-red-500">
					{t("validation.minLength", { field: t("common.password"), min: 8 })}
				</p>
			</div>
		</div>
	);
};
