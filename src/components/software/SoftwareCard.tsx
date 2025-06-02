import React from 'react';
import { Software } from '../../types';
import { CheckCircle, Clock, ExternalLink, DollarSign } from 'lucide-react';

interface SoftwareCardProps {
  software: Software;
  onRequestAccess: (software: Software) => void;
}

export default function SoftwareCard({ software, onRequestAccess }: SoftwareCardProps) {
  const hasAccess = software.userLicense?.status === 'ACTIVE';
  const hasPendingRequest = software.hasPendingRequest;
  const isDisabled = hasAccess || hasPendingRequest;

  const formatCost = () => {
    if (!software.costPerLicense) return 'Free';
    const cost = software.costPerLicense;
    const cycle = software.billingCycle === 'YEARLY' ? '/year' : software.billingCycle === 'ONE_TIME' ? ' one-time' : '/month';
    return `$${cost}${cycle}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          {software.logoUrl ? (
            <img
              src={software.logoUrl}
              alt={`${software.name} logo`}
              className="w-12 h-12 rounded-lg object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(software.name)}&background=6366f1&color=fff`;
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-semibold text-lg">
                {software.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{software.name}</h3>
            {software.vendor && (
              <p className="text-sm text-gray-500">by {software.vendor}</p>
            )}
          </div>
        </div>
        {software.websiteUrl && (
          <a
            href={software.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        )}
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {software.description || 'No description available'}
      </p>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-sm">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {software.category}
          </span>
          <span className="flex items-center text-gray-500">
            <DollarSign className="w-4 h-4 mr-1" />
            {formatCost()}
          </span>
        </div>
        {!software.requiresApproval && (
          <span className="text-xs text-green-600 font-medium">Instant Access</span>
        )}
      </div>

      <div className="mt-4">
        {hasAccess ? (
          <button
            disabled
            className="w-full flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 rounded-lg cursor-not-allowed"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            You have access
          </button>
        ) : hasPendingRequest ? (
          <button
            disabled
            className="w-full flex items-center justify-center px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg cursor-not-allowed"
          >
            <Clock className="w-5 h-5 mr-2" />
            Request pending
          </button>
        ) : (
          <button
            onClick={() => onRequestAccess(software)}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Request Access
          </button>
        )}
      </div>

      {software._count && (
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>{software._count.licenses} active licenses</span>
          {software._count.requests > 0 && (
            <span>{software._count.requests} pending requests</span>
          )}
        </div>
      )}
    </div>
  );
}