# Configuración de Google Drive para Subida de Imágenes

## Paso 1: Crear Google Apps Script

1. Ve a [Google Apps Script](https://script.google.com)
2. Haz clic en **"Nuevo proyecto"**
3. Copia el contenido del archivo `Code.gs` y pégalo en el editor
4. Guarda el proyecto (Ctrl+S) con un nombre como "Webriders Catalogos Upload"
5. **Nota**: El script creará automáticamente una carpeta llamada `Webriders_Catalogos_Imagenes` en tu Drive

## Paso 2: Desplegar como Web App

1. Haz clic en **"Implementar"** → **"Nueva implementación"**
2. Haz clic en el icono de engranaje ⚙️ junto a "Tipo"
3. Selecciona **"Aplicación web"**
4. Configura:
   - **Descripción**: "Upload de imágenes para Webriders Catalogos"
   - **Ejecutar como**: "Yo (tu email)"
   - **Quién tiene acceso**: "Cualquier persona"
5. Haz clic en **"Implementar"**
6. **AUTORIZA** la aplicación (Google te pedirá permisos)
   - Si dice "Esta app no está verificada", haz clic en "Avanzado" → "Ir a ... (no seguro)"
   - Autoriza los permisos de Drive

## Paso 3: Copiar URL del Web App

1. Una vez desplegado, verás una **URL del Web App**:
   ```
   https://script.google.com/macros/s/ABC123xyz.../exec
   ```
2. **Copia esta URL completa**

## Paso 4: Configurar en tu proyecto

1. Ve al archivo `.env.local` en tu proyecto
2. Agrega la siguiente línea:
   ```env
   VITE_GOOGLE_DRIVE_UPLOAD_URL=https://script.google.com/macros/s/TU_URL_AQUI/exec
   ```
3. Guarda el archivo
4. **Reinicia el servidor de desarrollo** (Ctrl+C y luego `npm run dev`)

## Paso 5: Probar

1. Ve a tu aplicación
2. Intenta subir una imagen
3. Deberías ver en la consola: "📤 Subiendo imagen a Google Drive..."
4. Si funciona, verás: "✅ Imagen subida a Google Drive exitosamente"

## Paso 6: Verificar carpeta en Drive

1. Ve a [Google Drive](https://drive.google.com)
2. Busca la carpeta `Webriders_Catalogos_Imagenes` (se crea automáticamente al subir la primera imagen)
3. Todas las imágenes del catálogo se guardarán aquí

## Solución de Problemas

### Error: "No se recibieron datos"
- Verifica que la URL del Web App sea correcta en `.env.local`
- Asegúrate de haber desplegado la última versión del script

### Error: "No tiene permisos"
- Ve a Google Apps Script → Implementar → Gestionar implementaciones
- Verifica que "Quién tiene acceso" sea "Cualquier persona"

### Las imágenes no se ven
- Verifica que el archivo en Drive tenga permisos de "Cualquiera con el enlace puede ver"
- El script debería configurar esto automáticamente

### Error de CORS
- Google Apps Script maneja CORS automáticamente
- Si ves este error, verifica que la URL del Web App sea correcta

## Ventajas de usar Google Drive

✅ **Gratis**: Sin límites de imágenes (dentro del espacio de Drive)
✅ **Confiable**: Servidor de Google, 99.9% uptime
✅ **Rápido**: CDN global de Google
✅ **Tuyo**: Tienes control total de las imágenes
✅ **Fácil gestión**: Puedes ver/eliminar imágenes desde Drive

## Límites

- **Espacio**: 15 GB gratis (compartido con Gmail y Fotos)
- **Tamaño de archivo**: Máximo 10 MB por imagen (configurado en el código)
- **Requests**: ~20,000 requests/día (más que suficiente)
