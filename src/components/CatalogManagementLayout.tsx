import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface CatalogManagementLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  description: string;
}

export const CatalogManagementLayout: React.FC<CatalogManagementLayoutProps> = ({ children }) => {
  const { catalogId, id } = useParams<{ catalogId?: string; id?: string }>();
  const location = useLocation();
  const [catalogName, setCatalogName] = useState('');
  const [loading, setLoading] = useState(true);

  // Usar catalogId o id dependiendo de la ruta
  const currentCatalogId = catalogId || id;

  useEffect(() => {
    if (currentCatalogId) {
      loadCatalogInfo();
    }
  }, [currentCatalogId]);

  const loadCatalogInfo = async () => {
    try {
      const catalogRef = doc(db, 'catalogs', currentCatalogId!);
      const catalogSnap = await getDoc(catalogRef);

      if (catalogSnap.exists()) {
        setCatalogName(catalogSnap.data().name);
      }
    } catch (error) {
      console.error('Error al cargar catálogo:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems: MenuItem[] = [
    {
      id: 'info',
      label: 'Información',
      path: `/admin/catalogs/${currentCatalogId}`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Editar nombre, descripción y tema'
    },
    {
      id: 'products',
      label: 'Productos',
      path: `/admin/catalogs/${currentCatalogId}/products`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      description: 'Gestionar productos del catálogo'
    },
    {
      id: 'categories',
      label: 'Categorías',
      path: `/admin/catalogs/${currentCatalogId}/categories`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      description: 'Organizar categorías de productos'
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-200 min-h-screen flex flex-col">
          {/* Header del Sidebar */}
          <div className="p-6 border-b border-gray-200">
            <Link
              to="/admin"
              className="text-primary-600 hover:text-primary-700 mb-3 inline-flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver al panel
            </Link>
            <h2 className="text-xl font-bold text-gray-900 mt-2">{catalogName}</h2>
            <p className="text-sm text-gray-500 mt-1">Gestión del catálogo</p>
          </div>

          {/* Menú de navegación */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`flex items-start gap-3 px-4 py-3 rounded-lg transition-colors ${
                      active
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className={`mt-0.5 ${active ? 'text-primary-600' : 'text-gray-400'}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${active ? 'text-primary-700' : 'text-gray-900'}`}>
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                    {active && (
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer del Sidebar */}
          <div className="p-4 border-t border-gray-200">
            <Link
              to={`/catalogo/${currentCatalogId}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Ver catálogo público
            </Link>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};
