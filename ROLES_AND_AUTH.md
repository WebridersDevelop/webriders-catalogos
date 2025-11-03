# Sistema de Roles y Autenticación

## Descripción General

El sistema soporta dos tipos de usuarios con diferentes permisos:

1. **Admin (Webriders)**: Control total del sistema
2. **Cliente (Tiendas)**: Solo gestiona sus propios catálogos

## Estructura de Usuarios

### Colección `users` en Firestore

```typescript
{
  uid: string;              // Firebase Auth UID
  email: string;            // Email del usuario
  displayName: string;      // Nombre para mostrar
  role: 'admin' | 'client'; // Rol del usuario
  clientId?: string;        // Solo para clientes - ID de su documento en 'clients'
  createdAt: timestamp;
}
```

### Colección `clients` en Firestore

```typescript
{
  id: string;               // ID del cliente
  name: string;             // Nombre del negocio/cliente
  email: string;            // Email de contacto
  phone?: string;           // Teléfono
  company?: string;         // Nombre de la empresa
  catalogIds: string[];     // Array de IDs de catálogos que posee
  createdAt: timestamp;
  updatedAt: timestamp;
  status: 'active' | 'inactive';
}
```

## Permisos por Rol

### 👨‍💼 Admin (Webriders)

**Puede hacer TODO:**

✅ Ver todos los catálogos de todos los clientes
✅ Crear nuevos catálogos para cualquier cliente
✅ Editar cualquier catálogo
✅ Eliminar cualquier catálogo
✅ Agregar/editar/eliminar productos en cualquier catálogo
✅ Crear y gestionar clientes
✅ Ver estadísticas globales
✅ Cambiar roles de usuarios

**Rutas accesibles:**
- `/admin` - Dashboard principal
- `/admin/catalogs` - Lista de todos los catálogos
- `/admin/catalogs/new` - Crear catálogo
- `/admin/catalogs/:id` - Editar catálogo
- `/admin/clients` - Gestionar clientes
- `/admin/clients/:id` - Editar cliente

### 🏪 Cliente (Tienda)

**Solo gestiona sus propios catálogos:**

✅ Ver sus propios catálogos
✅ Editar información de sus catálogos (nombre, descripción, tema)
✅ Agregar/editar/eliminar productos en sus catálogos
✅ Ver estadísticas de sus catálogos
✅ Actualizar su perfil

❌ NO puede ver catálogos de otros clientes
❌ NO puede crear nuevos catálogos (debe solicitarlo a admin)
❌ NO puede eliminar su cuenta
❌ NO puede cambiar su clientId

**Rutas accesibles:**
- `/client` - Dashboard del cliente
- `/client/catalogs/:id` - Gestionar su catálogo
- `/client/products/:catalogId` - Gestionar productos

## Flujo de Autenticación

### 1. Login

```typescript
// Usuario va a /login
// Ingresa email y password
await login(email, password);

// El sistema:
// 1. Autentica con Firebase Auth
// 2. Obtiene el documento del usuario desde /users/{uid}
// 3. Carga el rol del usuario
// 4. Redirige según el rol:
//    - Admin → /admin
//    - Client → /client
```

### 2. Verificación de Permisos

```typescript
// En cualquier operación sensible:

// Verificar si es admin
if (useAuth().isAdmin()) {
  // Permitir operación
}

// Verificar si puede acceder a un catálogo
if (useAuth().canAccessCatalog(catalogId)) {
  // Permitir acceso
}
```

### 3. Rutas Protegidas

```tsx
// Ejemplo en App.tsx
<Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

## Configuración Inicial

### Crear Usuario Admin

1. Crea el usuario en Firebase Authentication
2. Crea el documento en Firestore:

```javascript
// En Firebase Console o con script
db.collection('users').doc(uid).set({
  email: 'admin@webriders.com',
  displayName: 'Admin Webriders',
  role: 'admin',
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
});
```

### Crear Usuario Cliente

1. Admin crea el documento del cliente en `/clients`:

```javascript
const clientRef = await db.collection('clients').add({
  name: 'Mi Tienda',
  email: 'contacto@mitienda.com',
  phone: '+1234567890',
  catalogIds: [],
  status: 'active',
  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  updatedAt: firebase.firestore.FieldValue.serverTimestamp()
});

const clientId = clientRef.id;
```

2. Crea el usuario en Firebase Authentication

3. Crea el documento en `/users`:

```javascript
db.collection('users').doc(uid).set({
  email: 'contacto@mitienda.com',
  displayName: 'Mi Tienda',
  role: 'client',
  clientId: clientId, // Referencia al documento en /clients
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
});
```

## Reglas de Seguridad de Firestore

Las reglas implementadas garantizan que:

### Para Catálogos

```javascript
// ✅ Todos pueden LEER (público)
allow read: if true;

// ✅ Admin puede crear cualquier catálogo
allow create: if isAdmin();

// ✅ Admin puede editar/eliminar cualquier catálogo
// ✅ Cliente solo puede editar/eliminar SUS catálogos
allow update, delete: if isAdmin() || (isClient() && isOwnerOfCatalog(catalogId));
```

### Para Productos

```javascript
// ✅ Todos pueden LEER (público)
allow read: if true;

// ✅ Admin puede modificar cualquier producto
// ✅ Cliente solo puede modificar productos de SUS catálogos
allow create, update, delete: if isAdmin() || (isClient() && isOwnerOfCatalog(catalogId));
```

### Para Usuarios

```javascript
// ✅ Admin puede ver todos los usuarios
// ✅ Usuario puede ver su propio perfil
allow read: if isAdmin() || request.auth.uid == userId;

// ✅ Solo Admin puede crear/modificar usuarios
allow create, update: if isAdmin();

// ✅ Usuario puede actualizar su perfil (excepto rol y clientId)
allow update: if request.auth.uid == userId &&
  !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'clientId']);
```

## Modo Desarrollo (Sin Firebase)

Para facilitar el desarrollo, el sistema funciona sin Firebase usando datos mock:

```typescript
// En AuthContext.tsx
const USE_MOCK_AUTH = !import.meta.env.VITE_FIREBASE_API_KEY;

if (USE_MOCK_AUTH) {
  // Usuarios mock:
  // admin@webriders.com → Admin
  // cualquier_otro@email.com → Cliente
}
```

### Credenciales de prueba:

```
Admin:
  Email: admin@webriders.com
  Password: cualquier cosa (no se valida en mock)

Cliente:
  Email: cliente@tienda.com
  Password: cualquier cosa (no se valida en mock)
```

## API de AuthContext

```typescript
const {
  user,              // Usuario actual con rol
  loading,           // Estado de carga
  error,             // Errores
  login,             // (email, password) => Promise<void>
  logout,            // () => Promise<void>
  isAdmin,           // () => boolean
  isClient,          // () => boolean
  canAccessCatalog   // (catalogId) => boolean
} = useAuth();
```

## Casos de Uso Comunes

### 1. Crear catálogo nuevo (Admin)

```typescript
// Admin crea catálogo para un cliente
const newCatalog = {
  name: 'Catálogo Nueva Tienda',
  slug: 'nueva-tienda',
  clientId: 'client-123', // ID del cliente
  description: 'Descripción...',
  theme: {
    primaryColor: '#0ea5e9',
    secondaryColor: '#0369a1'
  }
};

await createCatalog(newCatalog);

// Actualizar lista de catálogos del cliente
await updateDoc(doc(db, 'clients', 'client-123'), {
  catalogIds: arrayUnion(newCatalogId)
});
```

### 2. Cliente edita su catálogo

```typescript
// Cliente solo puede editar catálogos donde catalog.clientId == user.clientId
const { user } = useAuth();

// Verificar propiedad
if (catalog.clientId === user.clientId) {
  await updateCatalog(catalogId, {
    name: 'Nuevo nombre',
    description: 'Nueva descripción'
  });
}
```

### 3. Agregar producto (ambos roles)

```typescript
const { user, canAccessCatalog } = useAuth();

if (canAccessCatalog(catalogId)) {
  await addProduct(catalogId, {
    name: 'Nuevo Producto',
    price: 99.99,
    // ...
  });
}
```

## Seguridad

### ⚠️ Importante

1. **Nunca confíes solo en el frontend**: Las reglas de Firestore son la verdadera seguridad
2. **Valida en ambos lados**: Frontend (UX) + Backend (Seguridad)
3. **Usa HTTPS siempre**: Especialmente en producción
4. **Rota credenciales**: Cambia passwords regularmente
5. **Audita accesos**: Revisa los logs de Firebase

### Mejores Prácticas

```typescript
// ✅ BUENO: Verificar permisos antes de mostrar UI
{isAdmin() && (
  <button onClick={deleteAllData}>
    Eliminar todo
  </button>
)}

// ❌ MALO: Confiar solo en ocultar el botón
<button
  onClick={deleteAllData}
  className={isAdmin() ? '' : 'hidden'}
>
  Eliminar todo
</button>
```

## Testing

### Test de Roles

```typescript
describe('Roles', () => {
  it('Admin puede ver todos los catálogos', async () => {
    const adminUser = { role: 'admin' };
    const catalogs = await getAllCatalogs(adminUser);
    expect(catalogs.length).toBeGreaterThan(0);
  });

  it('Cliente solo ve sus catálogos', async () => {
    const clientUser = { role: 'client', clientId: 'client-1' };
    const catalogs = await getUserCatalogs(clientUser);
    expect(catalogs.every(c => c.clientId === 'client-1')).toBe(true);
  });
});
```

## Troubleshooting

### Error: "Permission denied"

**Causa**: El usuario no tiene permisos según las reglas de Firestore

**Solución**:
1. Verifica que el documento en `/users/{uid}` existe
2. Verifica que el rol es correcto
3. Para clientes, verifica que `clientId` apunta al documento correcto
4. Revisa las reglas de Firestore

### Usuario no puede ver sus catálogos

**Causa**: `clientId` no coincide con `catalog.clientId`

**Solución**:
1. Verifica `/users/{uid}.clientId`
2. Verifica `/catalogs/{catalogId}.clientId`
3. Asegúrate que ambos IDs coinciden

### Redirect infinito después de login

**Causa**: Usuario sin rol definido o rol inválido

**Solución**:
1. Verifica que `/users/{uid}.role` existe y es 'admin' o 'client'
2. Limpia localStorage y vuelve a intentar
3. Revisa los logs de la consola

## Próximas Mejoras

- [ ] Implementar 2FA (autenticación de dos factores)
- [ ] Sistema de invitaciones por email
- [ ] Auditoría de acciones (logs)
- [ ] Roles adicionales (editor, viewer)
- [ ] Permisos granulares por catálogo
- [ ] Sesiones con expiración
- [ ] Rate limiting
