import React from 'react';
import { Package, Users, DollarSign, TrendingUp, Activity, Clock } from 'lucide-react';
import { useLicenseStats } from '../../hooks/useAdmin';
import { useSoftware } from '../../hooks/useSoftware';
import { usePendingApprovals } from '../../hooks/useAdmin';

interface SoftwareLicenseCount {
  softwareId: string;
  softwareName: string;
  count: number;
}

interface LicenseActivity {
  id: string;
  assignedAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
  software: {
    name: string;
  };
}

export default function AdminStats() {
  const { data: stats } = useLicenseStats();
  const { data: softwareData } = useSoftware({ limit: 1 });
  const { data: pendingData } = usePendingApprovals({ limit: 1 });

  const statsCards = [
    {
      name: 'Active Licenses',
      value: stats?.activeLicenses || 0,
      icon: Package,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      name: 'Monthly Cost',
      value: `$${stats?.monthlyTotalCost?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'text-green-600 bg-green-100',
    },
    {
      name: 'Total Software',
      value: softwareData?.total || 0,
      icon: Activity,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      name: 'Pending Approvals',
      value: pendingData?.total || 0,
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-100',
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center">
                <div className={`rounded-md p-3 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Software by Licenses */}
      {stats?.licensesBySoftware && stats.licensesBySoftware.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Top Software by License Count
          </h3>
          <div className="space-y-3">
            {[...stats.licensesBySoftware]
              .sort((a, b) => b.count - a.count)
              .slice(0, 5)
              .map((item: SoftwareLicenseCount, index: number) => {
              // Find the maximum count to calculate percentages
              const maxCount = Math.max(...stats.licensesBySoftware.map((s: SoftwareLicenseCount) => s.count));
              return (
                <div key={item.softwareId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                    <span className="text-sm text-gray-900">{item.softwareName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{
                          width: `${(item.count / maxCount) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-12 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Recent License Activity
          </h3>
          <div className="space-y-3">
            {stats.recentActivity.map((activity: LicenseActivity) => (
              <div key={activity.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-gray-900">
                    {activity.user.firstName} {activity.user.lastName}
                  </span>
                  <span className="text-gray-500"> was assigned </span>
                  <span className="font-medium text-gray-900">{activity.software.name}</span>
                </div>
                <span className="text-gray-500">
                  {new Date(activity.assignedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}