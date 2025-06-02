import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Package, Settings } from 'lucide-react';

export default function Sidebar() {
  const links = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/catalog', icon: Package, label: 'Software' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 border-r border-gray-200 bg-white">
      <nav className="mt-5 px-2 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}