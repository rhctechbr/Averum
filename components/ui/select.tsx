import { useId, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string };

export function Select({ className, label, error, id, ...props }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = `${selectId}-error`;
  const field = <select
      id={selectId}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? errorId : props["aria-describedby"]}
      className={cn("min-h-11 w-full rounded-md border bg-surface px-3 text-sm", error && "border-negative focus-visible:outline-negative", className)}
      {...props} />;
  if (!label) return <>{field}{error && <p id={errorId} role="alert" className="mt-1 text-xs text-negative">{error}</p>}</>;
  return <div><label htmlFor={selectId} className="block text-sm font-medium">{label}</label><div className="mt-2">{field}</div>{error && <p id={errorId} role="alert" className="mt-1 text-xs text-negative">{error}</p>}</div>;
}
