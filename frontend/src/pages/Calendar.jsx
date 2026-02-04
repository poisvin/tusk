import { useState, useEffect } from 'react';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfMonth, endOfMonth, isToday } from 'date-fns';
import Header from '../components/Header';
import FloatingAddButton from '../components/FloatingAddButton';
import TaskModal from '../components/TaskModal';
import { tasksApi } from '../api/tasks';
import { tagsApi } from '../api/tags';

const PRIORITY_STYLES = {
  high: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'HIGH' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', label: 'MEDIUM' },
  low: { bg: 'bg-slate-500/10', text: 'text-slate-400', label: 'LOW' },
};

export default function Calendar() {
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [tags, setTags] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    loadTasks();
    loadTags();
  }, [selectedDate]);

  const loadTasks = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await tasksApi.getForDate(dateStr);
      const allTasks = [...(response.data.tasks || []), ...(response.data.carried_over || [])];
      setTasks(allTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const loadTags = async () => {
    try {
      const response = await tagsApi.getAll();
      setTags(response.data || []);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentMonth, { weekStartsOn: 0 });
    const end = endOfWeek(currentMonth, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  };

  const getMonthDays = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    // Pad start with previous month days
    const startPadding = start.getDay();
    const paddedDays = [];
    for (let i = startPadding - 1; i >= 0; i--) {
      paddedDays.push(subDays(start, i + 1));
    }

    return [...paddedDays, ...days];
  };

  const handlePrevious = () => {
    if (viewMode === 'week') {
      setCurrentMonth(subDays(currentMonth, 7));
    } else {
      setCurrentMonth(subMonths(currentMonth, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      setCurrentMonth(addDays(currentMonth, 7));
    } else {
      setCurrentMonth(addMonths(currentMonth, 1));
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleTaskClick = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      // Set scheduled_date to selected date if creating new task
      if (!editingTask) {
        taskData.scheduled_date = format(selectedDate, 'yyyy-MM-dd');
      }

      if (editingTask) {
        await tasksApi.update(editingTask.id, taskData);
      } else {
        await tasksApi.create(taskData);
      }
      setModalOpen(false);
      setEditingTask(null);
      loadTasks();
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await tasksApi.delete(id);
      setModalOpen(false);
      setEditingTask(null);
      loadTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    // Extract time portion directly to avoid timezone issues
    const timeMatch = time.match(/T(\d{2}):(\d{2})/);
    if (!timeMatch) return '';

    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${ampm}`;
  };

  const days = viewMode === 'week' ? getWeekDays() : getMonthDays();
  const remainingTasks = tasks.filter(t => t.status !== 'done').length;

  return (
    <>
      <Header
        title="Task Scheduler"
        leftIcon="calendar_month"
        onLeftIconClick={() => {
          const today = new Date();
          setSelectedDate(today);
          setCurrentMonth(today);
        }}
        rightAction={
          <button className="flex items-center justify-center text-white">
            <span className="material-symbols-outlined">search</span>
          </button>
        }
      />

      <main className="flex-1 pb-24">
        {/* View Mode Toggle */}
        <div className="flex px-4 py-3">
          <div className="flex h-10 flex-1 items-center justify-center rounded-lg bg-[#232f48] p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`flex h-full grow items-center justify-center rounded-lg px-2 text-sm font-medium transition-all ${
                viewMode === 'week'
                  ? 'bg-background-dark shadow text-white'
                  : 'text-[#92a4c9]'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`flex h-full grow items-center justify-center rounded-lg px-2 text-sm font-medium transition-all ${
                viewMode === 'month'
                  ? 'bg-background-dark shadow text-white'
                  : 'text-[#92a4c9]'
              }`}
            >
              Month
            </button>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between px-4 mb-2">
          <button
            onClick={handlePrevious}
            className="text-white flex size-10 items-center justify-center rounded-full hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <p className="text-white text-base font-bold">
            {format(currentMonth, 'MMMM yyyy')}
          </p>
          <button
            onClick={handleNext}
            className="text-white flex size-10 items-center justify-center rounded-full hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="px-4 pb-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-y-1 mb-2">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <p key={day} className="text-slate-500 text-[11px] font-bold tracking-wider flex h-8 items-center justify-center">
                {day}
              </p>
            ))}
          </div>

          {/* Date Cells */}
          <div className="grid grid-cols-7 gap-y-1">
            {days.map((day, index) => {
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(day)}
                  className={`h-10 w-full flex items-center justify-center text-sm font-medium transition-all ${
                    !isCurrentMonth
                      ? 'text-slate-600'
                      : isSelected
                      ? ''
                      : isTodayDate
                      ? 'text-primary'
                      : 'text-white'
                  }`}
                >
                  <div className={`flex size-8 items-center justify-center rounded-full ${
                    isSelected
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'hover:bg-slate-800'
                  }`}>
                    {format(day, 'd')}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Schedule Section */}
        <div className="px-4">
          <div className="flex items-center justify-between pb-2 pt-4">
            <h3 className="text-white text-lg font-bold">
              {isToday(selectedDate) ? "Today's Schedule" : format(selectedDate, 'MMM d') + "'s Schedule"}
            </h3>
            <span className="text-xs font-semibold text-primary px-2 py-1 bg-primary/10 rounded-full">
              {remainingTasks} Task{remainingTasks !== 1 ? 's' : ''} Remaining
            </span>
          </div>

          {/* Task Timeline */}
          <div className="space-y-3 pb-12">
            {tasks.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                <span className="material-symbols-outlined text-4xl mb-2 block">event_available</span>
                <p>No tasks scheduled</p>
              </div>
            ) : (
              tasks.map((task) => {
                const priority = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;
                const isDone = task.status === 'done';

                return (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className={`flex flex-col py-3 px-4 rounded-xl border shadow-sm cursor-pointer transition-all hover:border-slate-600 ${
                      isDone
                        ? 'bg-[#141b2b] border-dashed border-slate-800 opacity-60'
                        : 'bg-[#1a2333] border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className={`text-base font-bold ${isDone ? 'text-slate-400 line-through' : 'text-white'}`}>
                        {task.title}
                      </p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${priority.bg} ${priority.text}`}>
                        {priority.label}
                      </span>
                    </div>
                    {(task.start_time || isDone) && (
                      <p className={`text-sm mt-1 ${isDone ? 'text-slate-500' : 'text-[#92a4c9]'}`}>
                        {task.start_time && task.end_time
                          ? `${formatTime(task.start_time)} - ${formatTime(task.end_time)}`
                          : task.start_time
                          ? formatTime(task.start_time)
                          : 'Completed'}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      <FloatingAddButton onClick={handleAddTask} />

      <TaskModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        task={editingTask}
        tags={tags}
      />
    </>
  );
}
