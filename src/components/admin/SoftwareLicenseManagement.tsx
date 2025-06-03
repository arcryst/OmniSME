import React, { useState } from 'react';
import { Users, Plus, X, Search } from 'lucide-react';
import { useUsers } from '../../hooks/useAdmin';
import { License, User } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface SoftwareLicenseManagementProps {
  softwareId: string;
  softwareName: string;
  onClose: () => void;
  licenses: License[];
  onAddLicense: (userId: string) => void;
  onRemoveLicense: (licenseId: string) => void;
}

export default function SoftwareLicenseManagement({
  softwareId,
  softwareName,
  onClose,
  licenses,
  onAddLicense,
  onRemoveLicense,
}: SoftwareLicenseManagementProps) {
  const [search, setSearch] = useState('');
  const { data: users } = useUsers();

  // Filter out users who already have a license
  const licensedUserIds = new Set(licenses.map(license => license.userId));
  const availableUsers = (users || []).filter((user: User) => !licensedUserIds.has(user.id));

  // Filter users based on search
  const filteredUsers = availableUsers.filter((user: User) => {
    const searchLower = search.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Manage Licenses: {softwareName}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {licenses.length} active licenses
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Current Licenses */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Current Licenses</h3>
              <div className="space-y-4">
                {licenses.length === 0 ? (
                  <p className="text-gray-500">No active licenses</p>
                ) : (
                  licenses.map((license) => (
                    <tr key={license.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {license.user?.firstName} {license.user?.lastName}
                          </div>
                          <div className="text-sm text-gray-500 ml-1">
                            ({license.user?.email})
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDistanceToNow(new Date(license.assignedAt), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => onRemoveLicense(license.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Deactivate
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </div>
            </div>

            {/* Add License */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add License</h3>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Available Users */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUsers.map((user: User) => (
                  <button
                    key={user.id}
                    onClick={() => onAddLicense(user.id)}
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {filteredUsers.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  {search ? 'No users found matching your search' : 'No users available'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 