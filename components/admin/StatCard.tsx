export default function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card-surface p-4">
      <p className="text-xs text-ink-2/70">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-ink">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-ink-2/50">{hint}</p>}
    </div>
  );
}
