import { useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { tasksApi } from '../api/tasks';
import NotificationService from '../utils/notifications';

// Track which tasks we've already notified about
const notifiedTasks = new Set();

export function useReminders(enabled = true, checkInterval = 60000) {
  const intervalRef = useRef(null);

  const checkReminders = useCallback(async () => {
    if (!enabled || NotificationService.getPermission() !== 'granted') {
      return;
    }

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const response = await tasksApi.getForDate(today);
      const allTasks = [...(response.data.tasks || []), ...(response.data.carried_over || [])];

      const now = new Date();

      allTasks.forEach(task => {
        // Skip if already notified or not remind-enabled
        if (!task.remind || notifiedTasks.has(task.id) || task.status === 'done') {
          return;
        }

        // Check if task has a start time
        if (task.start_time) {
          const taskTime = new Date(task.start_time);
          const timeDiff = taskTime.getTime() - now.getTime();

          // Notify if task is within 15 minutes
          if (timeDiff > 0 && timeDiff <= 15 * 60 * 1000) {
            NotificationService.showTaskReminder(task);
            notifiedTasks.add(task.id);
          }
        }
      });
    } catch (error) {
      console.error('Failed to check reminders:', error);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Check immediately on mount
    checkReminders();

    // Set up interval
    intervalRef.current = setInterval(checkReminders, checkInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, checkInterval, checkReminders]);

  const clearNotifiedTask = useCallback((taskId) => {
    notifiedTasks.delete(taskId);
  }, []);

  return { checkReminders, clearNotifiedTask };
}

export default useReminders;
