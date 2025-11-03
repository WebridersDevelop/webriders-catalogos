import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

// Inicializar Firebase Admin
admin.initializeApp();

const db = admin.firestore();

/**
 * API HTTP para obtener un catálogo por slug
 * Ejemplo: GET /getCatalog?slug=tienda-ejemplo
 */
export const getCatalog = onRequest(async (req, res) => {
  // Habilitar CORS
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  try {
    const slug = req.query.slug as string;

    if (!slug) {
      res.status(400).json({ error: 'El parámetro slug es requerido' });
      return;
    }

    const catalogsRef = db.collection('catalogs');
    const snapshot = await catalogsRef.where('slug', '==', slug).limit(1).get();

    if (snapshot.empty) {
      res.status(404).json({ error: 'Catálogo no encontrado' });
      return;
    }

    const catalogDoc = snapshot.docs[0];
    const catalogData = catalogDoc.data();

    // Obtener productos
    const productsSnapshot = await catalogDoc.ref.collection('products').get();
    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({
      id: catalogDoc.id,
      ...catalogData,
      products
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * API HTTP para buscar productos en un catálogo
 * Ejemplo: GET /searchProducts?catalogId=abc123&query=zapatos
 */
export const searchProducts = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  try {
    const catalogId = req.query.catalogId as string;
    const query = (req.query.query as string || '').toLowerCase();

    if (!catalogId) {
      res.status(400).json({ error: 'El parámetro catalogId es requerido' });
      return;
    }

    const productsRef = db.collection('catalogs').doc(catalogId).collection('products');
    const snapshot = await productsRef.get();

    const products = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((product: any) => {
        const searchText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
        return searchText.includes(query);
      });

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Trigger: Se ejecuta cuando se crea un nuevo catálogo
 * Útil para inicialización, logs, notificaciones, etc.
 */
export const onCatalogCreated = onDocumentCreated('catalogs/{catalogId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const catalogData = snapshot.data();
  const catalogId = event.params.catalogId;

  console.log(`Nuevo catálogo creado: ${catalogId}`, catalogData);

  // Aquí puedes agregar lógica adicional:
  // - Enviar notificación
  // - Crear registros de auditoría
  // - Inicializar datos por defecto
  // - etc.
});

/**
 * Trigger: Se ejecuta cuando se actualiza un catálogo
 * Útil para mantener sincronización, cache, etc.
 */
export const onCatalogUpdated = onDocumentUpdated('catalogs/{catalogId}', async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  const catalogId = event.params.catalogId;

  console.log(`Catálogo actualizado: ${catalogId}`);
  console.log('Antes:', before);
  console.log('Después:', after);

  // Aquí puedes agregar lógica adicional:
  // - Invalidar cache
  // - Actualizar índices de búsqueda
  // - Enviar notificaciones de cambios
  // - etc.
});

/**
 * API HTTP para obtener estadísticas de un catálogo
 * Ejemplo: GET /getCatalogStats?catalogId=abc123
 */
export const getCatalogStats = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  try {
    const catalogId = req.query.catalogId as string;

    if (!catalogId) {
      res.status(400).json({ error: 'El parámetro catalogId es requerido' });
      return;
    }

    const productsSnapshot = await db
      .collection('catalogs')
      .doc(catalogId)
      .collection('products')
      .get();

    const products = productsSnapshot.docs.map(doc => doc.data());

    const stats = {
      totalProducts: products.length,
      totalValue: products.reduce((sum: number, p: any) => sum + (p.price || 0), 0),
      categories: [...new Set(products.map((p: any) => p.category))],
      inStock: products.filter((p: any) => (p.stock || 0) > 0).length,
      outOfStock: products.filter((p: any) => (p.stock || 0) === 0).length,
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
