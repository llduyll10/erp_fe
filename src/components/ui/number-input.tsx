import * as React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export interface NumberInputProps
	extends Omit<
		React.InputHTMLAttributes<HTMLInputElement>,
		"onChange" | "value"
	> {
	value?: number;
	onChange?: (value: number | undefined) => void;
	max?: number;
	min?: number;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
	({ className, onChange, value, ...props }, ref) => {
		// Handle string to number conversion
		const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
			const value = event.target.value;

			if (value === "") {
				onChange?.(undefined);
				return;
			}

			const number = parseFloat(value);
			if (!isNaN(number)) {
				// Check min/max constraints
				if (props.max !== undefined && number > props.max) {
					onChange?.(props.max);
					return;
				}
				if (props.min !== undefined && number < props.min) {
					onChange?.(props.min);
					return;
				}
				onChange?.(number);
			}
		};

		return (
			<Input
				{...props}
				type="number"
				ref={ref}
				value={value ?? ""}
				onChange={handleChange}
				className={cn("font-mono", className)}
			/>
		);
	}
);

NumberInput.displayName = "NumberInput";

export { NumberInput };
