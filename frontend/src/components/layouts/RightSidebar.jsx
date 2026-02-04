import QuickNote from '../widgets/QuickNote';
import DailyProgress from '../widgets/DailyProgress';

export default function RightSidebar({ tasks = [] }) {
  return (
    <aside className="w-72 h-screen bg-slate-900/50 border-l border-slate-800 p-4 overflow-y-auto">
      <div className="space-y-4">
        <QuickNote />
        <DailyProgress tasks={tasks} />
      </div>
    </aside>
  );
}
