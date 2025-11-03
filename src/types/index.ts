export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string; // Imagen principal (primera de la galería)
  images?: string[]; // Galería de imágenes adicionales
  category: string;
  stock?: number;
  sku?: string;
}

export interface Catalog {
  id: string;
  name: string;
  slug: string;
  clientId: string;
  description: string;
  logo?: string;
  products: Product[];
  theme?: CatalogTheme;
  createdAt: Date;
  updatedAt: Date;
}

export interface CatalogTheme {
  primaryColor: string;
  secondaryColor: string;
  fontFamily?: string;
  bannerImage?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  catalogs: Catalog[];
}

export interface CatalogContextType {
  currentCatalog: Catalog | null;
  loading: boolean;
  error: string | null;
  loadCatalog: (slug: string) => Promise<void>;
}

// Tipos para autenticación y roles
export type UserRole = 'admin' | 'client';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  clientId?: string; // Solo para clientes, referencia a su documento en 'clients'
  createdAt: Date;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  isClient: () => boolean;
  canAccessCatalog: (catalogId: string) => boolean;
}

export interface ClientData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  catalogIds: string[]; // IDs de los catálogos que le pertenecen
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive';
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  catalogId: string; // Cada categoría pertenece a un catálogo
  color?: string; // Color para identificar visualmente la categoría
  createdAt: Date;
  updatedAt: Date;
}
