import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import DashboardStats from '../components/dashboard/DashboardStats';
import MyLicenses from '../components/dashboard/MyLicenses';
import MyRequests from '../components/dashboard/MyRequests';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.firstName || 'User'}!
        </h1>
        <p className="mt-1 text-gray-600">
          Here's an overview of your software licenses and requests.
        </p>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Quick Actions */}
      <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-indigo-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Need new software?</h2>
              <p className="text-sm text-gray-600">Browse our catalog and request access to the tools you need.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/catalog')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Browse Catalog
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Licenses */}
        <div className="lg:col-span-1">
          <MyLicenses />
        </div>

        {/* My Requests */}
        <div className="lg:col-span-1">
          <MyRequests />
        </div>
      </div>
    </div>
  );
}