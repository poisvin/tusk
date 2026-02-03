export const NotificationService = {
  // Check if notifications are supported
  isSupported() {
    return 'Notification' in window;
  },

  // Get current permission status
  getPermission() {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  },

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported()) {
      console.warn('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notifications denied by user');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  // Show a notification
  show(title, options = {}) {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      console.warn('Cannot show notification - permission not granted');
      return null;
    }

    const defaultOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: options.tag || 'tusk-notification',
      requireInteraction: false,
      ...options,
    };

    try {
      const notification = new Notification(title, defaultOptions);

      notification.onclick = () => {
        window.focus();
        notification.close();
        if (options.onClick) options.onClick();
      };

      // Auto close after 10 seconds
      setTimeout(() => notification.close(), 10000);

      return notification;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return null;
    }
  },

  // Show a task reminder notification
  showTaskReminder(task) {
    const body = task.description || 'Task is due soon';
    return this.show(`Reminder: ${task.title}`, {
      body,
      tag: `task-${task.id}`,
      data: { taskId: task.id },
    });
  },
};

export default NotificationService;
