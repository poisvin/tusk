import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', icon: 'home', label: 'Today' },
  { to: '/calendar', icon: 'calendar_month', label: 'Calendar' },
  { to: '/notes', icon: 'notes', label: 'Notes' },
  { to: '/settings', icon: 'settings', label: 'Settings' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-20 bg-background-dark/90 backdrop-blur-md border-t border-slate-800 flex items-center justify-around px-6 pb-2 z-10">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-slate-400'}`
          }
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span className="text-[10px] font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
