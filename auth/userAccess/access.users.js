const jwt = require("jsonwebtoken");
const { getDb } = require('../../mongoConnection');
const { isTokenRevoked } = require('../../utils/jwt');

const USERSCOLLECTION = process.env.USERSCOLLECTION;
const G_USER_COLLECTION = process.env.G_USER_COLLECTION;
const MAINDB = process.env.MYDATABASE;

const mainDb = getDb(MAINDB);
const userCollection = mainDb.collection(G_USER_COLLECTION);


function OwnerHasProperty(owner, propertyId) {
    try {

        return owner.properties.includes(propertyId);

    } catch (error) {
        console.error('Error in OwnerHasProperty:', error);
        return false;
    }
}

function RoleAuthEditProperty(user) {
    try {
        const hasRequiredRole = user.roles.some(role =>
            ['owner', 'admin', 'master'].includes(role)
        );

        return hasRequiredRole;

    } catch (error) {
        console.error('Error in AuthEditProperty:', error);
        return false;
    }
}



module.exports ={

    OwnerHasProperty,
    RoleAuthEditProperty
}