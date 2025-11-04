import React from 'react';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  return (
    <div className="card group cursor-pointer" onClick={() => onViewDetails?.(product)}>
      <div className="relative overflow-hidden rounded-lg mb-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.stock !== undefined && product.stock > 0 && product.stock < 5 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Pocas unidades
          </span>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-500">{product.category}</p>
        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
        <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>

        {/* Mostrar primeros 2-3 atributos clave */}
        {product.attributes && product.attributes.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {product.attributes.slice(0, 3).map((attr, index) => (
              <div key={index} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                <span className="font-medium text-gray-700">{attr.name}:</span>
                <span className="text-gray-600">{attr.value}</span>
              </div>
            ))}
          </div>
        )}

        {(product.price > 0 || (product.sku && product.sku.trim() !== '')) && (
          <div className="flex items-center justify-between pt-2">
            {product.price > 0 && (
              <span className="text-2xl font-bold text-primary-600">
                ${product.price.toFixed(2)}
              </span>
            )}
            {product.sku && product.sku.trim() !== '' && (
              <span className="text-xs text-gray-400">SKU: {product.sku}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
