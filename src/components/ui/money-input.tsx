import * as React from "react";
import { cn } from "@/lib/utils";

interface MoneyInputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "type"> {
	value?: number | string;
	onChange?: (value: number) => void;
}

function formatVnd(raw: number | string | undefined): string {
	const num = typeof raw === "string" ? parseInt(raw.replace(/\D/g, ""), 10) : raw;
	if (!num && num !== 0) return "";
	return num.toLocaleString("vi-VN");
}

function parseVnd(display: string): number {
	const digits = display.replace(/\D/g, "");
	return digits === "" ? 0 : parseInt(digits, 10);
}

const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
	({ className, value, onChange, onBlur, placeholder = "0", ...props }, ref) => {
		const [display, setDisplay] = React.useState(() => formatVnd(value));

		// Sync when form resets / value changes externally
		React.useEffect(() => {
			setDisplay(formatVnd(value));
		}, [value]);

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const raw = e.target.value.replace(/\D/g, ""); // strip non-digits
			const num = raw === "" ? 0 : parseInt(raw, 10);
			setDisplay(raw === "" ? "" : num.toLocaleString("vi-VN"));
			onChange?.(num);
		};

		const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
			// Re-format on blur (e.g. user typed "1000" → show "1.000")
			const num = parseVnd(display);
			setDisplay(num === 0 && display === "" ? "" : num.toLocaleString("vi-VN"));
			onBlur?.(e);
		};

		return (
			<input
				{...props}
				ref={ref}
				type="text"
				inputMode="numeric"
				value={display}
				onChange={handleChange}
				onBlur={handleBlur}
				placeholder={placeholder}
				className={cn(
					"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
					"file:border-0 file:bg-transparent file:text-sm file:font-medium",
					"placeholder:text-muted-foreground",
					"focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
					"disabled:cursor-not-allowed disabled:opacity-50",
					"text-right tabular-nums",
					className,
				)}
			/>
		);
	},
);

MoneyInput.displayName = "MoneyInput";

export { MoneyInput };
