import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Product, Category } from '@/types';
import { ImageUploader } from '@/components/ImageUploader';
import { CatalogManagementLayout } from '@/components/CatalogManagementLayout';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  image: string;
  images: string[]; // Galería de imágenes adicionales
  category: string;
  stock: number;
  sku: string;
}

export const ProductsManagement: React.FC = () => {
  const { catalogId } = useParams<{ catalogId: string }>();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingProgress, setSavingProgress] = useState<string>('');
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    image: '',
    images: [],
    category: '',
    stock: 0,
    sku: ''
  });

  useEffect(() => {
    if (catalogId) {
      loadProducts();
      loadCategories();
    }
  }, [catalogId]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('catalogId', '==', catalogId));
      const snapshot = await getDocs(q);

      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      setProducts(productsData);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
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
    }
  };

  const handleOpenForm = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        images: product.images || [],
        category: product.category,
        stock: product.stock || 0,
        sku: product.sku || ''
      });
      // Activar campos opcionales si el producto tiene precio, stock o SKU
      setShowOptionalFields(!!(product.price || product.stock || product.sku));
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        image: '',
        images: [],
        category: '',
        stock: 0,
        sku: ''
      });
      setShowOptionalFields(false);
    }
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      image: '',
      images: [],
      category: '',
      stock: 0,
      sku: ''
    });
    setShowOptionalFields(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSavingProgress('');

    if (!formData.name || !formData.price || !formData.category) {
      setError('Por favor complete los campos requeridos');
      return;
    }

    setSaving(true);

    try {
      if (!catalogId) {
        setError('Error: No se encontró el ID del catálogo');
        setSaving(false);
        return;
      }

      // Paso 1: Validar tamaño de imágenes
      setSavingProgress('Validando imágenes...');
      const allImages = [formData.image, ...formData.images].filter(Boolean);

      // Calcular tamaño aproximado y contar Base64
      let totalSizeEstimate = 0;
      let base64Count = 0;
      for (const img of allImages) {
        if (img.startsWith('data:')) {
          base64Count++;
          // Es Base64, calcular tamaño real
          const base64Length = img.split(',')[1]?.length || 0;
          totalSizeEstimate += (base64Length * 0.75); // Base64 a bytes
        }
      }

      // Límite de Firestore: 1MB por documento
      const MAX_SIZE = 900 * 1024; // 900KB para dejar margen
      if (totalSizeEstimate > MAX_SIZE) {
        const sizeMB = (totalSizeEstimate / 1024 / 1024).toFixed(2);
        setError(`⚠️ Las imágenes ocupan demasiado espacio (${sizeMB}MB). Firestore permite máximo 1MB por producto.\n\n💡 Sugerencias:\n• Usa menos imágenes (máximo 3-4)\n• Comprime las imágenes antes de subir\n• Espera 1 minuto y vuelve a subir (el límite de Google Drive se restablece)`);
        setSaving(false);
        return;
      }

      // Advertencia si hay muchas imágenes Base64
      if (base64Count > 2) {
        console.warn(`⚠️ Usando ${base64Count} imágenes en Base64. Esto puede llenar rápido el límite de Firestore.`);
      }

      // Paso 2: Preparando datos
      setSavingProgress('Preparando datos del producto...');
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulación visual

      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        image: formData.image,
        images: formData.images,
        category: formData.category,
        stock: Number(formData.stock),
        sku: formData.sku,
        catalogId: catalogId
      };

      console.log('💾 Guardando producto con catalogId:', catalogId);
      console.log(`📊 Tamaño estimado: ${(totalSizeEstimate / 1024).toFixed(2)} KB`);

      // Paso 2: Guardando en base de datos
      const totalImages = (formData.image ? 1 : 0) + formData.images.length;
      setSavingProgress(`Guardando producto${totalImages > 0 ? ` con ${totalImages} imagen(es)` : ''}...`);

      if (editingProduct) {
        // Actualizar producto
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        setSuccess('Producto actualizado exitosamente');
        console.log('✅ Producto actualizado:', editingProduct.id);
      } else {
        // Crear nuevo producto
        const docRef = await addDoc(collection(db, 'products'), productData);
        setSuccess('Producto creado exitosamente');
        console.log('✅ Producto creado con ID:', docRef.id, 'y catalogId:', catalogId);
      }

      // Paso 3: Finalizando
      setSavingProgress('Finalizando...');
      await new Promise(resolve => setTimeout(resolve, 300));

      handleCloseForm();

      // Paso 4: Recargando lista
      setSavingProgress('Actualizando lista de productos...');
      await loadProducts();

      setSavingProgress('');
    } catch (error: any) {
      console.error('Error al guardar producto:', error);
      setError(error.message || 'Error al guardar producto');
      setSavingProgress('');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el producto "${productName}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'products', productId));
      setSuccess(`Producto "${productName}" eliminado`);
      loadProducts();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      setError('Error al eliminar producto');
    }
  };

  const handleCleanOptionalFields = async () => {
    if (!confirm('¿Limpiar campos opcionales (precio, SKU, stock) de TODOS los productos? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setLoading(true);
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('catalogId', '==', catalogId));
      const snapshot = await getDocs(q);

      let updatedCount = 0;

      for (const productDoc of snapshot.docs) {
        const productRef = doc(db, 'products', productDoc.id);
        await updateDoc(productRef, {
          price: 0,
          stock: 0,
          sku: ''
        });
        updatedCount++;
      }

      setSuccess(`✅ ${updatedCount} productos actualizados. Los campos opcionales han sido removidos.`);
      loadProducts();
    } catch (error) {
      console.error('Error al limpiar productos:', error);
      setError('Error al limpiar productos');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
              <p className="text-gray-600 mt-1">Gestiona los productos de tu catálogo</p>
            </div>
            <div className="flex gap-3">
              {products.length > 0 && (
                <button
                  onClick={handleCleanOptionalFields}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                  title="Limpiar campos opcionales de todos los productos"
                >
                  🧹 Limpiar campos opcionales
                </button>
              )}
              <button
                onClick={() => handleOpenForm()}
                className="btn-primary"
              >
                + Agregar Producto
              </button>
            </div>
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

        {/* Formulario Modal estilo Shopify */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
              {/* Header del modal */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-lg">
                <h2 className="text-xl font-semibold">
                  {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
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

              {/* Contenido del modal */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Columna principal */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Información básica */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre del producto *
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Ej: Camiseta básica"
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
                            rows={4}
                            placeholder="Describe el producto..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Galería de imágenes */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-sm font-medium text-gray-700">Galería de imágenes</h3>
                          <p className="text-xs text-gray-500 mt-1">La primera imagen será la principal del producto</p>
                        </div>
                        {(formData.image || formData.images.length > 0) && (
                          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            {(formData.image ? 1 : 0) + formData.images.length} imagen(es)
                          </span>
                        )}
                      </div>

                      {/* Grid de imágenes */}
                      {(formData.image || formData.images.length > 0) && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                          {/* Imagen principal */}
                          {formData.image && (
                            <div className="relative group">
                              <img
                                src={formData.image}
                                alt="Principal"
                                className="w-full h-32 object-cover rounded-lg border-2 border-primary-500"
                              />
                              <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded">
                                Principal
                              </div>
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, image: '' })}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          )}

                          {/* Imágenes adicionales */}
                          {formData.images.map((img, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={img}
                                alt={`Imagen ${index + 2}`}
                                className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newImages = formData.images.filter((_, i) => i !== index);
                                  setFormData({ ...formData, images: newImages });
                                }}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  // Hacer esta imagen la principal
                                  const newImages = formData.images.filter((_, i) => i !== index);
                                  if (formData.image) {
                                    newImages.unshift(formData.image);
                                  }
                                  setFormData({ ...formData, image: img, images: newImages });
                                }}
                                className="absolute bottom-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                Hacer principal
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Botón para agregar imágenes */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                        <ImageUploader
                          allowMultiple={true}
                          onMultipleUploadComplete={(urls) => {
                            // Manejar múltiples URLs
                            if (!formData.image) {
                              // Primera imagen será la principal, resto a galería
                              const [mainImg, ...restImgs] = urls;
                              setFormData({
                                ...formData,
                                image: mainImg,
                                images: [...formData.images, ...restImgs]
                              });
                            } else {
                              // Agregar todas a la galería
                              setFormData({
                                ...formData,
                                images: [...formData.images, ...urls]
                              });
                            }
                          }}
                          onUploadComplete={(url) => {
                            // Fallback para una sola imagen
                            if (!formData.image) {
                              setFormData({ ...formData, image: url });
                            } else {
                              setFormData({ ...formData, images: [...formData.images, url] });
                            }
                          }}
                          buttonText={!formData.image ? '📷 Subir imágenes (selecciona una o varias)' : `📷 Agregar más imágenes`}
                          showPreview={false}
                        />
                      </div>
                    </div>

                    {/* Checkbox para campos opcionales */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showOptionalFields}
                          onChange={(e) => setShowOptionalFields(e.target.checked)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Mostrar campos opcionales (Precio, SKU, Stock)
                        </span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1 ml-6">
                        Activa esto si necesitas agregar información de precio e inventario
                      </p>
                    </div>

                    {/* Precios (condicional) */}
                    {showOptionalFields && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Precio</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Precio
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-gray-500">$</span>
                              <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Inventario (condicional) */}
                    {showOptionalFields && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Inventario</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              SKU
                            </label>
                            <input
                              type="text"
                              value={formData.sku}
                              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="SKU-001"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Stock disponible
                            </label>
                            <input
                              type="number"
                              value={formData.stock}
                              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="0"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Columna lateral */}
                  <div className="space-y-6">
                    {/* Categoría */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-700">Organización</h3>
                        <Link
                          to={`/admin/catalogs/${catalogId}/categories`}
                          className="text-xs text-primary-600 hover:text-primary-700"
                        >
                          Gestionar categorías
                        </Link>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Categoría *
                        </label>
                        {categories.length > 0 ? (
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                          >
                            <option value="">Seleccionar categoría</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.name}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div>
                            <input
                              type="text"
                              value={formData.category}
                              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="Ej: Ropa, Accesorios"
                              required
                            />
                            <p className="text-xs text-orange-600 mt-1">
                              ⚠️ No hay categorías. <Link to={`/admin/catalogs/${catalogId}/categories`} className="underline">Crear categorías</Link>
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Los productos se agruparán por categoría
                        </p>
                      </div>
                    </div>

                    {/* Preview */}
                    {formData.image && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Vista previa</h3>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-3 bg-gray-50">
                            <p className="font-medium text-sm text-gray-900">{formData.name || 'Nombre del producto'}</p>
                            <p className="text-sm text-primary-600 font-semibold mt-1">
                              {formData.price > 0 ? formatPrice(formData.price) : '$0'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="mt-6 border-t pt-6 space-y-3">
                  {/* Indicador de progreso */}
                  {saving && savingProgress && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900">{savingProgress}</p>
                          <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2">
                            <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botones */}
                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="btn-secondary"
                      disabled={saving}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn-primary relative"
                      disabled={saving}
                    >
                      {saving ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Guardando...
                        </span>
                      ) : (
                        editingProduct ? 'Actualizar producto' : 'Agregar producto'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de productos estilo Shopify */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {products.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
              <p className="text-gray-600 mb-4">Comienza agregando tu primer producto al catálogo</p>
              <button
                onClick={() => handleOpenForm()}
                className="btn-primary"
              >
                + Agregar Producto
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            {product.sku && (
                              <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.stock !== undefined ? (
                          <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                            {product.stock} unidades
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenForm(product)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Estadísticas */}
        {products.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Total de productos</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Categorías</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(products.map(p => p.category)).size}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Stock total</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.reduce((acc, p) => acc + (p.stock || 0), 0)} unidades
              </p>
            </div>
          </div>
        )}
      </div>
    </CatalogManagementLayout>
  );
};
