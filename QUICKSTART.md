# 🚀 Inicio Rápido - Webriders Catálogos

Guía rápida para poner en marcha el proyecto en 5 minutos.

## Requisitos Previos

- Node.js 18+ instalado
- npm o yarn
- Cuenta de Firebase (opcional para desarrollo)
- Cuenta de Vercel (opcional para deployment)

## 1. Clonar e Instalar

```bash
# Clonar el repositorio (o descargar)
git clone <url-del-repo> webriders-catalogos
cd webriders-catalogos

# Instalar dependencias
npm install
```

## 2. Modo Desarrollo (Sin Firebase)

El proyecto funciona sin configuración de Firebase usando datos mock:

```bash
npm run dev
```

Abre http://localhost:3000

### Rutas disponibles:
- `/` - Página principal
- `/catalogo/tienda-ejemplo` - Catálogo de ejemplo
- `/catalogo/mi-negocio` - Otro catálogo de ejemplo

## 3. Configurar Firebase (Producción)

### A. Crear Proyecto Firebase

1. Ve a https://console.firebase.google.com/
2. Crea un nuevo proyecto
3. Habilita Firestore Database
4. Habilita Storage
5. Crea una Web App y copia las credenciales

### B. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env.local

# Editar .env.local con tus credenciales
```

Tu archivo `.env.local` debe verse así:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:xxxxx
```

### C. Deploy Firebase Rules y Functions

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar (primera vez)
firebase init

# Deploy reglas y functions
cd functions && npm install && cd ..
firebase deploy
```

## 4. Agregar Datos de Prueba

### Opción A: Manualmente desde Firebase Console

1. Ve a Firestore Database
2. Crea colección `catalogs`
3. Agrega un documento:

```json
{
  "name": "Mi Primera Tienda",
  "slug": "mi-primera-tienda",
  "clientId": "cliente-1",
  "description": "Descripción de mi tienda",
  "theme": {
    "primaryColor": "#0ea5e9",
    "secondaryColor": "#0369a1"
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

4. Dentro del documento, crea sub-colección `products`
5. Agrega productos:

```json
{
  "name": "Producto de Ejemplo",
  "description": "Descripción del producto",
  "price": 99.99,
  "image": "https://via.placeholder.com/400",
  "category": "Electrónica",
  "stock": 10,
  "sku": "PROD-001"
}
```

### Opción B: Script Automático

Crea `scripts/seed.js`:

```javascript
// Ver código en FIREBASE_SETUP.md
```

## 5. Deploy a Producción

### Deploy Frontend en Vercel

#### Opción A: Con GitHub

1. Sube tu proyecto a GitHub
2. Ve a https://vercel.com
3. Importa el repositorio
4. Agrega las variables de entorno de Firebase
5. Deploy!

#### Opción B: Con CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

No olvides configurar las variables de entorno en Vercel.

## Comandos Útiles

```bash
# Desarrollo
npm run dev              # Dev server en localhost:3000
npm run build            # Build para producción
npm run preview          # Preview del build
npm run lint             # Check de TypeScript

# Firebase
firebase login           # Login a Firebase
firebase deploy          # Deploy completo
firebase emulators:start # Emuladores locales

# Vercel
vercel                   # Preview deployment
vercel --prod            # Production deployment
```

## Estructura Básica

```
src/
├── pages/              # Páginas principales
│   ├── HomePage.tsx    # Landing page
│   ├── CatalogPage.tsx # Vista de catálogo
│   └── NotFoundPage.tsx
├── components/         # Componentes reutilizables
├── contexts/           # React Context
├── services/           # Servicios Firebase
└── types/              # TypeScript types
```

## Solución de Problemas

### El servidor no inicia

```bash
# Limpiar node_modules
rm -rf node_modules package-lock.json
npm install
```

### Error de Tailwind CSS

```bash
# Reinstalar dependencias de Tailwind
npm install -D tailwindcss@latest @tailwindcss/postcss@latest
```

### Firebase no conecta

- Verifica que las variables de entorno estén bien copiadas
- Asegúrate de tener el prefijo `VITE_` en cada variable
- Reinicia el servidor de desarrollo

### Build falla

```bash
# Verificar errores de TypeScript
npm run lint

# Si hay errores, revisa los archivos mencionados
```

## Próximos Pasos

1. ✅ Proyecto funcionando localmente
2. 📝 Configura Firebase para persistencia
3. 🎨 Personaliza los colores en `tailwind.config.js`
4. 📦 Agrega tus propios productos
5. 🚀 Deploy a producción
6. 📊 Configura Analytics

## Recursos

- [Documentación completa](./README.md)
- [Guía de Firebase](./FIREBASE_SETUP.md)
- [Guía de Deployment](./DEPLOYMENT.md)
- [Resumen del Proyecto](./PROJECT_SUMMARY.md)

## Soporte

¿Problemas o preguntas?
- Revisa la documentación
- Abre un issue en GitHub
- Consulta los logs del navegador (F12)

---

**¡Listo!** Ya tienes Webriders Catálogos funcionando. 🎉
