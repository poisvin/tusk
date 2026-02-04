import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import { useReminders } from '../../hooks/useReminders';
import { useState, useEffect } from 'react';
import { tasksApi } from '../../api/tasks';
import { format } from 'date-fns';

export default function DesktopLayout() {
  const [tasks, setTasks] = useState([]);

  // Check for task reminders
  useReminders(true, 60000);

  // Load today's tasks for the progress widget
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const dateStr = format(new Date(), 'yyyy-MM-dd');
        const response = await tasksApi.getForDate(dateStr);
        const allTasks = [...(response.data.tasks || []), ...(response.data.carried_over || [])];
        setTasks(allTasks);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      }
    };

    loadTasks();

    // Refresh tasks periodically
    const interval = setInterval(loadTasks, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dark bg-background-dark min-h-screen flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet context={{ refreshTasks: () => {
          const dateStr = format(new Date(), 'yyyy-MM-dd');
          tasksApi.getForDate(dateStr).then(response => {
            const allTasks = [...(response.data.tasks || []), ...(response.data.carried_over || [])];
            setTasks(allTasks);
          });
        }}} />
      </main>
      <RightSidebar tasks={tasks} />
    </div>
  );
}
