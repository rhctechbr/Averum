import { useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Input({ className, label, id, ...props }: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const generatedId = useId(); const inputId = id ?? generatedId;
  const field = <input id={inputId}
      className={cn(
        "min-h-11 w-full rounded-md border bg-surface px-3 text-sm text-foreground placeholder:text-muted/70 disabled:opacity-60",
        className,
      )}
      {...props} />;
  return label ? <label htmlFor={inputId} className="block text-sm font-medium">{label}<span className="mt-2 block">{field}</span></label> : field;
}
