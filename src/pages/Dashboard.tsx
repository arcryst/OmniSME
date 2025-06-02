import React from 'react';
import { Home } from 'lucide-react';

export default function Dashboard() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Home className="w-8 h-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dashboard content will go here */}
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Welcome</h2>
          <p className="text-gray-600">Your dashboard is being set up...</p>
        </div>
      </div>
    </div>
  );
} 