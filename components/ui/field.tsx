import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  help?: string;
  required?: boolean;
  children: ReactNode;
}

export function Field({ children, help, label, required }: FieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-[var(--foreground)]">
        {label}
        {required ? <span className="ml-1 text-[var(--accent)]">*</span> : null}
      </span>
      {children}
      {help ? <span className="text-xs leading-5 text-[var(--muted-foreground)]">{help}</span> : null}
    </label>
  );
}
