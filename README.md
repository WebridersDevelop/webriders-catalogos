# Webriders Catálogos

Sistema de gestión de catálogos digitales multi-cliente con autenticación y administración avanzada.

## 🚀 Características

- **Multi-catálogo**: Un admin gestiona catálogos para múltiples clientes
- **Autenticación segura**: Firebase Authentication con roles (admin/client)
- **Gestión de productos**: CRUD completo con galería de imágenes múltiples
- **Categorías con colores**: Organización visual de productos
- **Campos opcionales**: Precio, SKU y stock opcionales por producto
- **Subida de imágenes**: Integración con Cloudinary
- **Vista pública**: Catálogos accesibles por slug único
- **Responsive**: Diseño adaptable a móviles y tablets

## 🛠️ Tecnologías

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Base de datos**: Firebase Firestore
- **Autenticación**: Firebase Auth
- **Hosting de imágenes**: Cloudinary
- **Routing**: React Router v6

## 📦 Instalación

\`\`\`bash
# Clonar repositorio
git clone https://github.com/WebridersDevelop/webriders-catalogos.git
cd webriders-catalogos

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales
\`\`\`

## ⚙️ Configuración

### Firebase

1. Crear proyecto en Firebase Console
2. Habilitar Authentication (Email/Password)
3. Crear base de datos Firestore
4. Copiar credenciales al .env.local

### Cloudinary

1. Crear cuenta en Cloudinary
2. Crear Upload Preset "Unsigned"
3. Copiar Cloud Name y Upload Preset al .env.local

## 🚀 Desarrollo

\`\`\`bash
# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build
\`\`\`

## 📱 Estructura del Proyecto

\`\`\`
src/
├── components/       # Componentes reutilizables
├── contexts/         # Contextos de React
├── pages/           # Páginas principales
│   ├── admin/       # Páginas del admin
│   └── client/      # Páginas del cliente
├── config/          # Configuración (Firebase, etc.)
├── types/           # Tipos de TypeScript
└── utils/           # Utilidades
\`\`\`

## 📄 Licencia

Todos los derechos reservados © 2025 Webriders
