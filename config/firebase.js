const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');
const { getAnalytics, isSupported } = require('firebase/analytics');
const dotenv = require('dotenv');

dotenv.config();

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MESUREMENT_ID,
};

// Inicializar la aplicación de Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Inicializar Firebase Analytics (solo si es compatible)
let firebaseAnalytics;
isSupported().then((supported) => {
    if (supported) {
        firebaseAnalytics = getAnalytics(firebaseApp);
    } else {
        console.log("Firebase Analytics no es compatible en este entorno.");
    }
});

// Inicializar Firebase Storage
const storage = getStorage(firebaseApp);

// Exportar `storage` y `firebaseAnalytics`
module.exports = { storage, firebaseAnalytics };
