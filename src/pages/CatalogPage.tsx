import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCatalog } from '@/contexts/CatalogContext';
import { CatalogHeader } from '@/components/CatalogHeader';
import { SearchBar } from '@/components/SearchBar';
import { ProductGrid } from '@/components/ProductGrid';
import { Product } from '@/types';

export const CatalogPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { currentCatalog, loading, error, loadCatalog } = useCatalog();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (slug) {
      loadCatalog(slug);
    }
  }, [slug]);

  useEffect(() => {
    if (currentCatalog) {
      console.log('🔍 Catálogo cargado:', {
        nombre: currentCatalog.name,
        slug: currentCatalog.slug,
        productos: currentCatalog.products.length,
        productos_data: currentCatalog.products
      });

      const filtered = currentCatalog.products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);

      console.log(`📊 ${filtered.length} productos después del filtro`);
    }
  }, [currentCatalog, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (!currentCatalog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">No se encontró el catálogo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CatalogHeader catalog={currentCatalog} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchBar onSearch={handleSearch} />

        {filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchQuery ? 'No se encontraron productos' : 'No hay productos disponibles'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
