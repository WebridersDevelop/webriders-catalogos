import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { collection, addDoc, doc, getDoc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { ImageUploader } from '@/components/ImageUploader';
import { CatalogManagementLayout } from '@/components/CatalogManagementLayout';
import { User } from '@/types';

interface CatalogFormData {
  name: string;
  slug: string;
  clientId: string;
  description: string;
  logo: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    bannerImage: string;
  };
}

export const CatalogForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [clientUsers, setClientUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<CatalogFormData>({
    name: '',
    slug: '',
    clientId: '',
    description: '',
    logo: '',
    theme: {
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      fontFamily: 'Inter, system-ui, sans-serif',
      bannerImage: ''
    }
  });

  useEffect(() => {
    loadClientUsers();
    if (isEdit) {
      loadCatalog();
    }
  }, [id]);

  const loadClientUsers = async () => {
    try {
      // Cargar usuarios con rol 'client' desde la colección users
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'client'));
      const snapshot = await getDocs(q);

      const usersData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as User[];

      setClientUsers(usersData);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      setError('Error al cargar la lista de clientes');
    }
  };

  const loadCatalog = async () => {
    try {
      setLoadingData(true);
      const catalogRef = doc(db, 'catalogs', id!);
      const catalogSnap = await getDoc(catalogRef);

      if (catalogSnap.exists()) {
        const data = catalogSnap.data();
        setFormData({
          name: data.name || '',
          slug: data.slug || '',
          clientId: data.clientId || '',
          description: data.description || '',
          logo: data.logo || '',
          theme: {
            primaryColor: data.theme?.primaryColor || '#3B82F6',
            secondaryColor: data.theme?.secondaryColor || '#10B981',
            fontFamily: data.theme?.fontFamily || 'Inter, system-ui, sans-serif',
            bannerImage: data.theme?.bannerImage || ''
          }
        });
      } else {
        setError('Catálogo no encontrado');
      }
    } catch (error) {
      console.error('Error al cargar catálogo:', error);
      setError('Error al cargar el catálogo');
    } finally {
      setLoadingData(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validaciones
    if (!formData.name || !formData.slug || !formData.clientId) {
      setError('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);

      const catalogData = {
        name: formData.name,
        slug: formData.slug,
        clientId: formData.clientId,
        description: formData.description,
        logo: formData.logo,
        theme: formData.theme,
        updatedAt: new Date()
      };

      if (isEdit) {
        // Actualizar catálogo existente
        await updateDoc(doc(db, 'catalogs', id!), catalogData);
        setSuccess('Catálogo actualizado exitosamente');
      } else {
        // Crear nuevo catálogo
        await addDoc(collection(db, 'catalogs'), {
          ...catalogData,
          createdAt: new Date()
        });
        setSuccess('Catálogo creado exitosamente');
      }

      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (error: any) {
      console.error('Error al guardar catálogo:', error);
      setError(error.message || 'Error al guardar el catálogo');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const content = (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        {!isEdit && (
          <Link to="/admin" className="text-primary-600 hover:text-primary-700 mb-4 inline-flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al panel
          </Link>
        )}
        <h1 className="text-3xl font-bold text-gray-900 mt-2">
          {isEdit ? 'Información del Catálogo' : 'Crear Nuevo Catálogo'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEdit ? 'Actualiza la información básica del catálogo' : 'Complete el formulario para crear un nuevo catálogo'}
        </p>
      </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">❌ {error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">✅ {success}</p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Información Básica</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Catálogo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ej: Tienda Mi Negocio"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                  placeholder="tienda-mi-negocio"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL pública: /catalogo/{formData.slug || 'slug-generado'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente * {clientUsers.length > 0 && <span className="text-xs text-gray-500">({clientUsers.length} disponibles)</span>}
                </label>

                {clientUsers.length > 0 ? (
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientUsers.map((user) => (
                      <option key={user.uid} value={user.clientId || user.uid}>
                        {user.displayName || user.email} - {user.email}
                        {user.clientId && ` (ID: ${user.clientId})`}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={formData.clientId}
                      onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="client-123"
                      required
                    />
                    <p className="text-xs text-orange-600 mt-1">
                      ⚠️ No hay usuarios tipo cliente. Ingresa el ID manualmente o crea un usuario cliente primero.
                    </p>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-1">
                  Este ID vincula el catálogo con el usuario cliente
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Descripción del catálogo..."
                />
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Logo del Catálogo</h2>
            <ImageUploader
              onUploadComplete={(url) => setFormData({ ...formData, logo: url })}
              buttonText="Subir Logo"
              currentImage={formData.logo}
            />
          </div>

          {/* Tema y personalización */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Personalización</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color Primario
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.theme.primaryColor}
                      onChange={(e) => setFormData({
                        ...formData,
                        theme: { ...formData.theme, primaryColor: e.target.value }
                      })}
                      className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.theme.primaryColor}
                      onChange={(e) => setFormData({
                        ...formData,
                        theme: { ...formData.theme, primaryColor: e.target.value }
                      })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color Secundario
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.theme.secondaryColor}
                      onChange={(e) => setFormData({
                        ...formData,
                        theme: { ...formData.theme, secondaryColor: e.target.value }
                      })}
                      className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.theme.secondaryColor}
                      onChange={(e) => setFormData({
                        ...formData,
                        theme: { ...formData.theme, secondaryColor: e.target.value }
                      })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                      placeholder="#10B981"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuente
                </label>
                <select
                  value={formData.theme.fontFamily}
                  onChange={(e) => setFormData({
                    ...formData,
                    theme: { ...formData.theme, fontFamily: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Inter, system-ui, sans-serif">Inter</option>
                  <option value="Roboto, sans-serif">Roboto</option>
                  <option value="Open Sans, sans-serif">Open Sans</option>
                  <option value="Montserrat, sans-serif">Montserrat</option>
                  <option value="Poppins, sans-serif">Poppins</option>
                  <option value="Georgia, serif">Georgia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Banner / Imagen de Portada
                </label>
                <ImageUploader
                  onUploadComplete={(url) => setFormData({
                    ...formData,
                    theme: { ...formData.theme, bannerImage: url }
                  })}
                  buttonText="Subir Banner"
                  currentImage={formData.theme.bannerImage}
                />
              </div>
            </div>
          </div>

          {/* Sección de productos (solo en modo edición) */}
          {isEdit && id && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Productos del Catálogo</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Administra los productos de este catálogo
                  </p>
                </div>
                <Link
                  to={`/admin/catalogs/${id}/products`}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Gestionar Productos
                </Link>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Haz clic en "Gestionar Productos" para agregar, editar o eliminar productos de este catálogo.
                </p>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : isEdit ? 'Actualizar Catálogo' : 'Crear Catálogo'}
            </button>
            <Link to="/admin" className="btn-secondary">
              Cancelar
            </Link>
            {isEdit && id && (
              <Link
                to={`/admin/catalogs/${id}/products`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Ir a Productos
              </Link>
            )}
          </div>
        </form>
    </div>
  );

  // Si está en modo edición, usar el layout con sidebar
  if (isEdit) {
    return <CatalogManagementLayout>{content}</CatalogManagementLayout>;
  }

  // Si está creando, mostrar sin sidebar
  return (
    <div className="min-h-screen bg-gray-50">
      {content}
    </div>
  );
};
