import React, { useEffect, useState, useMemo } from 'react';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (slug) {
      loadCatalog(slug);
    }
  }, [slug]);

  // Obtener categorías únicas
  const categories = useMemo(() => {
    if (!currentCatalog) return [];
    const uniqueCategories = Array.from(new Set(currentCatalog.products.map(p => p.category)));
    return uniqueCategories.sort();
  }, [currentCatalog]);

  // Contar productos por categoría
  const categoryCounts = useMemo(() => {
    if (!currentCatalog) return {};
    return currentCatalog.products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [currentCatalog]);

  useEffect(() => {
    if (currentCatalog) {
      console.log('🔍 Catálogo cargado:', {
        nombre: currentCatalog.name,
        slug: currentCatalog.slug,
        productos: currentCatalog.products.length,
        productos_data: currentCatalog.products
      });

      let filtered = currentCatalog.products;

      // Filtrar por categoría
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(product => product.category === selectedCategory);
      }

      // Filtrar por búsqueda
      if (searchQuery) {
        filtered = filtered.filter((product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setFilteredProducts(filtered);

      console.log(`📊 ${filtered.length} productos después del filtro`);
    }
  }, [currentCatalog, searchQuery, selectedCategory]);

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
        {/* Barra de búsqueda */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Filtros de categoría */}
        {categories.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Categorías</h2>
                <span className="text-sm text-gray-500">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Botón "Todos" */}
                <button
                  onClick={() => setSelectedCategory('all')}
                  style={{
                    backgroundColor: selectedCategory === 'all' ? '#0284c7' : '#f3f4f6',
                    color: selectedCategory === 'all' ? '#ffffff' : '#374151',
                  }}
                  className={`
                    px-4 py-2 rounded-full font-medium text-sm transition-all duration-200
                    ${selectedCategory === 'all' ? 'shadow-md transform scale-105' : 'hover:bg-gray-200'}
                  `}
                >
                  <span>
                    Todos
                  </span>
                  <span className="ml-2 text-xs opacity-75">
                    ({currentCatalog.products.length})
                  </span>
                </button>

                {/* Botones de categorías */}
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    style={{
                      backgroundColor: selectedCategory === category ? '#0284c7' : '#f3f4f6',
                      color: selectedCategory === category ? '#ffffff' : '#374151',
                    }}
                    className={`
                      px-4 py-2 rounded-full font-medium text-sm transition-all duration-200
                      ${selectedCategory === category ? 'shadow-md transform scale-105' : 'hover:bg-gray-200'}
                    `}
                  >
                    <span>
                      {category}
                    </span>
                    <span className="ml-2 text-xs opacity-75">
                      ({categoryCounts[category] || 0})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Grid de productos */}
        {filteredProducts.length > 0 ? (
          <>
            {/* Indicador de filtro activo */}
            {(selectedCategory !== 'all' || searchQuery) && (
              <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>
                  Mostrando {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
                  {selectedCategory !== 'all' && ` en "${selectedCategory}"`}
                  {searchQuery && ` que coinciden con "${searchQuery}"`}
                </span>
                {(selectedCategory !== 'all' || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    className="ml-2 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            )}

            <ProductGrid products={filteredProducts} />
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-500 text-lg font-medium mb-2">
              {searchQuery || selectedCategory !== 'all'
                ? 'No se encontraron productos'
                : 'No hay productos disponibles'}
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Ver todos los productos
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
