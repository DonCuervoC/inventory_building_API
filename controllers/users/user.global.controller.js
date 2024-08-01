// const User = require("../models/user");
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

const { getDb } = require('../../mongoConnection');
const { validateRegisterOwnerFields, validateUpdateOwnerFields } = require('../../utils/validatorFields');
const { uploadFile, uploadImage, deleteFile } = require('../../utils/uploadFile');
const { setCache, getCache, deleteCache } = require('../../utils/cache.js');

const logger = require('../../utils/logger');
const jwt = require("../../utils/jwt.js");

// const image = require("../utils/image");

const Owner = require('../../modeles/users/user.owner.model');
const User = require('../../modeles/users/user.global')


const AES_KEY = process.env.AES_KEY;
const TENNANTS_COLLECTION = process.env.TENNANTS_COLLECTION;
const PROPERTIES_COLLECTION = process.env.PROPERTIES_COLLECTION;
const OWNERS_COLLECTION = process.env.OWNERS_COLLECTION;
const G_USER_COLLECTION = process.env.G_USER_COLLECTION;
const MYDATABASE = process.env.MYDATABASE;


const CREATED_STATUS = process.env.CREATED_STATUS;
const DELETED_STATUS = process.env.DELETED_STATUS;
const WATCHED_STATUS = process.env.WATCHED_STATUS;
const UPDATED_STATUS = process.env.UPDATED_STATUS;
const ERROR_STATUS = process.env.ERROR_STATUS;


const mainDb = getDb(`${MYDATABASE}`);
const userCollection = mainDb.collection(G_USER_COLLECTION);
// const ownerCollection = mainDb.collection(OWNERS_COLLECTION);

const Register = (role) => async (req, res) => {
    try {
     
        const userData = req.body;

        userData.email = userData.email.toLowerCase();

        await validateRegisterOwnerFields(req);

        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ errors: validationErrors.array() });
        }

        let userExisting = await userCollection.findOne({ email: userData.email });

        if (userExisting) {
            return res.status(400).json({ msg: "Error new user: email already exist" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        userData.password = hashedPassword;

        const newUser = createUserByRole(role, userData);

        const insertResult = await userCollection.insertOne(newUser);

        if (!insertResult.acknowledged) {
            return res.status(500).json({ msg: "New Owner : error while inserting new data" });
        }

        const newOwnerId = insertResult.insertedId.toString();

        // logger.info(`{action: new-owner, status: ${CREATED_STATUS}, ownerId: ${newOwnerId}}`);
        return res.status(201).json({ msg: "new-owner-ok", ownerId: newOwnerId });
    } catch (error) {
        console.error(error);
        //logger.info(`{action: new-owner, status: ${CREATED_STATUS}, statusCode: ${error.statusCode || 500}message: ${error.message}`);
        return res.status(error.statusCode || 500).json({ error: error.message || error });
    }
};

async function Login(req, res) {
    try {
        const { email, password } = req.body;

        // Validate request fields
        await body('email').isEmail().withMessage("Invalid email address").notEmpty().withMessage("Email address is required").run(req);
        await body('password').notEmpty().withMessage('Password is required').run(req);

        // Check for validation errors
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ errors: validationErrors.array() });
        }

        // Convert email to lowercase for case-insensitive search
        const emailLowerCase = email.toLowerCase();

        // Search for the user in the mainUsers collection by email
        const loggedInUser = await userCollection.findOne({ "email": emailLowerCase });

        if (loggedInUser) {
            if (loggedInUser.isActive) {
                const passwordMatch = await bcrypt.compare(password, loggedInUser.password);

                if (passwordMatch) {

                    // if (!loggedInUser.allFieldsComplete) {
                    //     return res.status(403).send({ msg: "User has not completed all required fields." });
                    // }

                    const token = jwt.createAccessToken(loggedInUser);

                    // Reset login attempts if login is successful
                    await userCollection.updateOne({ "_id": loggedInUser._id }, { $set: { 'authDetails.loginAttempts': 0 } });

                    // const userInfo = await getUserSystemInfo(loggedInUser);

                    // return res.status(200).json({ msg: "User successfully authenticated", A7: token, user: userInfo });

                    return res.status(200).json({ msg: "User successfully authenticated", userId: loggedInUser._id, A7: token });

                } else {
                    // Increment login attempts if password is incorrect
                    const updatedUser = await userCollection.findOneAndUpdate(
                        { "_id": loggedInUser._id },
                        { $inc: { 'authDetails.loginAttempts': 1 } },
                        { returnDocument: 'after' }
                    );

                    // Check if the login attempt limit is exceeded
                    if (updatedUser.authDetails.loginAttempts >= 3) {
                        // Lock the account
                        await userCollection.updateOne({ "_id": loggedInUser._id }, { $set: { isActive: false } });
                        return res.status(401).json({ msg: "Account locked due to multiple failed login attempts." });
                    } else {
                        return res.status(401).json({ msg: "Incorrect password" });
                    }
                }
            } else {
                res.status(401).json({ msg: "Inactive account, please contact the administrator." });
            }
        } else {
            res.status(401).json({ msg: "User not found" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error" });
    }
}

async function Logout(req, res) {

    try {
        const token = req.headers.authorization?.replace("Bearer ", "");

        if (!token) {
            console.error('Token is not provided');
            return res.status(400).json({ msg: "Token is not provided" });
        }

        const myToken = jwt.decoded(token);
        if (!myToken) {
            return res.status(400).json({ msg: "Token invalide" });
        }

        const { completed, msg } = await jwt.revokeToken(token);

        if (!completed) {

            return res.status(401).json({ msg: msg });
        }

        res.status(200).json({ msg: msg });

    } catch (error) {
        console.error(`Error while logout : ${error.message}`);
        return res.status(500).json({ msg: "Internal Server Error", error: error });
    }
}

async function Edit(req, res) {

    try {

        const userData = req.body;
        const image = req.files?.image;

        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            return res.status(400).json({ msg: "Le Token n'est pas fourni" });
        }

        const myToken = jwt.decoded(token);
        let userId = myToken.user_id;
        // let userEmail = myToken.user_email;

        const findUser = await userCollection.findOne({ _id: userId });

        if (!findUser) {
            return res.status(404).json({ msg: "User not found" });
        }

        if (userData.password) {
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);
        }

        Object.assign(findUser, userData);

        if (userData.isActive !== undefined) {
            findUser.isActive = userData.isActive === 'true' || userData.isActive === true;
        }


        if (image && image.length > 0) {
            // const { downloadURL } = await uploadFile(image[0]);
            if (findUser.avatar) {
                await deleteFile(`avatars/${findUser.avatar}`);
            }
            
            const { downloadURL } = await uploadImage(image[0]);

            findUser.avatar = downloadURL;
        }

        const result = await userCollection.updateOne(
            { _id: userId }, 
            { $set: findUser } 
        );

        if (result.modifiedCount === 0) {
            return res.status(500).json({ msg: "User update failed (No attributes changed)" });
        }

        // Delete the cached data for this user
        deleteCache(`${userId}`);

        res.status(200).json({ msg: "User updated OK" });

    } catch (error) {

        console.error(`Error while editing user ${error.message}`);
        return res.status(500).json({ msg: "Internal Server Error", error: error });
    }
}

async function getMe(req, res) {

    try {

        // Extract the token from the authorization header
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            return res.status(400).json({ msg: "Token not provided" });
        }

        // Decode the token to extract user ID
        const myToken = jwt.decoded(token);
        const userId = myToken.user_id;

        const cacheKey = `${userId}`;
        const [cachedUserProfile, foundInCache] = getCache(cacheKey);

        if (foundInCache) {
            // If data is found in cache, return it
            console.log('Data found in cache. Returning cached data...');
            return res.status(200).json(cachedUserProfile);
        }

        // Find the user by ID
        const userProfile = await userCollection.findOne({ _id: userId });
        if (!userProfile) {
            return res.status(404).json({ msg: "User profile not found" });
        }

        // Exclude sensitive information before returning the profile
        const { password, allConditionsAccepted, authDetails, roles, ...userData } = userProfile;

        // Cache the user data with a custom TTL if needed
        setCache(cacheKey, userData, 150); // Use the default TTL or pass a custom TTL if needed

        // Return the user's profile data
        res.status(200).json(userData);

    } catch (error) {

        console.error(`Error retrieving user profile: ${error.message}`);
        return res.status(500).json({ msg: "Internal server error", error: error });

    }
}


//GET /users?userId=60d21b4667d0d8992e610c85
//GET /users?companyName=tech

// -> Search by roles (multiple roles can be included, separated by commas)
//GET /users?roles=admin,maintenance

// ->  Search by active/inactive status (boolean):
//GET /users?isActive=true
//GET /users?isActive=false

// -> Mixing parameters:
// GET /users?companyName=tech&roles=admin,owner&isActive=true
async function getUserRequest(req, res) {
    try {
        // Extract query parameters from the request
        const { userId, companyName, roles, isActive } = req.query;

        // Construct the query object
        let query = {};

        if (userId) {
            query._id = userId;
        }

        if (companyName) {
            query.companyName = { $regex: new RegExp(companyName, 'i') }; // Case-insensitive search
        }

        if (roles) {
            query.roles = { $in: roles.split(',') }; // Split comma-separated roles and search for any match
        }

        if (isActive !== undefined) {
            query.isActive = isActive === 'true'; // Convert 'true'/'false' to boolean
        }

        // console.log(query);
        // Execute the query
        const users = await userCollection.find(query).toArray();

        // Return the results
        res.status(200).json(users);
    } catch (error) {
        console.error(`Error retrieving users: ${error.message}`);
        return res.status(500).json({ msg: "Internal server error", error: error });
    }
}

function createUserByRole(role, userData) {
    switch (role) {
        case 'owner':

            const newUser = new User({
                email: userData.email,
                name: userData.name,
                password: userData.password,
                phone: userData.phone,
                address: userData.address,
                companyName: userData.companyName,
                roles: [role],
                isActive: true
            });


            newUser.set('properties', undefined);
            newUser.set('appointments', undefined);
            newUser.set('customerData', undefined);
            newUser.set('units', undefined);
            newUser.set('contracts', undefined);
            newUser.set('moveInDate', undefined);

            return newUser;

        case 'tenant':
        // Return a new instance of the Tenant model (you need to define this model)
        // return new Tenant(userData);
        case 'admin':
        // Return a new instance of the Admin model (you need to define this model)
        // return new Admin(userData);
        default:
            return new User(userData);
    }
}

module.exports = {
    Register,
    Login,
    Logout,
    Edit,
    getMe,
    getUserRequest
};