import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="w-8 h-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="max-w-3xl bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h2>
          <p className="text-gray-600">Settings panel is under construction...</p>
        </div>
      </div>
    </div>
  );
} 