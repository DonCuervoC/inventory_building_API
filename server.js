
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');

const cors = require('cors'); 
const { connectToMongo } = require('./mongoConnection');
// // const userRoutes = require('./routes/users/users.routes');
// const path = require('path');
const userRoutes = require('./routes/users/users.routes');
// const tenantRoutes = require('./routes/tenants/tenants.routes');
// const contractRoutes = require('./routes/contracts/contracts.routes');
const propertyRoutes = require('./routes/properties/properties.routes');
// const maintenanceRoutes = require('./routes/maintenance/maintenance.routes');
// const squareRoutes = require('./routes/square/square.routes');
// const inventoryRoutes = require('./routes/inventory/inventory.routes');
// const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 8000;
const APIVERSION = process.env.APIVERSION;

connectToMongo();

// Express body parser
app.use(express.urlencoded({ extended: true, limit: '10mb' })); 
app.use(express.json({ limit: '10mb' })); 

// Express body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(cors());


app.use(`/api/${APIVERSION}/users`, userRoutes);
app.use(`/api/${APIVERSION}/properties`, propertyRoutes);


// Start the server HTTP
 app.listen(PORT, () => console.log(`API running on port ${PORT}`));
