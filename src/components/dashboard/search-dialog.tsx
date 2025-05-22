'use client';

import type React from 'react';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Search } from 'lucide-react';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
    console.log('Searching for:', searchQuery);
    // For demo purposes, just close the dialog
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Search</h2>
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-md border border-gray-200 bg-gray-50 pl-8 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <p>Recent searches:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {['dashboard', 'users', 'analytics', 'settings'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    className="rounded-full bg-gray-100 px-3 py-1 hover:bg-gray-200"
                    onClick={() => setSearchQuery(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
