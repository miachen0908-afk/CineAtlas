type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--border-soft)] bg-[var(--paper-translucent)] px-6 py-10 text-center shadow-[var(--panel-shadow)] backdrop-blur-sm">
      <div className="mb-3 text-2xl text-[var(--ocean)] opacity-70">✦</div>
      <p className="text-sm font-medium text-[var(--ink)]">{title}</p>
      {description && (
        <p className="mt-2 max-w-xs text-xs leading-relaxed text-[var(--ink-muted)]">
          {description}
        </p>
      )}
    </div>
  );
}
