import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Software } from '../../types';
import { useCreateLicenseRequest } from '../../hooks/useSoftware';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  software: Software | null;
}

export default function RequestModal({ isOpen, onClose, software }: RequestModalProps) {
  const [justification, setJustification] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  
  const createRequest = useCreateLicenseRequest();

  if (!isOpen || !software) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (justification.trim().length < 10) {
      alert('Please provide a justification with at least 10 characters');
      return;
    }

    try {
      await createRequest.mutateAsync({
        softwareId: software.id,
        justification: justification.trim(),
        priority,
      });
      
      // Reset form and close modal
      setJustification('');
      setPriority('MEDIUM');
      onClose();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleClose = () => {
    if (!createRequest.isPending) {
      setJustification('');
      setPriority('MEDIUM');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Request Access to {software.name}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={createRequest.isPending}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="justification" className="block text-sm font-medium text-gray-700 mb-2">
                Business Justification
              </label>
              <textarea
                id="justification"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Please explain why you need access to this software..."
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                required
                minLength={10}
                disabled={createRequest.isPending}
              />
              <p className="mt-1 text-xs text-gray-500">
                Minimum 10 characters required
              </p>
            </div>

            <div className="mb-6">
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                id="priority"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT')}
                disabled={createRequest.isPending}
              >
                <option value="LOW">Low - Can wait a few days</option>
                <option value="MEDIUM">Medium - Need within 2-3 days</option>
                <option value="HIGH">High - Need as soon as possible</option>
                <option value="URGENT">Urgent - Blocking my work</option>
              </select>
            </div>

            {!software.requiresApproval && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Good news!</strong> This software doesn't require approval. 
                  You'll get access immediately after submitting.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={createRequest.isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
                disabled={createRequest.isPending}
              >
                {createRequest.isPending ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}