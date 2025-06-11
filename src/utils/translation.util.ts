import i18next from "i18next";

interface TranslationParams {
	key: string;
	options?: Record<string, unknown>;
}

export const getTranslation = ({ key, options }: TranslationParams) => {
	return i18next.t(key, options);
};

export const getErrorTranslation = ({ key, options }: TranslationParams) => {
	return i18next.t(`common:${key}`, options);
};

export const t = (key: string) => getTranslation({ key });
