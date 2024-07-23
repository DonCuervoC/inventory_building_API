// This file manages the connection to a MongoDB database using MongoDB Atlas.
// It exports two reusable functions: connectToMongo to establish the connection,
// and getDb to get a reference to a specific database.

const { MongoClient } = require('mongodb');
const MYDB = process.env.DB_URL;


const url = MYDB;
const client = new MongoClient(url, { maxPoolSize: 20000 });

// Connexion réutilisable
const connectToMongo = async () => {
  try {
    await client.connect();
    console.log('Connected to the database');
    return client;
  } catch (error) {
    console.error('Error while connecting to the database:', error);
    // Add mail notification type error.
  }
};

const getDb = (dbName) => client.db(dbName);

module.exports = { connectToMongo, getDb };
