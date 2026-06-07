export default function HealthScoreCard({ score, label }) {
  return (
    <div className="rounded-xl border border-white/5 bg-surface-200 p-6 text-center">
      <div className="text-5xl font-bold text-brand-400">{score ?? '--'}</div>
      <div className="mt-2 text-sm font-medium text-slate-300">{label ?? 'Loading...'}</div>
    </div>
  );
}
