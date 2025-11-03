import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Catalog, CatalogContextType } from '@/types';
import { getCatalogBySlug } from '@/services/catalogService';

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

// Modo de desarrollo: usa datos mock cuando Firebase no está configurado
const USE_MOCK_DATA = !import.meta.env.VITE_FIREBASE_API_KEY;

export const CatalogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentCatalog, setCurrentCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadCatalog = async (slug: string) => {
    setLoading(true);
    setError(null);

    try {
      let catalog: Catalog | null = null;

      if (USE_MOCK_DATA) {
        // Datos de ejemplo cuando Firebase no está configurado
        console.info('Usando datos mock (Firebase no configurado)');
        catalog = {
          id: '1',
          name: 'Catálogo Ejemplo',
          slug: slug,
          clientId: 'client-1',
          description: 'Catálogo de productos de ejemplo',
          products: [
            {
              id: '1',
              name: 'Producto 1',
              description: 'Descripción del producto 1',
              price: 99.99,
              image: 'https://via.placeholder.com/300',
              category: 'Categoría 1',
              stock: 10,
              sku: 'PROD-001'
            },
            {
              id: '2',
              name: 'Producto 2',
              description: 'Descripción del producto 2',
              price: 149.99,
              image: 'https://via.placeholder.com/300',
              category: 'Categoría 2',
              stock: 5,
              sku: 'PROD-002'
            }
          ],
          theme: {
            primaryColor: '#0ea5e9',
            secondaryColor: '#0369a1'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        // Cargar desde Firebase
        catalog = await getCatalogBySlug(slug);
      }

      if (!catalog) {
        setError('Catálogo no encontrado');
        return;
      }

      setCurrentCatalog(catalog);
    } catch (err) {
      setError('Error al cargar el catálogo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CatalogContext.Provider value={{ currentCatalog, loading, error, loadCatalog }}>
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalog = (): CatalogContextType => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog debe usarse dentro de un CatalogProvider');
  }
  return context;
};
