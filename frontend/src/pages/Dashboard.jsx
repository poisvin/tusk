import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import TaskItem from '../components/TaskItem';
import TaskModal from '../components/TaskModal';
import RightSidebar from '../components/layouts/RightSidebar';
import { tasksApi } from '../api/tasks';
import { tagsApi } from '../api/tags';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [carriedOver, setCarriedOver] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayFormatted = format(new Date(), 'EEEE, MMMM d');

  useEffect(() => {
    loadTasks();
    loadTags();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await tasksApi.getForDate(today);
      setTasks(response.data.tasks || []);
      setCarriedOver(response.data.carried_over || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
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

  const handleToggle = async (id, newStatus) => {
    try {
      await tasksApi.update(id, { status: newStatus });
      loadTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
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

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTask(null);
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

  const allTasks = [...tasks, ...carriedOver];
  const totalCount = allTasks.length;

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Today's Focus</h1>
          <p className="text-slate-400">
            {totalCount} task{totalCount !== 1 ? 's' : ''} scheduled for today
          </p>
        </div>

        {/* Carried Over Section */}
        {carriedOver.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-orange-400">history</span>
              <h2 className="text-lg font-semibold text-orange-400">Carried Over</h2>
              <span className="bg-orange-400/20 text-orange-400 text-xs px-2 py-0.5 rounded-full">
                {carriedOver.length}
              </span>
            </div>
            <div className="bg-slate-800/30 rounded-xl overflow-hidden border border-orange-400/20">
              {carriedOver.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onTaskClick={handleTaskClick}
                  isCarriedOver
                />
              ))}
            </div>
          </div>
        )}

        {/* Today's Schedule Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">calendar_today</span>
              <h2 className="text-lg font-semibold text-white">{todayFormatted}</h2>
            </div>
            <button
              onClick={handleAddTask}
              className="flex items-center gap-1.5 text-primary hover:text-blue-400 transition-colors text-sm font-medium"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Add task
            </button>
          </div>

          {tasks.length > 0 ? (
            <div className="bg-slate-800/30 rounded-xl overflow-hidden border border-slate-700">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onTaskClick={handleTaskClick}
                />
              ))}
            </div>
          ) : !loading && carriedOver.length === 0 ? (
            <div className="bg-slate-800/30 rounded-xl border border-slate-700 p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-600 mb-3 block">task_alt</span>
              <p className="text-slate-400 mb-2">No tasks scheduled for today</p>
              <button
                onClick={handleAddTask}
                className="text-primary hover:text-blue-400 transition-colors text-sm font-medium"
              >
                + Add your first task
              </button>
            </div>
          ) : !loading && (
            <div className="bg-slate-800/30 rounded-xl border border-slate-700 p-8 text-center">
              <p className="text-slate-500">No additional tasks for today</p>
            </div>
          )}
        </div>

        <TaskModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          task={editingTask}
          tags={tags}
        />
      </div>
      <RightSidebar tasks={allTasks} />
    </div>
  );
}
