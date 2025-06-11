import { z } from "zod";
import {
	MAX_LENGTH_INPUT,
	MIN_LENGTH_INPUT,
} from "@/constants/common.constant";
import { getErrorTranslation } from "@/utils/translation.util";
import { EMAIL_REGEX, PHONE_NUMBER_REGEX } from "@/constants/regex.constant";

export const createRequiredInputSchema = (
	label?: string,
	maxLength: number = MAX_LENGTH_INPUT
) => {
	return z
		.string()
		.min(MIN_LENGTH_INPUT, {
			message: getErrorTranslation({
				key: "validation.required",
				options: {
					field: label,
				},
			}),
		})
		.max(maxLength, {
			message: getErrorTranslation({
				key: "validation.maxLength",
				options: {
					max: maxLength,
				},
			}),
		});
};

export const createRequiredEmailSchema = () => {
	return z
		.string()
		.max(MAX_LENGTH_INPUT, {
			message: getErrorTranslation({
				key: "validation.maxLength",
				options: {
					max: MAX_LENGTH_INPUT,
				},
			}),
		})
		.refine((val) => !val || EMAIL_REGEX.test(val), {
			message: getErrorTranslation({
				key: "validation.email",
			}),
		});
};

//use for switch, checkbox component
export const createRequiredBooleanSchema = (
	label?: string,
	defaultValue = false
) => {
	return z
		.boolean({
			required_error: getErrorTranslation({
				key: "validation.required",
				options: {
					field: label,
				},
			}),
		})
		.default(defaultValue);
};

export const createOptionalBooleanSchema = () => {
	return z.boolean().optional();
};

//use for boolean radio group
export const createRequiredBooleanForRadioGroup = (label: string) => {
	return z.boolean({
		required_error: getErrorTranslation({
			key: "validation.required",
			options: {
				field: label,
			},
		}),
	});
};

export const createOptionalInputSchema = (
	maxLength: number = MAX_LENGTH_INPUT
) => {
	return z
		.string()
		.max(maxLength, {
			message: getErrorTranslation({
				key: "validation.maxLength",
				options: {
					max: maxLength,
				},
			}),
		})
		.optional();
};

export const createOptionalNumberSchema = () => {
	return z.number().optional();
};

//use in dropdown/select/rardiogroup field that uses Enum
type EnumLike = { [k: string]: string | number; [nu: number]: string };
export const createRequiredEnumSchema = <T extends EnumLike>(
	enumType: T,
	label: string
) => {
	return z
		.nativeEnum(enumType, {
			required_error: getErrorTranslation({
				key: "validation.required",
				options: {
					field: label,
				},
			}),
		})
		.nullable();
};

//use in dropdown/select/rardiogroup field that uses Enum
export const createOptionalEnumSchema = <T extends EnumLike>(enumType: T) => {
	return z.nativeEnum(enumType).nullable().optional();
};

export const createRequiredNumberSchema = (label?: string) => {
	return z.number({
		required_error: getErrorTranslation({
			key: "validation.invalidFormat",
			options: {
				field: label,
			},
		}),
	});
};

export const createRequiredPhoneNumberSchema = (label?: string) => {
	return z
		.string({
			required_error: getErrorTranslation({
				key: "validation.required",
				options: {
					field: label,
				},
			}),
		})
		.regex(PHONE_NUMBER_REGEX, {
			message: getErrorTranslation({
				key: "validation.invalidFormat",
				options: {
					field: label,
				},
			}),
		});
};

export const createOptionalPhoneNumberSchema = () => {
	return z
		.string()
		.regex(PHONE_NUMBER_REGEX, {
			message: getErrorTranslation({
				key: "validation.invalidFormat",
			}),
		})
		.optional();
};
