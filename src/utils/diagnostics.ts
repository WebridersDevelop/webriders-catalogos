import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

/**
 * Función de diagnóstico para verificar productos y catálogos
 */
export const diagnosticDatabase = async () => {
  console.log('🔧 DIAGNÓSTICO DE BASE DE DATOS');
  console.log('================================');

  try {
    // Verificar catálogos
    const catalogsRef = collection(db, 'catalogs');
    const catalogsSnapshot = await getDocs(catalogsRef);

    console.log(`\n📁 CATÁLOGOS (${catalogsSnapshot.size} encontrados):`);
    catalogsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ID: ${doc.id}`);
      console.log(`    Nombre: ${data.name}`);
      console.log(`    Slug: ${data.slug}`);
      console.log(`    ClientID: ${data.clientId}`);
      console.log('');
    });

    // Verificar productos
    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);

    console.log(`\n📦 PRODUCTOS (${productsSnapshot.size} encontrados):`);
    productsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ID: ${doc.id}`);
      console.log(`    Nombre: ${data.name}`);
      console.log(`    CatalogID: ${data.catalogId || '❌ NO TIENE CATALOG_ID'}`);
      console.log(`    Precio: $${data.price}`);
      console.log(`    Categoría: ${data.category}`);
      console.log('');
    });

    // Verificar coincidencias
    console.log('\n🔗 VERIFICACIÓN DE VÍNCULOS:');
    const catalogIds = catalogsSnapshot.docs.map(doc => doc.id);
    const orphanProducts = productsSnapshot.docs.filter(doc => {
      const catalogId = doc.data().catalogId;
      return !catalogId || !catalogIds.includes(catalogId);
    });

    if (orphanProducts.length > 0) {
      console.log(`⚠️ ${orphanProducts.length} productos sin catálogo válido:`);
      orphanProducts.forEach(doc => {
        console.log(`  - ${doc.data().name} (catalogId: ${doc.data().catalogId || 'NINGUNO'})`);
      });
    } else {
      console.log('✅ Todos los productos están vinculados correctamente');
    }

    // Agrupar productos por catálogo
    console.log('\n📊 PRODUCTOS POR CATÁLOGO:');
    catalogsSnapshot.forEach(catalogDoc => {
      const catalogId = catalogDoc.id;
      const catalogName = catalogDoc.data().name;
      const catalogProducts = productsSnapshot.docs.filter(
        prodDoc => prodDoc.data().catalogId === catalogId
      );
      console.log(`  ${catalogName}: ${catalogProducts.length} productos`);
    });

    console.log('\n================================');
    console.log('✅ Diagnóstico completado');

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  }
};

/**
 * Función para arreglar productos con catalogId incorrecto
 */
export const fixProductsCatalogId = async () => {
  console.log('🔧 ARREGLANDO CATALOG IDS');
  console.log('================================');

  try {
    // Obtener el primer catálogo (o el que especifiques)
    const catalogsRef = collection(db, 'catalogs');
    const catalogsSnapshot = await getDocs(catalogsRef);

    if (catalogsSnapshot.empty) {
      console.log('❌ No hay catálogos en la base de datos');
      return;
    }

    const firstCatalog = catalogsSnapshot.docs[0];
    const catalogId = firstCatalog.id;
    const catalogName = firstCatalog.data().name;

    console.log(`\n📁 Usando catálogo: "${catalogName}"`);
    console.log(`   ID: ${catalogId}`);

    // Obtener productos con catalogId incorrecto
    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);

    const brokenProducts = productsSnapshot.docs.filter(doc => {
      const data = doc.data();
      return !data.catalogId || data.catalogId === '{CATALOG_ID}' || data.catalogId !== catalogId;
    });

    if (brokenProducts.length === 0) {
      console.log('\n✅ Todos los productos ya tienen el catalogId correcto');
      return;
    }

    console.log(`\n🔄 Arreglando ${brokenProducts.length} productos...`);

    // Actualizar cada producto
    for (const productDoc of brokenProducts) {
      const productName = productDoc.data().name;
      const oldCatalogId = productDoc.data().catalogId;

      await updateDoc(doc(db, 'products', productDoc.id), {
        catalogId: catalogId
      });

      console.log(`  ✅ ${productName}: "${oldCatalogId}" → "${catalogId}"`);
    }

    console.log('\n================================');
    console.log('✅ Productos arreglados exitosamente');
    console.log('🔄 Recarga la página del catálogo para ver los productos');

  } catch (error) {
    console.error('❌ Error al arreglar productos:', error);
  }
};
