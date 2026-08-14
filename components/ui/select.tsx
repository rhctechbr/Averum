import { useId, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Select({ className, label, id, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  const generatedId = useId(); const selectId = id ?? generatedId;
  const field = <select id={selectId}
      className={cn("min-h-11 w-full rounded-md border bg-surface px-3 text-sm", className)}
      {...props} />;
  return label ? <label htmlFor={selectId} className="block text-sm font-medium">{label}<span className="mt-2 block">{field}</span></label> : field;
}
