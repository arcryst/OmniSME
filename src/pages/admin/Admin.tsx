import React, { useState } from 'react';
import { Shield, BarChart3, Package, Clock } from 'lucide-react';
import AdminStats from '../../components/admin/AdminStats';
import PendingApprovals from '../../components/admin/PendingApprovals';
import SoftwareManagement from '../../components/admin/SoftwareManagement';

type TabType = 'overview' | 'approvals' | 'software';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Check if user is admin
  if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: BarChart3 },
    { id: 'approvals' as TabType, label: 'Approvals', icon: Clock },
    { id: 'software' as TabType, label: 'Software', icon: Package },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
        <p className="text-gray-600">
          Manage software licenses, approvals, and system settings
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <AdminStats />}
        {activeTab === 'approvals' && <PendingApprovals />}
        {activeTab === 'software' && <SoftwareManagement />}
      </div>
    </div>
  );
}