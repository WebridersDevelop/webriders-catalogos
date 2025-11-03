import React from 'react';
import { Catalog } from '@/types';

interface CatalogHeaderProps {
  catalog: Catalog;
}

export const CatalogHeader: React.FC<CatalogHeaderProps> = ({ catalog }) => {
  return (
    <header className="bg-white shadow-sm mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {catalog.logo && (
              <img
                src={catalog.logo}
                alt={catalog.name}
                className="h-12 w-12 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{catalog.name}</h1>
              {catalog.description && (
                <p className="text-gray-600 mt-1">{catalog.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
