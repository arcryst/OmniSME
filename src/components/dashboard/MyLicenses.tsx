import React, { useState } from 'react';
import { ExternalLink, MoreVertical, RefreshCw, Calendar, Clock } from 'lucide-react';
import { useMyLicenses, useReturnLicense } from '../../hooks/useLicenses';
import { formatDistanceToNow } from 'date-fns';

export default function MyLicenses() {
  const [showAllLicenses, setShowAllLicenses] = useState(false);
  const { data, isLoading } = useMyLicenses({ 
    status: 'ACTIVE',
    limit: showAllLicenses ? 100 : 5 
  });
  const returnLicense = useReturnLicense();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleReturn = async (licenseId: string) => {
    if (window.confirm('Are you sure you want to return this license?')) {
      await returnLicense.mutateAsync(licenseId);
      setOpenMenuId(null);
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

  const licenses = data?.items || [];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">My Active Licenses</h2>
          <span className="text-sm text-gray-500">{data?.total || 0} total</span>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {licenses.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>You don't have any active licenses yet.</p>
            <p className="mt-2 text-sm">Request software access from the catalog.</p>
          </div>
        ) : (
          <>
            {licenses.map((license) => (
              <div key={license.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {license.software?.logoUrl ? (
                        <img
                          src={license.software.logoUrl}
                          alt={`${license.software.name} logo`}
                          className="w-10 h-10 rounded-lg object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(license.software?.name || '')}&background=6366f1&color=fff`;
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">
                            {license.software?.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">{license.software?.name}</h3>
                        <p className="text-sm text-gray-500">{license.software?.vendor}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Assigned {formatDistanceToNow(new Date(license.assignedAt), { addSuffix: true })}
                      </span>
                      {license.lastUsedAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Last used {formatDistanceToNow(new Date(license.lastUsedAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {license.software?.websiteUrl && (
                      <a
                        href={license.software.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Open software website"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === license.id ? null : license.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {openMenuId === license.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={() => handleReturn(license.id)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            disabled={returnLicense.isPending}
                          >
                            <RefreshCw className="w-4 h-4" />
                            Return License
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {!showAllLicenses && licenses.length === 5 && data?.total && data.total > 5 && (
              <div className="p-4 text-center">
                <button
                  onClick={() => setShowAllLicenses(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Show all {data.total} licenses
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}