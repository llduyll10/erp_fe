import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

export const defaultNS = "common";
export const fallbackLng = "vi";
export const supportedLngs = ["vi", "en"];

i18n
	.use(Backend)
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		supportedLngs,
		fallbackLng,
		defaultNS,
		ns: ["common", "errors", "company", "product", "customer"],
		backend: {
			loadPath: "/locales/{{lng}}/{{ns}}.json",
		},
		detection: {
			order: ["localStorage", "navigator"],
			caches: ["localStorage"],
		},
		interpolation: {
			escapeValue: false,
		},
	});

export default i18n;
