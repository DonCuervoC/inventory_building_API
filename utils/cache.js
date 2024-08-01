const NodeCache = require('node-cache');
const crypto = require('crypto'); 
const AES_KEY = process.env.AES_KEY;
const defaultTTL = 600; // Default TTL in seconds


// NodeCache instance
const myCache = new NodeCache({
    stdTTL: defaultTTL,
    checkperiod: 120
});

// Function to encrypt sensitive data with AES
function encryptData(data, key) {
  const iv = crypto.randomBytes(16); // Generate a random initialization vector
  const jsonString = JSON.stringify(data); // Convert the object to a JSON string
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let encryptedData = cipher.update(jsonString, 'utf8', 'hex');
  encryptedData += cipher.final('hex');
  return iv.toString('hex') + encryptedData; // Concatenate the IV with the encrypted data
}

// Function to decrypt sensitive data with AES
function decryptData(encryptedData, key) {
  const iv = Buffer.from(encryptedData.slice(0, 32), 'hex'); // Retrieve the IV from the encrypted data
  const encryptedText = encryptedData.slice(32); // Retrieve the encrypted data (after the IV)
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let decryptedData = decipher.update(encryptedText, 'hex', 'utf8');
  decryptedData += decipher.final('utf8');
  return JSON.parse(decryptedData); // Convert the JSON string back to a JavaScript object
}


// Function to set data in cache with an optional TTL
function setCache(key, data, ttl) {
    // Use the provided TTL or the default TTL if not specified
    const ttlToUse = ttl !== undefined ? ttl : defaultTTL;

    // console.log(ttlToUse);
    myCache.set(key, encryptData(data, AES_KEY), ttlToUse);
}

// Function to get data from cache
function getCache(key) {
    // Retrieve data from cache by key
    const data = myCache.get(key);
    // Return decrypted data and whether it was found in cache
    return [data ? decryptData(data, AES_KEY) : null, data !== undefined];
}

// Function to delete data from cache
function deleteCache(key) {
    // Remove data from cache by key
    myCache.del(key);
}

module.exports = {
    myCache,
    encryptData,
    decryptData,
    setCache,
    getCache,
    deleteCache
};
