const STATUS_STYLES = {
  backlog: { icon: 'inbox', color: 'text-slate-400' },
  in_progress: { icon: 'play_circle', color: 'text-blue-400' },
  partial: { icon: 'timelapse', color: 'text-orange-400' },
  done: { icon: 'check_circle', color: 'text-green-400' },
};

export default function TaskItem({ task, onToggle, onTaskClick, isCarriedOver }) {
  const isDone = task.status === 'done';

  const formatTime = (time) => {
    if (!time) return null;
    // Extract time portion and format it directly to avoid timezone issues
    // Time comes as "2026-02-03T20:13:00" - extract HH:mm
    const timeMatch = time.match(/T(\d{2}):(\d{2})/);
    if (!timeMatch) return null;

    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${ampm}`;
  };

  const getTimeDisplay = () => {
    if (task.start_time && task.end_time) {
      return `${formatTime(task.start_time)} - ${formatTime(task.end_time)}`;
    }
    if (task.start_time) {
      return formatTime(task.start_time);
    }
    return null;
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    // Cycle through statuses: backlog -> in_progress -> done
    // Or if done, go back to backlog
    if (isDone) {
      onToggle(task.id, 'backlog');
    } else {
      onToggle(task.id, 'done');
    }
  };

  const getStatusIcon = () => {
    if (isCarriedOver) {
      return (
        <div className="text-orange-500 flex size-7 items-center justify-center" title="Carried over">
          <span className="material-symbols-outlined">history</span>
        </div>
      );
    }

    const status = STATUS_STYLES[task.status] || STATUS_STYLES.backlog;
    return (
      <div className={`${status.color} flex size-7 items-center justify-center`} title={task.status.replace('_', ' ')}>
        <span className="material-symbols-outlined">{status.icon}</span>
      </div>
    );
  };

  return (
    <div
      className={`flex items-center gap-4 bg-background-dark px-4 min-h-[72px] py-2 justify-between border-b border-slate-800/50 cursor-pointer hover:bg-slate-800/30 transition-colors ${
        task.status === 'in_progress' ? 'border-l-2 border-l-blue-400' : ''
      } ${task.status === 'partial' ? 'border-l-2 border-l-orange-400' : ''}`}
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
          {getTimeDisplay() && (
            <p className={`text-sm font-normal leading-normal line-clamp-2 ${isDone ? 'text-slate-600' : 'text-[#92a4c9]'}`}>
              {getTimeDisplay()}
            </p>
          )}
        </div>
      </div>
      <div className="shrink-0">
        {getStatusIcon()}
      </div>
    </div>
  );
}
