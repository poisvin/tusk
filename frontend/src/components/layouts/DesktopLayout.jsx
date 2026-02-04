import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useReminders } from '../../hooks/useReminders';

export default function DesktopLayout() {
  // Check for task reminders
  useReminders(true, 60000);

  return (
    <div className="dark bg-background-dark min-h-screen flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
