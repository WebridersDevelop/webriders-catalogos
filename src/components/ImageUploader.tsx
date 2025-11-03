import React, { useState, useRef } from 'react';
import { uploadToImgur, validateImageFile, compressAndUploadImage, ImageUploadResult } from '@/utils/imageUpload';

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  onUploadError?: (error: string) => void;
  buttonText?: string;
  showPreview?: boolean;
  useCompression?: boolean;
  currentImage?: string;
  allowMultiple?: boolean; // Nueva prop para permitir selección múltiple
  onMultipleUploadComplete?: (urls: string[]) => void; // Callback para múltiples URLs
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadComplete,
  onUploadError,
  buttonText = 'Subir Imagen',
  showPreview = true,
  useCompression = true,
  currentImage,
  allowMultiple = false,
  onMultipleUploadComplete,
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Limpiar errores previos
    setError(null);
    setUploadProgress('');

    // Si es selección múltiple
    if (allowMultiple && files.length > 1) {
      await handleMultipleFiles(files);
    } else {
      // Comportamiento original para un solo archivo
      await handleSingleFile(files[0]);
    }
  };

  const handleSingleFile = async (file: File) => {
    // Validar archivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Archivo inválido');
      if (onUploadError) onUploadError(validation.error || 'Archivo inválido');
      return;
    }

    // Crear preview
    if (showPreview) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    // Subir imagen
    setUploading(true);
    try {
      const result: ImageUploadResult = useCompression
        ? await compressAndUploadImage(file)
        : await uploadToImgur(file);

      if (result.success && result.url) {
        setUploadedUrl(result.url);
        onUploadComplete(result.url);
        setError(null);
      } else {
        setError(result.error || 'Error al subir imagen');
        if (onUploadError) onUploadError(result.error || 'Error al subir imagen');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      if (onUploadError) onUploadError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleMultipleFiles = async (files: FileList) => {
    setUploading(true);
    const uploadedUrls: string[] = [];
    const fileArray = Array.from(files);
    const totalFiles = fileArray.length;

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setUploadProgress(`Subiendo imagen ${i + 1} de ${totalFiles}...`);

        // Validar archivo
        const validation = validateImageFile(file);
        if (!validation.valid) {
          console.warn(`Archivo ${file.name} inválido:`, validation.error);
          continue;
        }

        // Subir imagen
        const result: ImageUploadResult = useCompression
          ? await compressAndUploadImage(file)
          : await uploadToImgur(file);

        if (result.success && result.url) {
          uploadedUrls.push(result.url);
        } else {
          console.error(`Error subiendo ${file.name}:`, result.error);
        }

        // Delay de 1 segundo entre cada subida para evitar rate limits
        if (i < fileArray.length - 1) {
          setUploadProgress(`Esperando para subir imagen ${i + 2}...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (uploadedUrls.length > 0) {
        // Notificar con todas las URLs
        if (onMultipleUploadComplete) {
          onMultipleUploadComplete(uploadedUrls);
        } else {
          // Fallback: notificar una por una
          uploadedUrls.forEach(url => onUploadComplete(url));
        }
        setUploadProgress(`✅ ${uploadedUrls.length} de ${totalFiles} imágenes subidas`);
      } else {
        setError('No se pudieron subir las imágenes');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      if (onUploadError) onUploadError(errorMessage);
    } finally {
      setUploading(false);
      // Limpiar el progreso después de 3 segundos
      setTimeout(() => setUploadProgress(''), 3000);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setUploadedUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onUploadComplete(''); // Notificar que se removió
  };

  return (
    <div className="space-y-4">
      {/* Botón de subida */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
          multiple={allowMultiple}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-white font-medium">
            {uploading ? (uploadProgress || 'Subiendo...') : buttonText}
          </span>
        </button>
        {allowMultiple && !uploading && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Puedes seleccionar múltiples imágenes a la vez
          </p>
        )}
      </div>

      {/* Preview de la imagen */}
      {showPreview && preview && (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="max-w-xs max-h-48 rounded-lg border-2 border-gray-200 object-cover"
          />
          {uploadedUrl && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              title="Remover imagen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* URL de la imagen subida */}
      {uploadedUrl && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium mb-1">✅ Imagen subida exitosamente</p>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={uploadedUrl}
              readOnly
              className="flex-1 px-2 py-1 text-xs bg-white border border-green-300 rounded font-mono"
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(uploadedUrl);
                alert('URL copiada al portapapeles');
              }}
              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Copiar
            </button>
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">❌ {error}</p>
        </div>
      )}

      {/* Barra de progreso */}
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary-600 h-2 rounded-full animate-pulse"
            style={{ width: '100%' }}
          ></div>
        </div>
      )}
    </div>
  );
};
