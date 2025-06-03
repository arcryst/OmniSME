import React, { useState, useEffect } from 'react';
import { Package, Clock, Users, Shield } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import AdminStats from '../../components/admin/AdminStats';
import PendingApprovals from '../../components/admin/PendingApprovals';
import SoftwareManagement from '../../components/admin/SoftwareManagement';
import UserManagement from '../../components/admin/UserManagement';

type TabType = 'overview' | 'approvals' | 'software' | 'users';

interface LocationState {
  activeTab?: TabType;
}

export default function Admin() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Update active tab when navigating to the page with state
  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.activeTab) {
      setActiveTab(state.activeTab);
      // Clear the state after using it
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: Package },
    { id: 'approvals' as TabType, label: 'Approvals', icon: Clock },
    { id: 'software' as TabType, label: 'Software', icon: Package },
    { id: 'users' as TabType, label: 'Users', icon: Users },
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
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && <AdminStats />}
        {activeTab === 'approvals' && <PendingApprovals />}
        {activeTab === 'software' && <SoftwareManagement />}
        {activeTab === 'users' && <UserManagement />}
      </div>
    </div>
  );
}