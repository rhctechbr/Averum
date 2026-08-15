import { useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string };

export function Input({ className, label, error, id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const field = <input
      id={inputId}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? errorId : props["aria-describedby"]}
      className={cn(
        "min-h-11 w-full rounded-md border bg-surface px-3 text-sm text-foreground placeholder:text-muted/70 disabled:opacity-60",
        error && "border-negative focus-visible:outline-negative",
        className,
      )}
      {...props} />;
  if (!label) return <>{field}{error && <p id={errorId} role="alert" className="mt-1 text-xs text-negative">{error}</p>}</>;
  return <div><label htmlFor={inputId} className="block text-sm font-medium">{label}</label><div className="mt-2">{field}</div>{error && <p id={errorId} role="alert" className="mt-1 text-xs text-negative">{error}</p>}</div>;
}
