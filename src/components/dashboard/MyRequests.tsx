import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { useMyRequests, useCancelRequest } from '../../hooks/useLicenses';
import { formatDistanceToNow } from 'date-fns';
import { LicenseRequest } from '../../types';

export default function MyRequests() {
  const [showAllRequests, setShowAllRequests] = useState(false);
  const { data, isLoading } = useMyRequests({ 
    limit: showAllRequests ? 100 : 5 
  });
  const cancelRequest = useCancelRequest();

  const handleCancel = async (requestId: string) => {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      await cancelRequest.mutateAsync(requestId);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'CANCELLED':
        return <X className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-600 font-semibold';
      case 'HIGH':
        return 'text-orange-600 font-medium';
      case 'MEDIUM':
        return 'text-yellow-600';
      case 'LOW':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const requests = data?.items || [];
  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">My License Requests</h2>
          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <span className="text-sm text-yellow-600 font-medium">
                {pendingCount} pending
              </span>
            )}
            <span className="text-sm text-gray-500">{data?.total || 0} total</span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {requests.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>You haven't made any license requests yet.</p>
          </div>
        ) : (
          <>
            {requests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <h3 className="font-medium text-gray-900">
                          {request.software?.name}
                        </h3>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                      <span className={`text-xs ${getPriorityColor(request.priority)}`}>
                        {request.priority} priority
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-600">
                      {request.justification}
                    </p>

                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Requested {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                      </span>
                      {request.approvals && request.approvals.length > 0 && (
                        <span>
                          {request.approvals[0].status === 'APPROVED' ? 'Approved' : 'Rejected'} by{' '}
                          {request.approvals[0].approver?.firstName} {request.approvals[0].approver?.lastName}
                        </span>
                      )}
                    </div>

                    {request.approvals && request.approvals[0]?.comments && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                        <span className="font-medium">Comments:</span> {request.approvals[0].comments}
                      </div>
                    )}
                  </div>

                  {request.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancel(request.id)}
                      className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={cancelRequest.isPending}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}

            {!showAllRequests && requests.length === 5 && data?.total && data.total > 5 && (
              <div className="p-4 text-center">
                <button
                  onClick={() => setShowAllRequests(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Show all {data.total} requests
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}