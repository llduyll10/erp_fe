// Helper to filter out falsy values
export const removeFalsyValues = <T extends Record<string, unknown>>(
	obj: T
): Record<string, unknown> =>
	Object.fromEntries(
		Object.entries(obj).filter(
			([, value]) =>
				value !== null && value !== undefined && value !== "" && value !== false
		)
	);

// Helper function to convert empty string to undefined
export const emptyToUndefined = <T extends string>(
	value: T | ""
): T | undefined => {
	return value === "" ? undefined : value;
};

// Helper function to check if a value exists (not null and not undefined)
export const valueExists = (value: number | null | undefined): boolean =>
	value !== null && value !== undefined;

/**
 * Check if any value in an object is non-empty.
 * @param obj Object to check
 * @param keysToCheck List of keys to check (optional)
 * @returns true if any value is non-empty, false otherwise
 */
export function checkObjectHasValue(
	obj: Record<string, unknown>,
	keysToCheck?: string[]
): boolean {
	if (!obj) return false;
	const keys = keysToCheck ?? Object.keys(obj);
	return keys.some((key) => {
		const value = obj[key];
		if (!(key in obj)) return false;
		if (value === null || value === undefined) return false;
		if (typeof value === "string" && value.trim() === "") return false;
		if (
			typeof value === "object" &&
			value !== null &&
			!Array.isArray(value) &&
			Object.keys(value).length === 0
		) {
			return false;
		}
		return true;
	});
}
