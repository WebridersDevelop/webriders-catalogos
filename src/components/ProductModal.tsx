import React from 'react';
import { Product } from '@/types';
import { ProductGallery } from './ProductGallery';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="grid md:grid-cols-2 gap-6 p-6">
            <div>
              <ProductGallery
                mainImage={product.image}
                images={product.images}
                productName={product.name}
              />
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                <h2 className="text-3xl font-bold text-gray-900">{product.name}</h2>
              </div>

              {product.price > 0 && (
                <div className="text-4xl font-bold text-primary-600">
                  ${product.price.toFixed(2)}
                </div>
              )}

              <div className="prose prose-sm">
                <p className="text-gray-600">{product.description}</p>
              </div>

              {/* Atributos personalizables */}
              {product.attributes && product.attributes.length > 0 && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Detalles del producto</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {product.attributes.map((attr, index) => (
                      <div key={index} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="text-gray-600 font-medium">{attr.name}:</span>
                        <span className="text-gray-900 text-right">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {((product.sku && product.sku.trim() !== '') || (product.stock !== undefined && product.stock > 0)) && (
                <div className="space-y-2 pt-4 border-t">
                  {product.sku && product.sku.trim() !== '' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">SKU:</span>
                      <span className="font-medium">{product.sku}</span>
                    </div>
                  )}
                  {product.stock !== undefined && product.stock > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Disponibilidad:</span>
                      <span className="font-medium text-green-600">
                        {product.stock} unidades
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4">
                <button className="btn-primary w-full text-lg">
                  Contactar para comprar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
