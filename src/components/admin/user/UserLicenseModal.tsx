import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { UserLicenseModalProps } from './types';
import AddLicenseModal from './AddLicenseModal';

export default function UserLicenseModal({ user, onClose, licenses, onAddLicense, onRemoveLicense }: UserLicenseModalProps) {
  const [showAddLicenseModal, setShowAddLicenseModal] = useState(false);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Licenses for {user.firstName} {user.lastName}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4">
            <button
              onClick={() => setShowAddLicenseModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add License
            </button>
          </div>

          {licenses.length ? (
            <div className="divide-y divide-gray-200">
              {licenses.map((license) => (
                <div key={license.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{license.software?.name}</h4>
                    <p className="text-sm text-gray-500">
                      Added {formatDistanceToNow(new Date(license.assignedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveLicense(license)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">No active licenses</div>
          )}
        </div>
      </div>

      {showAddLicenseModal && (
        <AddLicenseModal
          isOpen={showAddLicenseModal}
          onClose={() => setShowAddLicenseModal(false)}
          onAddLicense={onAddLicense}
          existingLicenses={licenses}
          isSubmitting={false}
        />
      )}
    </div>
  );
} 