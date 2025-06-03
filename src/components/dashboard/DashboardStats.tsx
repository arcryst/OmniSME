import React from 'react';
import { Key, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { useMyLicenses, useMyRequests } from '../../hooks/useLicenses';

export default function DashboardStats() {
  const { data: licensesData } = useMyLicenses({ status: 'ACTIVE' });
  const { data: requestsData } = useMyRequests();

  const activeLicenses = licensesData?.total || 0;
  const pendingRequests = requestsData?.items.filter(r => r.status === 'PENDING').length || 0;
  const approvedRequests = requestsData?.items.filter(r => r.status === 'APPROVED').length || 0;
  
  // Calculate monthly cost
  const monthlyCost = licensesData?.items.reduce((total, license) => {
    if (!license.software?.costPerLicense) return total;
    const cost = license.software.costPerLicense;
    const multiplier = license.software.billingCycle === 'YEARLY' ? 1/12 : license.software.billingCycle === 'ONE_TIME' ? 0 : 1;
    return total + (cost * multiplier);
  }, 0) || 0;

  const stats = [
    {
      name: 'Active Licenses',
      value: activeLicenses,
      icon: Key,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      name: 'Pending Requests',
      value: pendingRequests,
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-100',
    },
    {
      name: 'Approved Requests',
      value: approvedRequests,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-100',
    },
    {
      name: 'Monthly Cost',
      value: `$${monthlyCost.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-indigo-600 bg-indigo-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
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
                <p className="mt-1 text-xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}