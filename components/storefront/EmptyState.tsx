import type { ReactNode } from "react";

export default function EmptyState({
  message,
  icon,
  action,
}: {
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-card border border-dashed border-line bg-white/60 px-6 py-14 text-center">
      {icon && <div className="text-4xl">{icon}</div>}
      <p className="max-w-xs text-sm leading-relaxed text-ink-2">{message}</p>
      {action}
    </div>
  );
}
