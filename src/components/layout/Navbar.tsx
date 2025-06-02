import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="px-4 mx-auto">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <button className="text-gray-500 hover:text-gray-600 lg:hidden">
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="text-xl font-bold text-indigo-600 ml-2">
              OmniSME
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 