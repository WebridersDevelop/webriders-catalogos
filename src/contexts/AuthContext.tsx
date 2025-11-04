import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { AuthContextType, User, UserRole } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Modo desarrollo: permite usar el sistema sin Firebase
const USE_MOCK_AUTH = !import.meta.env.VITE_FIREBASE_API_KEY;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (USE_MOCK_AUTH) {
      // En desarrollo sin Firebase, usuario mock como admin
      setUser({
        uid: 'mock-admin-uid',
        email: 'admin@webriders.com',
        displayName: 'Admin Mock',
        role: 'admin',
        createdAt: new Date()
      });
      setLoading(false);
      return;
    }

    // Listener de autenticación de Firebase
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          // Usuario autenticado, obtener sus datos de Firestore
          try {
            const userData = await getUserData(firebaseUser.uid);
            setUser(userData);
          } catch (err: any) {
            console.error('Error al cargar datos del usuario:', err);
            // Si el documento no existe o hay error de permisos, cerrar sesión
            if (err.code === 'permission-denied' || err.message?.includes('no encontrado')) {
              console.warn('Usuario sin documento en Firestore, cerrando sesión');
              await signOut(auth);
              setUser(null);
            } else {
              setError('Error al cargar datos del usuario');
              setUser(null);
            }
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error en onAuthStateChanged:', err);
        setError('Error al verificar autenticación');
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Obtener datos del usuario desde Firestore
   */
  const getUserData = async (uid: string): Promise<User> => {
    // Primero buscar en la colección 'users'
    const userDoc = await getDoc(doc(db, 'users', uid));

    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid,
        email: data.email,
        displayName: data.displayName,
        role: data.role as UserRole,
        clientId: data.clientId,
        createdAt: data.createdAt?.toDate() || new Date()
      };
    }

    // Si no existe, crear usuario por defecto (client)
    // En producción, esto debería ser manejado por un proceso de registro
    throw new Error('Usuario no encontrado en la base de datos');
  };

  /**
   * Login con email y password
   */
  const login = async (email: string, password: string): Promise<void> => {
    setError(null);
    setLoading(true);

    try {
      if (USE_MOCK_AUTH) {
        // Mock login para desarrollo
        await new Promise(resolve => setTimeout(resolve, 500));

        // Simular diferentes usuarios
        if (email === 'admin@webriders.com') {
          setUser({
            uid: 'mock-admin-uid',
            email: email,
            displayName: 'Admin Webriders',
            role: 'admin',
            createdAt: new Date()
          });
        } else {
          setUser({
            uid: 'mock-client-uid',
            email: email,
            displayName: 'Cliente Demo',
            role: 'client',
            clientId: 'client-1',
            createdAt: new Date()
          });
        }
        return;
      }

      // Login real con Firebase
      await signInWithEmailAndPassword(auth, email, password);
      // El listener onAuthStateChanged se encargará de actualizar el estado
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      setError(err.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = async (): Promise<void> => {
    try {
      if (USE_MOCK_AUTH) {
        setUser(null);
        return;
      }

      await signOut(auth);
      setUser(null);
    } catch (err: any) {
      console.error('Error al cerrar sesión:', err);
      setError(err.message || 'Error al cerrar sesión');
      throw err;
    }
  };

  /**
   * Verificar si el usuario es admin
   */
  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  /**
   * Verificar si el usuario es cliente
   */
  const isClient = (): boolean => {
    return user?.role === 'client';
  };

  /**
   * Verificar si el usuario puede acceder a un catálogo específico
   */
  const canAccessCatalog = (_catalogId: string): boolean => {
    // Admin puede acceder a todo
    if (isAdmin()) {
      return true;
    }

    // Cliente solo puede acceder a sus propios catálogos
    // Esto se verificará con una consulta a Firestore en producción
    // Por ahora retornamos true si tiene clientId
    return isClient() && !!user?.clientId;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        isAdmin,
        isClient,
        canAccessCatalog
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
