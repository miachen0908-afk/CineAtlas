type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-10 text-center backdrop-blur-sm">
      <div className="mb-3 text-2xl opacity-40">✦</div>
      <p className="text-sm font-medium text-white/80">{title}</p>
      {description && (
        <p className="mt-2 max-w-xs text-xs leading-relaxed text-white/45">
          {description}
        </p>
      )}
    </div>
  );
}
