export default function TaskItem({ task, onToggle, onTaskClick, isCarriedOver }) {
  const isDone = task.status === 'done';

  const formatTime = (time) => {
    if (!time) return null;
    const date = new Date(time);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getTimeDisplay = () => {
    if (task.start_time && task.end_time) {
      return `${formatTime(task.start_time)} - ${formatTime(task.end_time)}`;
    }
    if (task.start_time) {
      return formatTime(task.start_time);
    }
    return task.description;
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onToggle(task.id, isDone ? 'backlog' : 'done');
  };

  return (
    <div
      className="flex items-center gap-4 bg-background-dark px-4 min-h-[72px] py-2 justify-between border-b border-slate-800/50 cursor-pointer hover:bg-slate-800/30 transition-colors"
      onClick={() => onTaskClick && onTaskClick(task)}
    >
      <div className="flex items-center gap-4">
        <div className="flex size-7 items-center justify-center" onClick={handleCheckboxClick}>
          <input
            type="checkbox"
            checked={isDone}
            onChange={() => {}}
            className="h-6 w-6 rounded border-[#324467] border-2 bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-0 focus:ring-offset-0 focus:border-primary focus:outline-none transition-all cursor-pointer"
          />
        </div>
        <div className="flex flex-col justify-center">
          <p className={`text-base font-medium leading-normal line-clamp-1 ${isDone ? 'text-slate-500 line-through' : 'text-white'}`}>
            {task.title}
          </p>
          <p className={`text-sm font-normal leading-normal line-clamp-2 ${isDone ? 'text-slate-600' : 'text-[#92a4c9]'}`}>
            {getTimeDisplay()}
          </p>
        </div>
      </div>
      <div className="shrink-0">
        {isCarriedOver ? (
          <div className="text-orange-500 flex size-7 items-center justify-center">
            <span className="material-symbols-outlined">history</span>
          </div>
        ) : isDone ? (
          <div className="text-slate-600 flex size-7 items-center justify-center">
            <span className="material-symbols-outlined">done_all</span>
          </div>
        ) : task.remind ? (
          <div className="text-primary flex size-7 items-center justify-center">
            <span className="material-symbols-outlined">schedule</span>
          </div>
        ) : task.priority === 'high' ? (
          <div className="text-red-500 flex size-7 items-center justify-center">
            <span className="material-symbols-outlined text-sm">priority_high</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
