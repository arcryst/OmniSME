import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Trash2, ArrowUpDown } from 'lucide-react';
import { SoftwareTableProps, SortField } from './types';

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

export default function SoftwareTable({ software, sortConfig, onSort, onManageLicenses, onDelete }: SoftwareTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <SortButton field="name" label="Software" currentField={sortConfig.field} currentOrder={sortConfig.order} onSort={onSort} />
            </th>
            <th className="px-6 py-3 text-left">
              <SortButton field="category" label="Category" currentField={sortConfig.field} currentOrder={sortConfig.order} onSort={onSort} />
            </th>
            <th className="px-6 py-3 text-left">
              <SortButton field="vendor" label="Vendor" currentField={sortConfig.field} currentOrder={sortConfig.order} onSort={onSort} />
            </th>
            <th className="px-6 py-3 text-left">
              <SortButton field="costPerLicense" label="Cost" currentField={sortConfig.field} currentOrder={sortConfig.order} onSort={onSort} />
            </th>
            <th className="px-6 py-3 text-left">
              <SortButton field="licenses" label="Active Licenses" currentField={sortConfig.field} currentOrder={sortConfig.order} onSort={onSort} />
            </th>
            <th className="px-6 py-3 text-left">
              <SortButton field="maxLicenses" label="Max Licenses" currentField={sortConfig.field} currentOrder={sortConfig.order} onSort={onSort} />
            </th>
            <th className="px-6 py-3 text-left">
              <SortButton field="availableLicenses" label="Available" currentField={sortConfig.field} currentOrder={sortConfig.order} onSort={onSort} />
            </th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {software.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                No software found matching your criteria.
              </td>
            </tr>
          ) : (
            software.map((item) => {
              const activeLicenses = item._count?.licenses || 0;
              const maxLicenses = item.maxLicenses;
              const availableLicenses = maxLicenses ? maxLicenses - activeLicenses : undefined;

              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.logoUrl ? (
                        <img
                          src={item.logoUrl}
                          alt={`${item.name} logo`}
                          className="w-8 h-8 rounded-lg object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=6366f1&color=fff`;
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">
                            {item.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <Link 
                          to={`/admin/software/${item.id}`}
                          className="font-medium text-gray-900 hover:text-indigo-600"
                        >
                          {item.name}
                        </Link>
                        {item.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {item.vendor || '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {item.costPerLicense ? (
                      <span>
                        ${item.costPerLicense}
                        <span className="text-xs text-gray-400">
                          /{item.billingCycle?.toLowerCase() || 'month'}
                        </span>
                      </span>
                    ) : (
                      'Free'
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {activeLicenses}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {maxLicenses || '∞'}
                  </td>
                  <td className="px-6 py-4">
                    {availableLicenses !== undefined ? (
                      <span className={availableLicenses === 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                        {availableLicenses}
                      </span>
                    ) : (
                      <span className="text-gray-500">∞</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onManageLicenses(item)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Users className="w-4 h-4" />
                        <span className="hidden sm:inline">Manage</span>
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
} 