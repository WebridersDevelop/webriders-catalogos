import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Catalog } from '@/types';

export const ClientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCatalogs();
  }, [user]);

  const loadCatalogs = async () => {
    try {
      setLoading(true);

      // Modo mock para desarrollo
      if (!import.meta.env.VITE_FIREBASE_API_KEY) {
        const mockCatalogs: Catalog[] = [
          {
            id: '1',
            name: 'Mi Tienda',
            slug: 'mi-tienda',
            clientId: user?.clientId || 'client-1',
            description: 'Mi catálogo principal',
            products: [],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

        setCatalogs(mockCatalogs);
        setLoading(false);
        return;
      }

      // Cargar solo los catálogos del cliente actual
      const catalogsRef = collection(db, 'catalogs');
      const q = query(catalogsRef, where('clientId', '==', user?.clientId));
      const snapshot = await getDocs(q);

      const catalogsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          slug: data.slug || '',
          clientId: data.clientId || '',
          description: data.description || '',
          logo: data.logo,
          theme: data.theme,
          products: [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      }) as Catalog[];

      setCatalogs(catalogsData);
    } catch (error) {
      console.error('Error al cargar catálogos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tus catálogos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mis Catálogos</h1>
              <p className="text-sm text-gray-600">Bienvenido, {user?.displayName || user?.email}</p>
            </div>
            <button onClick={handleLogout} className="btn-secondary">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Mis Catálogos</p>
            <p className="text-3xl font-bold text-gray-900">{catalogs.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Productos</p>
            <p className="text-3xl font-bold text-gray-900">
              {catalogs.reduce((sum, cat) => sum + cat.products.length, 0)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Estado</p>
            <p className="text-lg font-semibold text-green-600">Activo</p>
          </div>
        </div>

        {/* Catalogs Grid */}
        {catalogs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes catálogos todavía
            </h3>
            <p className="text-gray-600 mb-6">
              Contacta con Webriders para crear tu primer catálogo
            </p>
            <a href="mailto:soporte@webriders.com" className="btn-primary">
              Contactar Soporte
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalogs.map((catalog) => (
              <div key={catalog.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                {catalog.logo && (
                  <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                    <img
                      src={catalog.logo}
                      alt={catalog.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{catalog.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{catalog.description}</p>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                    </svg>
                    <span>{catalog.products.length} productos</span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/client/catalogs/${catalog.id}`}
                      className="flex-1 btn-primary text-center"
                    >
                      Gestionar
                    </Link>
                    <Link
                      to={`/catalogo/${catalog.slug}`}
                      target="_blank"
                      className="flex-1 btn-secondary text-center"
                    >
                      Ver catálogo
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
