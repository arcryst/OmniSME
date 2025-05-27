export const Sidebar: React.FC = () => {
  const menuItems = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Customers', href: '/customers', icon: '👥' },
    { name: 'Invoices', href: '/invoices', icon: '📄' },
    { name: 'Expenses', href: '/expenses', icon: '💰' },
    { name: 'Reports', href: '/reports', icon: '📈' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen">
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md px-3 py-2 transition-colors"
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
};