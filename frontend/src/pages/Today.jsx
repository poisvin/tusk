import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Header from '../components/Header';
import ProgressCard from '../components/ProgressCard';
import TaskSection from '../components/TaskSection';
import FloatingAddButton from '../components/FloatingAddButton';
import TaskModal from '../components/TaskModal';
import { tasksApi } from '../api/tasks';
import { tagsApi } from '../api/tags';

export default function Today() {
  const [tasks, setTasks] = useState([]);
  const [carriedOver, setCarriedOver] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const today = format(new Date(), 'yyyy-MM-dd');

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

  const allTasks = [...tasks, ...carriedOver];
  const completedCount = allTasks.filter(t => t.status === 'done').length;
  const totalCount = allTasks.length;

  return (
    <>
      <Header
        title="Today"
        leftIcon="calendar_today"
        rightAction={
          <button className="flex items-center justify-center rounded-full h-10 w-10 bg-slate-800 text-white hover:bg-slate-700">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        }
      />

      <main className="flex-1 pb-24">
        <ProgressCard completed={completedCount} total={totalCount} />

        <TaskSection
          title="Carried Over from Yesterday"
          tasks={carriedOver}
          onToggle={handleToggle}
          onTaskClick={handleTaskClick}
          isCarriedOver
        />

        <TaskSection
          title="Today's Tasks"
          tasks={tasks}
          onToggle={handleToggle}
          onTaskClick={handleTaskClick}
        />

        {!loading && tasks.length === 0 && carriedOver.length === 0 && (
          <div className="text-center text-slate-400 py-12">
            <span className="material-symbols-outlined text-6xl mb-4 block">task_alt</span>
            <p>No tasks for today</p>
            <p className="text-sm">Tap + to add a task</p>
          </div>
        )}
      </main>

      <FloatingAddButton onClick={handleAddTask} />

      <TaskModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        task={editingTask}
        tags={tags}
      />
    </>
  );
}
