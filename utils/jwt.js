const jwt = require("jsonwebtoken");

const { getDb } = require('../mongoConnection');

const MAINDB = process.env.MYDATABASE;
const JWTSTKEY = process.env.JWTSTKEY;
const TKNRVKCOLLECTION = process.env.TKNRVKCOLLECTION;

function createAccessToken(user) {

    const expToken = new Date();

    expToken.setFullYear(expToken.getFullYear() + 1);

    const payload = {
        token_type: "access", 
        access_type: "permanent",
        user_id: user._id, 
        user_roles: user.roles,
        iat: Date.now(),
        exp: expToken.getTime(),
    };

    return jwt.sign(payload, JWTSTKEY);
}

function createTemporalToken(user) {

    const currentDate = new Date(); 
    const expToken = new Date(currentDate);
    expToken.setDate(expToken.getDate() + 15);

    const payload = {
        token_type: "access", 
        access_type: "temporary",
        user_id: user._id, 
        iat: Date.now(), 
        exp: expToken.getTime(),
    };

    return jwt.sign(payload, JWTSTKEY);
}

async function revokeToken(token) {
    try {

        let msg;
        const tokenAlreadyRevoked = await isTokenRevoked(token);

        if (tokenAlreadyRevoked) {
            msg = 'Token already revoked';
            return { completed: false, msg: msg };
        }
        else {
            const mainDb = getDb(`${MAINDB}`);
            const tknCollection = mainDb.collection(TKNRVKCOLLECTION);
            const insertResult = await tknCollection.insertOne({ tkn: token });

            if (!insertResult || !insertResult.acknowledged) {
                msg = 'Revoked Token insertion error';
                return { completed: false, msg: msg };
            }

            msg = 'Logout successful';
            return { completed: true, msg: msg };
        }
    } catch (error) {
        console.error("Error revoking token:", error);
    }
}


async function revokeToken01(token) {
    try {
        let msg;

        const tokenAlreadyRevoked = await isTokenRevoked(token);

        if (tokenAlreadyRevoked) {
            // console.log('Token already revoked');
            msg = 'Token already revoked';
            return { completed: false, msg: msg };
        } else {
            const mainDb = getDb(`${MAINDB}`);
            const tknCollection = mainDb.collection(TKNRVKCOLLECTION);

            const insertResult = await tknCollection.insertOne({ tkn: token });

            if (!insertResult || !insertResult.acknowledged) {
                // console.log('Revoked Token insertion error');
                msg = 'Revoked Token insertion error';
                return { completed: false, msg: msg };
            }

            // console.log('Logout successful');
            msg = 'Logout successful';
            return { completed: true, msg: msg };
        }

    } catch (error) {
        console.error("Error revoking token:", error);
        return { completed: false, msg: "Internal server error" }; // Asegúrate de retornar un mensaje en caso de error
    }
}


async function isTokenRevoked(token) {
    try {
        const mainDb = getDb(`${MAINDB}`);
        const tknCollection = mainDb.collection(TKNRVKCOLLECTION);

        const tokenFound = await tknCollection.findOne({ tkn: token });

        return tokenFound != null;
    } catch (error) {
        console.error("Error verifying token:", error);
        return false;
    }
}


async function removeRevokedTokens() {
    try {

        const mainDb = getDb(MAINDB);

        const tknCollection = mainDb.collection(TKNRVKCOLLECTION);

        const deleteResult = await tknCollection.deleteMany({});

        console.log(`Deletion of revoked ${deleteResult.deletedCount} tokens has been completed.`);

        return true;
    } catch (error) {
        console.error("Error deleting revoked tokens : ", error);
        return false;
    }
}


function createRefreshToken(user) {

    const expToken = new Date();

    expToken.setFullYear(expToken.getFullYear() + 1);

    const payload = {
        token_type: "refresh",
        user_id: user._id, 
        iat: Date.now(), 
        exp: expToken.getTime(), 
    };

    return jwt.sign(payload, JWTSTKEY);
}

// Obtenir les données du token
function decoded(token) {
    return jwt.decode(token, JWTSTKEY, true);
}

module.exports = {
    createAccessToken,
    revokeToken,
    decoded,
    removeRevokedTokens,
    createRefreshToken,
    isTokenRevoked,
    createTemporalToken
};