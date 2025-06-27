import { useTranslation } from "react-i18next";
import { supportedLngs } from "@/i18n";

export interface Language {
	code: string;
	name: string;
	flag: string;
}

export const languages: Language[] = [
	{
		code: "vi",
		name: "Tiếng Việt",
		flag: "🇻🇳",
	},
	{
		code: "en",
		name: "English",
		flag: "🇬🇧",
	},
];

export const useLanguage = () => {
	const { i18n } = useTranslation();

	const currentLanguage =
		languages.find((lang) => lang.code === i18n.language) || languages[0];

	const changeLanguage = async (code: string) => {
		if (supportedLngs.includes(code)) {
			await i18n.changeLanguage(code);
			// Optionally store the language preference
			localStorage.setItem("i18nextLng", code);
		}
	};

	return {
		currentLanguage,
		languages,
		changeLanguage,
	};
};
