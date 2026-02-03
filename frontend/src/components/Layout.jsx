import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout() {
  return (
    <div className="dark bg-background-dark min-h-screen">
      <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto overflow-x-hidden border-x border-slate-800">
        <Outlet />
        <BottomNav />
      </div>
    </div>
  );
}
