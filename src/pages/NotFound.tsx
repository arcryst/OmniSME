import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-indigo-600" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Page not found</h1>
        <p className="mt-2 text-base text-gray-600">Sorry, we couldn't find the page you're looking for.</p>
        <Link
          to="/"
          className="mt-6 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
} 