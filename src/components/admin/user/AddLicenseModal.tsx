import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AddLicenseModalProps } from './types';
import { useSoftware } from '../../../hooks/useSoftware';

export default function AddLicenseModal({ isOpen, onClose, onAddLicense, existingLicenses, isSubmitting }: AddLicenseModalProps) {
  const [selectedSoftwareId, setSelectedSoftwareId] = useState('');
  const { data: softwareData } = useSoftware();

  const availableSoftware = softwareData?.items.filter(
    (software) => !existingLicenses.some((license) => license.softwareId === software.id)
  ) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSoftwareId) {
      onAddLicense(selectedSoftwareId);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Add New License
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Software <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedSoftwareId}
                onChange={(e) => setSelectedSoftwareId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Software</option>
                {availableSoftware.map((software) => (
                  <option key={software.id} value={software.id}>
                    {software.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                disabled={!selectedSoftwareId || isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add License'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 