import React from 'react';
import { Shield, UserCheck, ArrowUpDown, DollarSign } from 'lucide-react';
import { UserTableProps, SortField } from './types';
import { calculateMonthlyLicenseCost } from '../../../utils/license';

function SortButton({ field, label, currentField, currentOrder, onSort }: { 
  field: SortField; 
  label: string;
  currentField: SortField;
  currentOrder: 'asc' | 'desc';
  onSort: (field: SortField) => void;
}) {
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900"
    >
      {label}
      <ArrowUpDown className={`w-4 h-4 ${currentField === field ? 'text-indigo-600' : 'text-gray-400'}`} />
    </button>
  );
}

export default function UserTable({ users, sortConfig, onSort, onNavigate }: UserTableProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'MANAGER':
        return <UserCheck className="w-4 h-4 text-indigo-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <SortButton field="name" label="Name" currentField={sortConfig.field} currentOrder={sortConfig.order} onSort={onSort} />
            </th>
            <th className="px-6 py-3 text-left">
              <SortButton field="email" label="Email" currentField={sortConfig.field} currentOrder={sortConfig.order} onSort={onSort} />
            </th>
            <th className="px-6 py-3 text-left">
              <SortButton field="role" label="Role" currentField={sortConfig.field} currentOrder={sortConfig.order} onSort={onSort} />
            </th>
            <th className="px-6 py-3 text-left">
              <SortButton field="manager" label="Manager" currentField={sortConfig.field} currentOrder={sortConfig.order} onSort={onSort} />
            </th>
            <th className="px-6 py-3 text-left">
              <SortButton field="licenses" label="Licenses" currentField={sortConfig.field} currentOrder={sortConfig.order} onSort={onSort} />
            </th>
            <th className="px-6 py-3 text-left">
              <SortButton field="cost" label="Monthly Cost" currentField={sortConfig.field} currentOrder={sortConfig.order} onSort={onSort} />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                No users found matching your criteria.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr 
                key={user.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onNavigate(user.id)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </span>
                    {getRoleIcon(user.role)}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'ADMIN' 
                      ? 'bg-red-100 text-red-800' 
                      : user.role === 'MANAGER'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {user.manager ? `${user.manager.firstName} ${user.manager.lastName}` : '-'}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {user._count?.licenses || 0}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-gray-700">
                    <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                    {user.licenses && user.licenses.length > 0 ? calculateMonthlyLicenseCost(user.licenses).toFixed(2) : '0.00'}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 