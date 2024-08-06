const jwt = require("jsonwebtoken");
const { getDb } = require('../../mongoConnection');
const { isTokenRevoked } = require('../../utils/jwt');

const USERSCOLLECTION = process.env.USERSCOLLECTION;
const G_USER_COLLECTION = process.env.G_USER_COLLECTION;
const MAINDB = process.env.MYDATABASE;

const mainDb = getDb(MAINDB);
const userCollection = mainDb.collection(G_USER_COLLECTION);

const msgAuthHeader = 'The request does not contain the authentication header';
const msgExpToken = 'The token has expired';
const msgInvToken = 'Invalid token';
const msgExpiredSession = 'The session has expired';
const msgServerError = 'Internal Server Error';


function ensureAuth(req, res, next) {
    try {
        if (!req.headers.authorization) {
            return res.status(403).send({ msg: msgAuthHeader });
        }
        const token = req.headers.authorization.replace("Bearer ", "");

        const payload = jwt.decode(token);

        const { exp } = payload;
        const currentData = new Date().getTime();

        if (exp <= currentData) {
            return res.status(403).send({ msg: msgExpToken});
        } else {
            req.user = payload;
            next();
        }

    } catch (error) {
        return res.status(400).send({ msg: msgInvToken });
    }
}

function ensureAuthOwner(req, res, next) {
    try {
        if (!req.headers.authorization) {
            return res.status(403).send({ msg: msgAuthHeader });
        }
        const token = req.headers.authorization.replace("Bearer ", "");
        
        const payload = jwt.decode(token);

        // Verificar si el token ha expirado
        const { exp } = payload;
        const currentData = new Date().getTime();
        
        if (exp <= currentData) {
            return res.status(403).send({ msg: msgExpToken });
        }

        // Verificar si el rol de 'owner' está presente en user_roles
        const hasRole = payload.user_roles.includes('owner');
        if (!hasRole) {
            return res.status(403).send({ msg: "User not authorized" });
        }

        // Si el token es válido y el rol es correcto, permitir el acceso
        req.user = payload;
        next();
        
    } catch (error) {
        return res.status(400).send({ msg: msgInvToken });
    }
}

function ensureAuthOwnerAdminMaster(req, res, next) {
    try {
        if (!req.headers.authorization) {
            return res.status(403).send({ msg: msgAuthHeader });
        }
        const token = req.headers.authorization.replace("Bearer ", "");
        
        const payload = jwt.decode(token);

        const { exp } = payload;
        const currentData = new Date().getTime();
        
        if (exp <= currentData) {
            return res.status(403).send({ msg: msgExpToken });
        }

        const hasRole = payload.user_roles.some(role =>
            ['owner', 'admin', 'master'].includes(role))

        if (!hasRole) {
            return res.status(403).send({ msg: "User not authorized" });
        }

        req.user = payload;
        next();
        
    } catch (error) {
        return res.status(400).send({ msg: msgInvToken });
    }
}

async function isActiveSession(req, res, next) {
    try {
        if (!req.headers.authorization) {
            return res.status(403).send({ msg: msgAuthHeader});
        }
        const token = req.headers.authorization.replace("Bearer ", "");
        const tokenAlreadyRevoked = await isTokenRevoked(token);

        if (tokenAlreadyRevoked) {
            return res.status(401).json({ msg: msgExpiredSession });
        }
        
        next();

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: msgServerError, error: error });
    }
}

async function isCompletedUser(req, res, next) {
    try {
        if (!req.headers.authorization) {
            return res.status(403).send({ msg: msgAuthHeader });
        }
        const token = req.headers.authorization.replace("Bearer ", "");
        const tokenAlreadyRevoked = await isTokenRevoked(token);

        if (tokenAlreadyRevoked) {
            return res.status(401).json({ msg: msgExpiredSession });
        }

        const user = await userCollection.updateOne({ "_id": loggedInUser._id });

        if (!user) {
            return res.status(403).send({ msg: "No records found." });
        }

        if (!user.allFieldsComplete) {
            return res.status(403).send({ msg: "The user has not completed all of their registration." });
        }

        next();

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: msgServerError, error: error });
    }
}

module.exports ={
    ensureAuth,
    isActiveSession,
    isCompletedUser,
    ensureAuthOwner,
    ensureAuthOwnerAdminMaster
}