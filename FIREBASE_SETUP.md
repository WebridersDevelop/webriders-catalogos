# Configuración de Firebase para Webriders Catálogos

Esta guía te ayudará a configurar Firebase como backend serverless para el sistema de catálogos.

## Tabla de Contenidos

1. [Crear Proyecto en Firebase](#crear-proyecto-en-firebase)
2. [Configurar Firestore Database](#configurar-firestore-database)
3. [Configurar Storage](#configurar-storage)
4. [Configurar Variables de Entorno](#configurar-variables-de-entorno)
5. [Estructura de Datos en Firestore](#estructura-de-datos-en-firestore)
6. [Desplegar Firebase Functions](#desplegar-firebase-functions)
7. [Usar Firebase Hosting](#usar-firebase-hosting)
8. [Agregar Datos de Ejemplo](#agregar-datos-de-ejemplo)

## 1. Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto"
3. Ingresa el nombre del proyecto: `webriders-catalogos`
4. Acepta los términos y haz clic en "Continuar"
5. Opcional: Habilita Google Analytics
6. Espera a que se cree el proyecto

## 2. Configurar Firestore Database

### Crear la Base de Datos

1. En el menú lateral, ve a **Build** > **Firestore Database**
2. Haz clic en "Crear base de datos"
3. Selecciona la ubicación (recomendado: `us-central1` o la más cercana a tu región)
4. Selecciona "Comenzar en modo de prueba" (cambiaremos las reglas después)
5. Haz clic en "Habilitar"

### Aplicar Reglas de Seguridad

1. Ve a la pestaña **Reglas**
2. Las reglas ya están definidas en `firestore.rules`
3. O ejecuta: `firebase deploy --only firestore:rules`

### Crear Índices

Los índices están definidos en `firestore.indexes.json`. Se crearán automáticamente cuando hagas deploy.

```bash
firebase deploy --only firestore:indexes
```

## 3. Configurar Storage

1. En el menú lateral, ve a **Build** > **Storage**
2. Haz clic en "Comenzar"
3. Acepta las reglas por defecto
4. Selecciona la ubicación (usa la misma que Firestore)
5. Haz clic en "Listo"

### Aplicar Reglas de Storage

Las reglas están en `storage.rules`:

```bash
firebase deploy --only storage
```

## 4. Configurar Variables de Entorno

### Obtener Credenciales

1. Ve a **Configuración del proyecto** (ícono de engranaje)
2. En la pestaña **General**, baja hasta "Tus apps"
3. Haz clic en el ícono `</>` para crear una app web
4. Registra la app con el nombre `webriders-catalogos-web`
5. Copia las credenciales de Firebase

### Configurar Variables Locales

1. Crea un archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.example .env.local
```

2. Edita `.env.local` con tus credenciales:

```env
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
VITE_FIREBASE_APP_ID=tu-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Configurar Variables en Vercel

1. Ve a tu proyecto en Vercel
2. Settings > Environment Variables
3. Agrega cada variable con su valor

## 5. Estructura de Datos en Firestore

### Colección: `catalogs`

```
catalogs/{catalogId}
├── name: string
├── slug: string (único)
├── clientId: string
├── description: string
├── logo: string (URL)
├── theme: object
│   ├── primaryColor: string
│   └── secondaryColor: string
├── createdAt: timestamp
└── updatedAt: timestamp
```

### Sub-colección: `products`

```
catalogs/{catalogId}/products/{productId}
├── name: string
├── description: string
├── price: number
├── image: string (URL)
├── category: string
├── stock: number
└── sku: string
```

### Colección: `clients` (Opcional)

```
clients/{clientId}
├── name: string
├── email: string
├── createdAt: timestamp
└── catalogs: array<string> (IDs de catálogos)
```

## 6. Desplegar Firebase Functions

### Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

### Login

```bash
firebase login
```

### Inicializar (Solo primera vez)

Si aún no has inicializado Firebase en el proyecto:

```bash
firebase init
```

Selecciona:
- ✅ Firestore
- ✅ Functions
- ✅ Hosting
- ✅ Storage

### Instalar Dependencias de Functions

```bash
cd functions
npm install
cd ..
```

### Desplegar Functions

```bash
firebase deploy --only functions
```

Esto desplegará las siguientes funciones:
- `getCatalog` - Obtener catálogo por slug
- `searchProducts` - Buscar productos
- `getCatalogStats` - Estadísticas de catálogo
- `onCatalogCreated` - Trigger al crear catálogo
- `onCatalogUpdated` - Trigger al actualizar catálogo

### URLs de las Functions

Después del deploy, obtendrás URLs como:

```
https://us-central1-tu-proyecto.cloudfunctions.net/getCatalog
https://us-central1-tu-proyecto.cloudfunctions.net/searchProducts
https://us-central1-tu-proyecto.cloudfunctions.net/getCatalogStats
```

## 7. Usar Firebase Hosting

Firebase Hosting es una alternativa a Vercel.

### Build del Proyecto

```bash
npm run build
```

### Desplegar en Firebase Hosting

```bash
firebase deploy --only hosting
```

Tu sitio estará disponible en:
```
https://tu-proyecto.web.app
https://tu-proyecto.firebaseapp.com
```

### Dominio Personalizado

1. Ve a **Hosting** en Firebase Console
2. Haz clic en "Agregar dominio personalizado"
3. Sigue las instrucciones para configurar DNS

## 8. Agregar Datos de Ejemplo

### Opción 1: Desde Firebase Console

1. Ve a **Firestore Database**
2. Haz clic en "Iniciar colección"
3. ID de colección: `catalogs`
4. Agrega un documento con los campos de la estructura

### Opción 2: Usando el Script

Crea un archivo `scripts/seedData.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  // Tus credenciales aquí
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedData() {
  // Crear catálogo
  const catalogRef = await addDoc(collection(db, 'catalogs'), {
    name: 'Mi Tienda Demo',
    slug: 'mi-tienda-demo',
    clientId: 'demo-client',
    description: 'Catálogo de ejemplo para demostración',
    theme: {
      primaryColor: '#0ea5e9',
      secondaryColor: '#0369a1'
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });

  console.log('Catálogo creado con ID:', catalogRef.id);

  // Crear productos
  const productsRef = collection(db, 'catalogs', catalogRef.id, 'products');

  await addDoc(productsRef, {
    name: 'Producto Demo 1',
    description: 'Este es un producto de demostración',
    price: 99.99,
    image: 'https://via.placeholder.com/400',
    category: 'Electrónica',
    stock: 10,
    sku: 'DEMO-001'
  });

  console.log('Datos de ejemplo agregados exitosamente');
}

seedData();
```

Ejecuta:

```bash
node scripts/seedData.js
```

## Comandos Útiles

```bash
# Ver logs de functions
firebase functions:log

# Ejecutar emuladores localmente
firebase emulators:start

# Deploy completo
firebase deploy

# Deploy solo functions
firebase deploy --only functions

# Deploy solo hosting
firebase deploy --only hosting

# Deploy solo firestore rules
firebase deploy --only firestore:rules
```

## Costos y Límites

Firebase tiene un plan gratuito (Spark) con límites:

- **Firestore**: 50,000 lecturas/día, 20,000 escrituras/día
- **Storage**: 5 GB de almacenamiento, 1 GB de descarga/día
- **Functions**: 125,000 invocaciones/mes, 40,000 GB-segundos/mes
- **Hosting**: 10 GB de almacenamiento, 360 MB/día de transferencia

Para producción, considera el plan Blaze (pago por uso).

## Seguridad

### Reglas de Firestore

Las reglas en `firestore.rules` permiten:
- ✅ Lectura pública de catálogos y productos
- ✅ Escritura solo para usuarios autenticados
- ✅ Clientes solo pueden ver sus propios datos

### Reglas de Storage

Las reglas en `storage.rules` permiten:
- ✅ Lectura pública de imágenes
- ✅ Subida solo para usuarios autenticados
- ✅ Límite de tamaño: 5MB para productos, 2MB para logos
- ✅ Solo imágenes

## Troubleshooting

### Error: Permission denied

**Problema**: Las reglas de Firestore están bloqueando el acceso.

**Solución**: Verifica que las reglas en `firestore.rules` estén desplegadas:
```bash
firebase deploy --only firestore:rules
```

### Error: Index required

**Problema**: Firestore necesita un índice compuesto.

**Solución**:
1. El error te dará un link para crear el índice
2. O despliega los índices: `firebase deploy --only firestore:indexes`

### Functions no se ejecutan

**Problema**: Las functions no responden.

**Solución**:
1. Verifica los logs: `firebase functions:log`
2. Asegúrate que estén desplegadas: `firebase deploy --only functions`
3. Verifica la región en la URL

## Próximos Pasos

- [ ] Configurar autenticación para panel de admin
- [ ] Implementar búsqueda full-text con Algolia
- [ ] Agregar Analytics
- [ ] Configurar Cloud Messaging para notificaciones
- [ ] Implementar backup automático de Firestore
