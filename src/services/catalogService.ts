import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Catalog, Product } from '@/types';

const CATALOGS_COLLECTION = 'catalogs';
const PRODUCTS_COLLECTION = 'products';

// Convertir timestamp de Firestore a Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

/**
 * Obtener un catálogo por su slug
 */
export const getCatalogBySlug = async (slug: string): Promise<Catalog | null> => {
  try {
    const catalogsRef = collection(db, CATALOGS_COLLECTION);
    const q = query(catalogsRef, where('slug', '==', slug));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const catalogDoc = querySnapshot.docs[0];
    const catalogData = catalogDoc.data();

    // Obtener productos del catálogo desde la colección 'products' con catalogId
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const productsQuery = query(productsRef, where('catalogId', '==', catalogDoc.id));
    const productsSnapshot = await getDocs(productsQuery);

    const products: Product[] = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));

    console.log(`📦 Catálogo "${catalogData.name}" cargado con ${products.length} productos`);

    return {
      id: catalogDoc.id,
      ...catalogData,
      products,
      createdAt: convertTimestamp(catalogData.createdAt),
      updatedAt: convertTimestamp(catalogData.updatedAt)
    } as Catalog;
  } catch (error) {
    console.error('Error al obtener catálogo:', error);
    throw error;
  }
};

/**
 * Obtener todos los catálogos de un cliente
 */
export const getCatalogsByClient = async (clientId: string): Promise<Catalog[]> => {
  try {
    const catalogsRef = collection(db, CATALOGS_COLLECTION);
    const q = query(catalogsRef, where('clientId', '==', clientId));
    const querySnapshot = await getDocs(q);

    const catalogs: Catalog[] = [];

    for (const doc of querySnapshot.docs) {
      const catalogData = doc.data();

      // Obtener productos del catálogo desde la colección 'products' con catalogId
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      const productsQuery = query(productsRef, where('catalogId', '==', doc.id));
      const productsSnapshot = await getDocs(productsQuery);

      const products: Product[] = productsSnapshot.docs.map(prodDoc => ({
        id: prodDoc.id,
        ...prodDoc.data()
      } as Product));

      catalogs.push({
        id: doc.id,
        ...catalogData,
        products,
        createdAt: convertTimestamp(catalogData.createdAt),
        updatedAt: convertTimestamp(catalogData.updatedAt)
      } as Catalog);
    }

    return catalogs;
  } catch (error) {
    console.error('Error al obtener catálogos del cliente:', error);
    throw error;
  }
};

/**
 * Crear un nuevo catálogo
 */
export const createCatalog = async (catalogData: Omit<Catalog, 'id' | 'createdAt' | 'updatedAt' | 'products'>): Promise<string> => {
  try {
    const catalogsRef = collection(db, CATALOGS_COLLECTION);
    const docRef = await addDoc(catalogsRef, {
      ...catalogData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    return docRef.id;
  } catch (error) {
    console.error('Error al crear catálogo:', error);
    throw error;
  }
};

/**
 * Actualizar un catálogo
 */
export const updateCatalog = async (catalogId: string, updates: Partial<Catalog>): Promise<void> => {
  try {
    const catalogRef = doc(db, CATALOGS_COLLECTION, catalogId);
    await updateDoc(catalogRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error al actualizar catálogo:', error);
    throw error;
  }
};

/**
 * Eliminar un catálogo
 */
export const deleteCatalog = async (catalogId: string): Promise<void> => {
  try {
    // Eliminar todos los productos primero
    const productsRef = collection(db, CATALOGS_COLLECTION, catalogId, PRODUCTS_COLLECTION);
    const productsSnapshot = await getDocs(productsRef);

    const deletePromises = productsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Eliminar el catálogo
    const catalogRef = doc(db, CATALOGS_COLLECTION, catalogId);
    await deleteDoc(catalogRef);
  } catch (error) {
    console.error('Error al eliminar catálogo:', error);
    throw error;
  }
};

/**
 * Agregar un producto a un catálogo
 */
export const addProduct = async (catalogId: string, productData: Omit<Product, 'id'>): Promise<string> => {
  try {
    const productsRef = collection(db, CATALOGS_COLLECTION, catalogId, PRODUCTS_COLLECTION);
    const docRef = await addDoc(productsRef, productData);

    // Actualizar timestamp del catálogo
    await updateCatalog(catalogId, {});

    return docRef.id;
  } catch (error) {
    console.error('Error al agregar producto:', error);
    throw error;
  }
};

/**
 * Actualizar un producto
 */
export const updateProduct = async (catalogId: string, productId: string, updates: Partial<Product>): Promise<void> => {
  try {
    const productRef = doc(db, CATALOGS_COLLECTION, catalogId, PRODUCTS_COLLECTION, productId);
    await updateDoc(productRef, updates);

    // Actualizar timestamp del catálogo
    await updateCatalog(catalogId, {});
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    throw error;
  }
};

/**
 * Eliminar un producto
 */
export const deleteProduct = async (catalogId: string, productId: string): Promise<void> => {
  try {
    const productRef = doc(db, CATALOGS_COLLECTION, catalogId, PRODUCTS_COLLECTION, productId);
    await deleteDoc(productRef);

    // Actualizar timestamp del catálogo
    await updateCatalog(catalogId, {});
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    throw error;
  }
};
