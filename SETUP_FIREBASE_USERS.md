# 🔥 Guía: Crear Usuarios Admin en Firebase

## Opción 1: Usar Firebase Console (Recomendado para empezar)

### Paso 1: Habilitar Authentication

1. Ve a: https://console.firebase.google.com/project/webriders-catalogos/authentication
2. Click en **"Get started"** o **"Comenzar"**
3. En **"Sign-in method"**:
   - Click en **"Email/Password"**
   - Activa la opción **"Email/Password"**
   - Click en **"Save"**

### Paso 2: Habilitar Firestore

1. Ve a: https://console.firebase.google.com/project/webriders-catalogos/firestore
2. Click en **"Create database"**
3. Selecciona modo: **"Start in production mode"** (deployaremos las reglas después)
4. Ubicación: **"us-central (Iowa)"** (o la más cercana)
5. Click en **"Enable"**

### Paso 3: Crear Usuario Admin

1. Ve a: https://console.firebase.google.com/project/webriders-catalogos/authentication/users
2. Click en **"Add user"**
3. Ingresa:
   - **Email:** `admin@webriders.com`
   - **Password:** `Admin123456` (o la que prefieras, mínimo 6 caracteres)
4. Click en **"Add user"**
5. **COPIA el UID** que se genera (lo necesitarás en el siguiente paso)

### Paso 4: Crear Documento de Usuario en Firestore

1. Ve a: https://console.firebase.google.com/project/webriders-catalogos/firestore/data
2. Click en **"Start collection"**
3. **Collection ID:** `users`
4. Click en **"Next"**
5. **Document ID:** Pega el UID que copiaste
6. Agrega los siguientes campos:

```
Campo            Tipo        Valor
─────────────────────────────────────────────────
email            string      admin@webriders.com
displayName      string      Admin Webriders
role             string      admin
createdAt        timestamp   (click en el icono del reloj para agregar timestamp actual)
```

7. Click en **"Save"**

### Paso 5: Crear Usuario Cliente (Opcional)

Repite los pasos 3 y 4 con:

**En Authentication:**
- Email: `cliente@tienda.com`
- Password: `Cliente123456`

**En Firestore - Primero crear documento del cliente:**

1. Nueva colección: `clients`
2. Document ID: `client-demo-1`
3. Campos:

```
Campo            Tipo        Valor
─────────────────────────────────────────────────
name             string      Tienda Demo
email            string      cliente@tienda.com
phone            string      +1234567890
company          string      Tienda Demo SA
catalogIds       array       [] (array vacío)
status           string      active
createdAt        timestamp   (timestamp actual)
updatedAt        timestamp   (timestamp actual)
```

**Luego en users:**

1. Colección: `users`
2. Document ID: (el UID del usuario cliente que creaste)
3. Campos:

```
Campo            Tipo        Valor
─────────────────────────────────────────────────
email            string      cliente@tienda.com
displayName      string      Tienda Demo
role             string      client
clientId         string      client-demo-1
createdAt        timestamp   (timestamp actual)
```

### Paso 6: Deployar Reglas de Seguridad

Abre una terminal en el proyecto y ejecuta:

```bash
# Instalar Firebase CLI (si no lo tienes)
npm install -g firebase-tools

# Login
firebase login

# Inicializar proyecto (solo primera vez)
firebase init

# Selecciona:
# - Firestore: Configure security rules and indexes files
# - Storage: Configure security rules file

# Cuando pregunte por archivos, usa los que ya existen:
# - firestore.rules (ya existe)
# - firestore.indexes.json (ya existe)
# - storage.rules (ya existe)

# Deploy reglas
firebase deploy --only firestore:rules,storage
```

---

## Opción 2: Usar Script Automatizado

### Requisitos

1. Authentication habilitado
2. Firestore habilitado

### Ejecutar Script

```bash
node scripts/createAdminUser.js
```

El script creará automáticamente:
- ✅ Usuario admin en Authentication
- ✅ Documento en Firestore users/
- ✅ Usuario cliente de ejemplo
- ✅ Documento del cliente en clients/

---

## ✅ Verificar que Todo Funciona

### 1. Verificar Authentication

Ve a: https://console.firebase.google.com/project/webriders-catalogos/authentication/users

Deberías ver:
- ✅ admin@webriders.com
- ✅ cliente@tienda.com (si lo creaste)

### 2. Verificar Firestore

Ve a: https://console.firebase.google.com/project/webriders-catalogos/firestore/data

Deberías ver colecciones:
- ✅ `users` (con documentos de admin y cliente)
- ✅ `clients` (con documento del cliente demo)

### 3. Probar Login

1. Ve a: http://localhost:3001/login

2. Prueba credenciales de admin:
   ```
   Email: admin@webriders.com
   Password: Admin123456
   ```

3. Deberías ser redirigido a: http://localhost:3001/admin

4. Cierra sesión y prueba con cliente:
   ```
   Email: cliente@tienda.com
   Password: Cliente123456
   ```

5. Deberías ser redirigido a: http://localhost:3001/client

---

## 🎯 Resumen de Credenciales

### Admin (Webriders)
```
Email: admin@webriders.com
Password: Admin123456
URL: http://localhost:3001/admin
```

### Cliente (Tienda Demo)
```
Email: cliente@tienda.com
Password: Cliente123456
URL: http://localhost:3001/client
```

---

## 🔒 Seguridad

### ⚠️ IMPORTANTE en Producción:

1. **Cambia las contraseñas** por unas más seguras
2. **Activa 2FA** en Firebase Console
3. **No compartas** las credenciales de admin
4. **Usa variables de entorno** para secrets
5. **Revisa los logs** de acceso regularmente

### Cambiar Contraseña

En Firebase Console:
1. Authentication > Users
2. Click en el usuario
3. Click en **"Reset password"**
4. Elige opción y confirma

---

## 🚨 Troubleshooting

### Error: "Email already in use"

El usuario ya existe. Opciones:
1. Usa otro email
2. Elimina el usuario existente y créalo de nuevo
3. Solo crea el documento en Firestore con el UID existente

### Error: "Permission denied" al crear documento

Las reglas de Firestore están bloqueando la escritura. Opciones:
1. Temporalmente cambia las reglas a modo test (permite todo por 30 días)
2. Deploy las reglas correctas con el CLI

### Error: "Password should be at least 6 characters"

Firebase requiere mínimo 6 caracteres para contraseñas.

### No puedo hacer login

Verifica:
1. ✅ Usuario existe en Authentication
2. ✅ Documento existe en Firestore users/{uid}
3. ✅ El campo `role` está correcto ('admin' o 'client')
4. ✅ Para clientes, el campo `clientId` existe
5. ✅ Las credenciales son correctas

---

## 📚 Referencias

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [ROLES_AND_AUTH.md](./ROLES_AND_AUTH.md) - Sistema de roles completo
