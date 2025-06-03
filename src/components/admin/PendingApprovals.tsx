import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, User } from 'lucide-react';
import { usePendingApprovals, useApproveRequest, useRejectRequest } from '../../hooks/useAdmin';
import { formatDistanceToNow } from 'date-fns';
import { LicenseRequest } from '../../types';

export default function PendingApprovals() {
  const [selectedRequest, setSelectedRequest] = useState<LicenseRequest | null>(null);
  const [comments, setComments] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const { data, isLoading } = usePendingApprovals({ limit: 50 });
  const approveRequest = useApproveRequest();
  const rejectRequest = useRejectRequest();

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return;

    if (actionType === 'reject' && !comments.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      if (actionType === 'approve') {
        await approveRequest.mutateAsync({
          requestId: selectedRequest.id,
          comments: comments.trim() || undefined,
        });
      } else {
        await rejectRequest.mutateAsync({
          requestId: selectedRequest.id,
          comments: comments.trim(),
        });
      }

      // Reset form
      setSelectedRequest(null);
      setComments('');
      setActionType(null);
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const requests = data?.items || [];
  const pendingCount = requests.length;

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
            </div>
            <span className="text-sm text-gray-500">{pendingCount} pending</span>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {requests.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No pending requests at this time.</p>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">
                        {request.software?.name}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(request.priority)}`}>
                        {request.priority} priority
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium">
                        {request.user?.firstName} {request.user?.lastName}
                      </span>
                      <span className="text-gray-400">({request.user?.email})</span>
                      {request.user?.manager && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500">
                            Reports to: {request.user.manager.firstName} {request.user.manager.lastName}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Justification:</span> {request.justification}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Requested {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                      </span>
                      {request.software?.costPerLicense && (
                        <span>
                          Cost: ${request.software.costPerLicense}
                          {request.software.billingCycle === 'MONTHLY' && '/month'}
                          {request.software.billingCycle === 'YEARLY' && '/year'}
                        </span>
                      )}
                      {!request.software?.requiresApproval && (
                        <span className="text-amber-600 font-medium">
                          ⚠️ Auto-approval enabled for this software
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setActionType('approve');
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                      disabled={approveRequest.isPending || rejectRequest.isPending}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setActionType('reject');
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                      disabled={approveRequest.isPending || rejectRequest.isPending}
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Action Modal */}
      {selectedRequest && actionType && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => {
                setSelectedRequest(null);
                setComments('');
                setActionType(null);
              }}
            />

            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {actionType === 'approve' ? 'Approve' : 'Reject'} Request
              </h3>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">User:</span> {selectedRequest.user?.firstName} {selectedRequest.user?.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Software:</span> {selectedRequest.software?.name}
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
                  Comments {actionType === 'reject' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  id="comments"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={actionType === 'approve' ? 'Optional comments...' : 'Please provide a reason for rejection...'}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRequest(null);
                    setComments('');
                    setActionType(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                    actionType === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                  disabled={approveRequest.isPending || rejectRequest.isPending}
                >
                  {approveRequest.isPending || rejectRequest.isPending
                    ? 'Processing...'
                    : actionType === 'approve'
                    ? 'Approve Request'
                    : 'Reject Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}  