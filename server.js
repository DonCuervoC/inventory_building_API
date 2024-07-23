// Ce fichier configure et démarre un serveur Express pour une application Node.js.
// Il utilise plusieurs middleware tels que express, mongoose, passport, express-session, flash, cors, etc.
// La connexion à la base de données MongoDB est établie grâce à la fonction connectToMongo du fichier 'mongoConnection'.
// Les routes de l'application sont définies dans les fichiers 'routes/payments/payments.routes' et 'routes/projects/projects.routes'.
// Le serveur écoute sur le port défini par la variable d'environnement PORT ou sur le port 8000 par défaut.
require('dotenv').config(); // lecteur de variables d'environnement 

const express = require('express');
const mongoose = require('mongoose');
// const passport = require('passport');
// const session = require('express-session');
// const flash = require('connect-flash');
const cors = require('cors'); 
const { connectToMongo } = require('./mongoConnection');
// // const userRoutes = require('./routes/users/users.routes');
// const path = require('path');
// const ownerRoutes = require('./routes/owner/owner.routes');
// const tenantRoutes = require('./routes/tenants/tenants.routes');
// const contractRoutes = require('./routes/contracts/contracts.routes');
// const propertyRoutes = require('./routes/properties/properties.routes');
// const maintenanceRoutes = require('./routes/maintenance/maintenance.routes');
// const squareRoutes = require('./routes/square/square.routes');
// const inventoryRoutes = require('./routes/inventory/inventory.routes');
// const logger = require('./logger');
// const os = require('os');
// const geoip = require('geoip-lite');
// const fs = require('fs');
// const https = require('https');
const app = express();
const PORT = process.env.PORT || 8000;

connectToMongo();

// Express body parser
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Augmentez la limite selon vos besoins
app.use(express.json({ limit: '10mb' })); // Augmentez la limite selon vos besoins


// Express body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuration d'express-session
// app.use(session({
//     secret: 'votre_secret_session', // Remplacez par une chaîne aléatoire et sécurisée
//     resave: true,
//     saveUninitialized: true,
// }));

// Utilisation de CORS middleware
app.use(cors());


// Middleware pour la journalisation des requêtes (API traffic source control)
// app.use((req, res, next) => {

//     const ipAddress = req.ip || req.connection.remoteAddress;
//     // const ipAddress02 = getIpAddress();
//     const machineName = os.hostname();
//     const geo = geoip.lookup(req.ip);

//    // console.log('connection', { ip: ipAddress, machine: machineName, timestamp: new Date(), geo: geo });
//     // logger.verbose('connection', { ip: ipAddress, machine: machineName, timestamp: new Date(), geo: geo });
//     next();
// });

// Configuration pour utiliser les fichiers statiques du dossier "uploads".
//app.use("/Backend/uploads", express.static(path.join(__dirname, "uploads")));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// app.use('/users', require('./routes/users'));

// app.use('/owner',ownerRoutes);
// app.use('/tenant',tenantRoutes);
// app.use('/property',propertyRoutes);
// app.use('/contract',contractRoutes);
// app.use('/maintenance',maintenanceRoutes);
// app.use('/properties', propertyRoutes);
// app.use('/square', squareRoutes);
// app.use('/inventory', inventoryRoutes);


// Start the server HTTP
 app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));


// Configuration HTTPS 
// const options = {
//     key: fs.readFileSync('./key.pem'), // Path de la clé privée
//     cert: fs.readFileSync('./startHome_cert.crt') // Path du certificat SSL
// };

// // Start the server  HTTPS
// https.createServer(options, app).listen(PORT, () => {
//     console.log(`Serveur HTTPS démarré sur le port ${PORT}`);
// });


// Fonction permettant d'obtenir l'adresse IP de la machine requérante
// function getIpAddress() {
//     const interfaces = os.networkInterfaces();
//     for (const interfaceName in interfaces) {
//         const iface = interfaces[interfaceName];
//         if (iface && iface.length > 0) {
//             for (let i = 0; i < iface.length; i++) {
//                 const { address, family, internal } = iface[i];
//                 if (family === 'IPv4' && !internal) {
//                     return address;
//                 }
//             }
//         }
//     }
//     return '127.0.0.1';
// }
