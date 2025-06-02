import React, { useState } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import { useSoftware, useSoftwareCategories } from '../../hooks/useSoftware';
import SoftwareCard from './SoftwareCard';
import RequestModal from './RequestModal';
import { Software } from '../../types';

export default function SoftwareCatalog() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [selectedSoftware, setSelectedSoftware] = useState<Software | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch software with filters
  const { data, isLoading, error } = useSoftware({
    page,
    limit: 12,
    search: search || undefined,
    category: selectedCategory || undefined,
  });

  // Fetch categories for filter
  const { data: categories = [] } = useSoftwareCategories();

  const handleRequestAccess = (software: Software) => {
    setSelectedSoftware(software);
    setIsModalOpen(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setPage(1); // Reset to first page on filter change
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load software catalog</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 text-indigo-600 hover:text-indigo-800"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search software..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      )}

      {/* Software Grid */}
      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((software) => (
              <SoftwareCard
                key={software.id}
                software={software}
                onRequestAccess={handleRequestAccess}
              />
            ))}
          </div>

          {/* Empty State */}
          {data.items.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {search || selectedCategory 
                  ? 'No software found matching your criteria' 
                  : 'No software available yet'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {page} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === data.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Request Modal */}
      <RequestModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSoftware(null);
        }}
        software={selectedSoftware}
      />
    </div>
  );
}