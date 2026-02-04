export default function DailyProgress({ tasks = [] }) {
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'done' || t.status === 'closed').length;
  const remaining = total - done;
  const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

  const getMessage = () => {
    if (total === 0) return "No tasks scheduled for today.";
    if (done === total) return "Amazing! You've completed all tasks!";
    if (percentage >= 75) return "Almost there! Keep going!";
    if (percentage >= 50) return "Great progress! You're halfway done.";
    if (percentage >= 25) return "Good start! Keep the momentum.";
    return `${remaining} more task${remaining !== 1 ? 's' : ''} to go.`;
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-green-400">trending_up</span>
        <h3 className="text-white font-semibold">Daily Progress</h3>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-slate-400 text-sm">Completion</span>
          <span className="text-white font-semibold">{done} of {total} done</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-green-400 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Message */}
      <p className="text-slate-400 text-sm">
        {getMessage()}
      </p>
    </div>
  );
}
