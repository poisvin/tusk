import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import { useReminders } from '../hooks/useReminders';

export default function Layout() {
  // Check for task reminders every minute
  useReminders(true, 60000);

  return (
    <div className="dark bg-background-dark min-h-screen">
      <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto overflow-x-hidden border-x border-slate-800">
        <Outlet />
        <BottomNav />
      </div>
    </div>
  );
}
