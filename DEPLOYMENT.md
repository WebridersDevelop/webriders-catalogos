# Guía de Deployment en Vercel

## Opción 1: Deployment desde GitHub

### Paso 1: Subir a GitHub

```bash
git init
git add .
git commit -m "Initial commit: Webriders Catalogos"
git branch -M main
git remote add origin https://github.com/tu-usuario/webriders-catalogos.git
git push -u origin main
```

### Paso 2: Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "New Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Vite
5. Haz clic en "Deploy"

## Opción 2: Deployment con Vercel CLI

### Instalación

```bash
npm install -g vercel
```

### Deployment

```bash
# Login (primera vez)
vercel login

# Deploy en modo preview
vercel

# Deploy en producción
vercel --prod
```

## Configuración de Variables de Entorno

Si necesitas usar variables de entorno:

1. Crea un archivo `.env.local` (ya está en .gitignore)
2. En Vercel, ve a: Project Settings → Environment Variables
3. Agrega las variables necesarias

Ejemplo `.env.local`:
```env
VITE_API_URL=https://api.ejemplo.com
VITE_APP_NAME=Webriders Catalogos
```

## Configuración de Dominio Personalizado

1. Ve a Project Settings → Domains en Vercel
2. Agrega tu dominio personalizado
3. Configura los registros DNS según las instrucciones

## Build Commands (ya configurado)

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Verificación Post-Deployment

Después del deployment, verifica:

- ✅ La página principal carga correctamente
- ✅ Las rutas funcionan (`/catalogo/tienda-ejemplo`)
- ✅ Las imágenes y estilos cargan correctamente
- ✅ El routing funciona con URLs directas (gracias a vercel.json)

## Troubleshooting

### Problema: 404 en rutas

**Solución**: Asegúrate que `vercel.json` existe y contiene:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Problema: Estilos no cargan

**Solución**: Verifica que `index.css` tiene las directivas de Tailwind:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Problema: Error de TypeScript en build

**Solución**: Ejecuta localmente:
```bash
npm run lint
npm run build
```

## Actualizaciones Futuras

Para actualizar el sitio:

```bash
git add .
git commit -m "Descripción de cambios"
git push
```

Vercel automáticamente detectará los cambios y hará un nuevo deployment.

## Monitoring y Analytics

Vercel proporciona automáticamente:
- Analytics de tráfico
- Web Vitals
- Logs de errores
- Performance monitoring

Accede desde el dashboard del proyecto en Vercel.

## Rollback

Si necesitas volver a una versión anterior:

1. Ve a Deployments en Vercel
2. Encuentra el deployment anterior
3. Haz clic en los 3 puntos → "Promote to Production"
