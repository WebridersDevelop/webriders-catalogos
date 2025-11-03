/**
 * Utilidad para subir imágenes a Cloudinary
 */

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Sube una imagen a Cloudinary
 */
const uploadToCloudinary = async (file: File): Promise<ImageUploadResult> => {
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.warn('⚠️ Cloudinary no configurado');
    return {
      success: false,
      error: 'Cloudinary no configurado. Verifica las variables de entorno.'
    };
  }

  try {
    console.log('📤 Subiendo imagen a Cloudinary...', {
      name: file.name,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      type: file.type
    });

    // Crear FormData para enviar el archivo
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'webriders-catalogos');

    // Subir a Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.secure_url) {
      console.log('✅ Imagen subida a Cloudinary:', result.secure_url);
      return {
        success: true,
        url: result.secure_url
      };
    } else {
      console.error('❌ Cloudinary retornó respuesta sin URL:', result);
      return {
        success: false,
        error: result.error?.message || 'Error desconocido de Cloudinary'
      };
    }

  } catch (error) {
    console.error('❌ Error al subir a Cloudinary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de conexión con Cloudinary'
    };
  }
};

/**
 * Sube una imagen principal (usa Cloudinary)
 */
export const uploadToImgur = async (file: File): Promise<ImageUploadResult> => {
  console.log('🔄 Iniciando subida de imagen...', {
    name: file.name,
    size: `${(file.size / 1024).toFixed(2)} KB`,
    type: file.type
  });

  // Subir a Cloudinary
  const cloudinaryResult = await uploadToCloudinary(file);

  if (cloudinaryResult.success && cloudinaryResult.url) {
    console.log('✅ Imagen subida exitosamente');
    return cloudinaryResult;
  }

  // Si Cloudinary falló, retornar error
  console.error('❌ Cloudinary no disponible:', cloudinaryResult.error);

  return {
    success: false,
    error: cloudinaryResult.error || 'Error al subir imagen. Por favor, intenta de nuevo.',
  };
};

/**
 * Valida que el archivo sea una imagen válida
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato de imagen no soportado. Use JPG, PNG, GIF o WebP.',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'La imagen es demasiado grande. Máximo 10MB.',
    };
  }

  return { valid: true };
};

/**
 * Comprime y sube una imagen
 */
export const compressAndUploadImage = async (file: File): Promise<ImageUploadResult> => {
  try {
    // Si la imagen es pequeña, no comprimir
    if (file.size < 1 * 1024 * 1024) { // Menos de 1MB
      return await uploadToImgur(file);
    }

    // Importación dinámica de la librería de compresión
    const imageCompression = await import('browser-image-compression').then(m => m.default);

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    const compressedFile = await imageCompression(file, options);
    console.log(`📦 Imagen comprimida: ${(file.size / 1024).toFixed(2)}KB → ${(compressedFile.size / 1024).toFixed(2)}KB`);

    return await uploadToImgur(compressedFile);
  } catch (error) {
    console.error('Error al comprimir imagen, usando original:', error);
    return await uploadToImgur(file);
  }
};
