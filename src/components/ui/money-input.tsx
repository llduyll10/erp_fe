import { NumericFormat } from "react-number-format";
import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

interface MoneyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "type"> {
  value?: number | string;
  onChange?: (value: number) => void;
}

export function MoneyInput({ className, value, onChange, onBlur, placeholder = "0", ...props }: MoneyInputProps) {
  return (
    <NumericFormat
      {...props}
      value={value === 0 ? "" : value}
      onValueChange={(values) => onChange?.(values.floatValue ?? 0)}
      onBlur={onBlur as any}
      placeholder={placeholder}
      thousandSeparator="."
      decimalSeparator=","
      decimalScale={0}
      allowNegative={false}
      valueIsNumericString={false}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "text-right tabular-nums",
        className,
      )}
    />
  );
}
