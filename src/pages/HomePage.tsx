import React from 'react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Webriders Catálogos
        </h1>
        <p className="text-xl md:text-2xl text-primary-100 mb-12">
          Sistema de catálogos en línea para tu negocio
        </p>

        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Catálogos de Ejemplo
          </h2>
          <p className="text-gray-600 mb-6">
            Accede a los catálogos usando el formato: /catalogo/[nombre-del-catalogo]
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <Link
              to="/catalogo/tienda-ejemplo"
              className="block p-6 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <h3 className="text-lg font-semibold text-primary-900 mb-2">
                Tienda Ejemplo
              </h3>
              <p className="text-primary-700 text-sm">
                /catalogo/tienda-ejemplo
              </p>
            </Link>

            <Link
              to="/catalogo/mi-negocio"
              className="block p-6 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <h3 className="text-lg font-semibold text-primary-900 mb-2">
                Mi Negocio
              </h3>
              <p className="text-primary-700 text-sm">
                /catalogo/mi-negocio
              </p>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 text-white">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
            <svg className="w-12 h-12 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            <h3 className="font-semibold mb-2">Múltiples Catálogos</h3>
            <p className="text-sm text-primary-100">
              Gestiona varios catálogos para diferentes tiendas
            </p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
            <svg className="w-12 h-12 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="font-semibold mb-2">Fácil de Usar</h3>
            <p className="text-sm text-primary-100">
              Interfaz intuitiva y responsive para tus clientes
            </p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
            <svg className="w-12 h-12 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            <h3 className="font-semibold mb-2">Multi-Cliente</h3>
            <p className="text-sm text-primary-100">
              Cada cliente tiene su propio espacio personalizado
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
