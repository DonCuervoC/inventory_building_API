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

// Init firebase application
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Analytics (only if supported)
let firebaseAnalytics;
isSupported().then((supported) => {
    if (supported) {
        firebaseAnalytics = getAnalytics(firebaseApp);
    } else {
        console.log("Firebase Analytics is not supported in this environment.");
    }
});

// Initialize Firebase Storage
const storage = getStorage(firebaseApp);


module.exports = { storage, firebaseAnalytics };
