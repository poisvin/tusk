export default function ProgressCard({ completed, total }) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="p-4">
      <div className="bg-primary/20 rounded-xl p-5 border border-primary/20">
        <div className="flex flex-col gap-3">
          <div className="flex gap-6 justify-between items-center">
            <p className="text-white text-base font-semibold">Daily Progress</p>
            <p className="text-primary text-sm font-bold">{completed}/{total}</p>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-[#92a4c9] text-xs font-medium uppercase tracking-wider">
            {percentage}% of tasks completed
          </p>
        </div>
      </div>
    </section>
  );
}
