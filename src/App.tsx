import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { CatalogProvider } from '@/contexts/CatalogContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { HomePage } from '@/pages/HomePage';
import { CatalogPage } from '@/pages/CatalogPage';
import { LoginPage } from '@/pages/LoginPage';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { UsersManagement } from '@/pages/admin/UsersManagement';
import { CatalogForm } from '@/pages/admin/CatalogForm';
import { ProductsManagement } from '@/pages/admin/ProductsManagement';
import { CategoriesManagement } from '@/pages/admin/CategoriesManagement';
import { ClientDashboard } from '@/pages/client/ClientDashboard';
import { NotFoundPage } from '@/pages/NotFoundPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CatalogProvider>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/catalogo/:slug" element={<CatalogPage />} />

            {/* Rutas protegidas - Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UsersManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/catalogs/new"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CatalogForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/catalogs/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CatalogForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/catalogs/:catalogId/products"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ProductsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/catalogs/:catalogId/categories"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CategoriesManagement />
                </ProtectedRoute>
              }
            />

            {/* Rutas protegidas - Cliente */}
            <Route
              path="/client"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />

            {/* Redirect desde /dashboard según el rol */}
            <Route path="/dashboard" element={<Navigate to="/admin" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </CatalogProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
