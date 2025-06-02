import React from 'react';
import { Package } from 'lucide-react';
import SoftwareCatalog from '../../components/software/SoftwareCatalog';

export default function Catalog() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Package className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Software Catalog</h1>
        </div>
        <p className="text-gray-600">
          Browse and request access to software tools for your work
        </p>
      </div>

      {/* Catalog Component */}
      <SoftwareCatalog />
    </div>
  );
}