import React from 'react';
import { Settings as SettingsIcon, LogOut } from 'lucide-react';
import { authApi } from '../services/api';

export default function Settings() {
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      authApi.logout();
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="w-8 h-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* Account Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h2>
            <p className="text-gray-600">Settings panel is under construction...</p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow-sm border border-red-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
            <div className="flex items-center justify-between py-3 px-4 bg-red-50 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Log out</h3>
                <p className="text-sm text-gray-500">End your current session</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 