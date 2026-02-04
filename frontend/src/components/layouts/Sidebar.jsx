import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'dashboard' },
  { path: '/today', label: 'Tasks', icon: 'check_box' },
  { path: '/calendar', label: 'Calendar', icon: 'calendar_month' },
  { path: '/notes', label: 'Notes', icon: 'description' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  return (
    <aside
      className={`h-screen bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-52'
      }`}
    >
      {/* Logo */}
      <div className={`p-4 border-b border-slate-800 flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-lg">bolt</span>
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-white font-bold">Tusk</h1>
            <p className="text-slate-500 text-xs">Task Manager</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    collapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'bg-primary/20 text-primary'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-slate-800">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="material-symbols-outlined">
            {collapsed ? 'chevron_right' : 'chevron_left'}
          </span>
          {!collapsed && <span className="text-sm font-medium">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
