/**
 * Script para crear usuario admin en Firebase
 *
 * IMPORTANTE: Este script es para propósitos de desarrollo
 * En producción, usa Firebase Admin SDK
 *
 * Uso:
 * 1. Habilita Authentication en Firebase Console
 * 2. Habilita Firestore en Firebase Console
 * 3. Ejecuta: node scripts/createAdminUser.js
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Configuración de Firebase (obtener de .env.local)
const firebaseConfig = {
  apiKey: "AIzaSyBLykIgeKo5PH310AMV3T9clHrU3iKbDpg",
  authDomain: "webriders-catalogos.firebaseapp.com",
  projectId: "webriders-catalogos",
  storageBucket: "webriders-catalogos.firebasestorage.app",
  messagingSenderId: "938907472899",
  appId: "1:938907472899:web:532b0fc404edea386c6a36"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Crear usuario admin
 */
async function createAdminUser() {
  const adminEmail = 'admin@webriders.com';
  const adminPassword = 'Admin123456'; // Cambiar por una contraseña segura

  try {
    console.log('🔄 Creando usuario en Firebase Authentication...');

    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      adminEmail,
      adminPassword
    );

    const user = userCredential.user;
    console.log('✅ Usuario creado en Authentication');
    console.log(`   UID: ${user.uid}`);
    console.log(`   Email: ${user.email}`);

    // Crear documento en Firestore
    console.log('\n🔄 Creando documento en Firestore...');

    await setDoc(doc(db, 'users', user.uid), {
      email: adminEmail,
      displayName: 'Admin Webriders',
      role: 'admin',
      createdAt: serverTimestamp()
    });

    console.log('✅ Documento creado en Firestore (users/' + user.uid + ')');

    console.log('\n🎉 ¡Usuario admin creado exitosamente!');
    console.log('\n📝 Credenciales de acceso:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña en producción');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error al crear usuario:', error);

    if (error.code === 'auth/email-already-in-use') {
      console.log('\n💡 El usuario ya existe. Intentando solo crear documento en Firestore...');

      try {
        // Si el usuario ya existe, intenta actualizar el documento
        const uid = prompt('Ingresa el UID del usuario existente: ');

        await setDoc(doc(db, 'users', uid), {
          email: adminEmail,
          displayName: 'Admin Webriders',
          role: 'admin',
          createdAt: serverTimestamp()
        });

        console.log('✅ Documento actualizado en Firestore');
      } catch (firestoreError) {
        console.error('❌ Error al crear documento en Firestore:', firestoreError);
      }
    }

    process.exit(1);
  }
}

/**
 * Crear usuario cliente de ejemplo
 */
async function createClientUser() {
  const clientEmail = 'cliente@tienda.com';
  const clientPassword = 'Cliente123456';

  try {
    console.log('\n🔄 Creando usuario cliente en Firebase Authentication...');

    // Primero crear el documento del cliente
    console.log('🔄 Creando cliente en Firestore...');
    const clientDocRef = doc(db, 'clients', 'client-demo-1');

    await setDoc(clientDocRef, {
      name: 'Tienda Demo',
      email: clientEmail,
      phone: '+1234567890',
      company: 'Tienda Demo SA',
      catalogIds: [],
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('✅ Cliente creado en Firestore');

    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      clientEmail,
      clientPassword
    );

    const user = userCredential.user;
    console.log('✅ Usuario cliente creado en Authentication');

    // Crear documento de usuario
    await setDoc(doc(db, 'users', user.uid), {
      email: clientEmail,
      displayName: 'Tienda Demo',
      role: 'client',
      clientId: 'client-demo-1',
      createdAt: serverTimestamp()
    });

    console.log('✅ Documento de usuario creado en Firestore');

    console.log('\n🎉 ¡Usuario cliente creado exitosamente!');
    console.log('\n📝 Credenciales de acceso:');
    console.log(`   Email: ${clientEmail}`);
    console.log(`   Password: ${clientPassword}`);

  } catch (error) {
    console.error('\n❌ Error al crear usuario cliente:', error);
  }
}

// Ejecutar
console.log('🚀 Iniciando creación de usuarios...\n');

createAdminUser()
  .then(() => {
    console.log('\n───────────────────────────────────\n');
    return createClientUser();
  })
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error general:', error);
    process.exit(1);
  });
