import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Category } from '@/types';
import { CatalogManagementLayout } from '@/components/CatalogManagementLayout';

interface CategoryFormData {
  name: string;
  description: string;
  color: string;
}

const PRESET_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

export const CategoriesManagement: React.FC = () => {
  const { catalogId } = useParams<{ catalogId: string }>();

  const [catalogName, setCatalogName] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    color: PRESET_COLORS[0]
  });

  useEffect(() => {
    if (catalogId) {
      loadCatalogInfo();
      loadCategories();
    }
  }, [catalogId]);

  const loadCatalogInfo = async () => {
    try {
      const catalogRef = doc(db, 'catalogs', catalogId!);
      const catalogSnap = await getDoc(catalogRef);

      if (catalogSnap.exists()) {
        setCatalogName(catalogSnap.data().name);
      }
    } catch (error) {
      console.error('Error al cargar catálogo:', error);
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesRef = collection(db, 'categories');
      const q = query(categoriesRef, where('catalogId', '==', catalogId));
      const snapshot = await getDocs(q);

      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Category[];

      setCategories(categoriesData);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setError('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        color: category.color || PRESET_COLORS[0]
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        color: PRESET_COLORS[0]
      });
    }
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      color: PRESET_COLORS[0]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.name) {
      setError('El nombre de la categoría es requerido');
      return;
    }

    try {
      const categoryData = {
        name: formData.name,
        description: formData.description,
        color: formData.color,
        catalogId: catalogId,
        updatedAt: new Date()
      };

      if (editingCategory) {
        // Actualizar categoría
        await updateDoc(doc(db, 'categories', editingCategory.id), categoryData);
        setSuccess('Categoría actualizada exitosamente');
      } else {
        // Crear nueva categoría
        await addDoc(collection(db, 'categories'), {
          ...categoryData,
          createdAt: new Date()
        });
        setSuccess('Categoría creada exitosamente');
      }

      handleCloseForm();
      loadCategories();
    } catch (error: any) {
      console.error('Error al guardar categoría:', error);
      setError(error.message || 'Error al guardar categoría');
    }
  };

  const handleDelete = async (categoryId: string, categoryName: string) => {
    if (!confirm(`¿Estás seguro de eliminar la categoría "${categoryName}"?\n\nNOTA: Los productos con esta categoría NO se eliminarán, pero mantendrán el nombre de la categoría como texto.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'categories', categoryId));
      setSuccess(`Categoría "${categoryName}" eliminada`);
      loadCategories();
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      setError('Error al eliminar categoría');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <CatalogManagementLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Categorías</h1>
              <p className="text-gray-600 mt-1">Organiza tus productos por categorías</p>
            </div>
            <button
              onClick={() => handleOpenForm()}
              className="btn-primary"
            >
              + Nueva Categoría
            </button>
          </div>
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

        {/* Formulario Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Ej: Ropa, Accesorios, Electrónica"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={2}
                      placeholder="Descripción opcional..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({ ...formData, color })}
                          className={`h-10 rounded-lg transition-all ${
                            formData.color === color
                              ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                              : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {editingCategory ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de categorías */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {categories.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay categorías</h3>
              <p className="text-gray-600 mb-4">Crea categorías para organizar mejor tus productos</p>
              <button
                onClick={() => handleOpenForm()}
                className="btn-primary"
              >
                + Nueva Categoría
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenForm(category)}
                      className="flex-1 px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      className="flex-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        {categories.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Las categorías te ayudan a organizar tus productos. Los clientes podrán filtrar productos por categoría en el catálogo público.
            </p>
          </div>
        )}
      </div>
    </CatalogManagementLayout>
  );
};
