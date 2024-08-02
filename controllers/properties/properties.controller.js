// const User = require("../models/user");
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

const { getDb } = require('../../mongoConnection');
const { validatePropertyFields } = require('../../utils/validatorFields');
const { uploadFile, uploadImageProperty, deleteFile } = require('../../utils/uploadFile');
const { setCache, getCache, deleteCache } = require('../../utils/cache.js');

const logger = require('../../utils/logger');
const jwt = require("../../utils/jwt.js");

// const image = require("../utils/image");

const Owner = require('../../modeles/users/user.owner.model');
const User = require('../../modeles/users/user.global')
const Property = require('../../modeles/properties/property.js');


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
const propertyCollection = mainDb.collection(PROPERTIES_COLLECTION);
// const ownerCollection = mainDb.collection(OWNERS_COLLECTION);



async function NewProperty(req, res) {

    try {

        // Validate the property fields
        await validatePropertyFields(req);

        // Check for validation errors
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ errors: validationErrors.array() });
        }

        const propertyData = req.body;

        console.log(propertyData);

        const token = req.headers.authorization.replace("Bearer ", "");
        const myToken = jwt.decoded(token);

        if (!token) {
            return res.status(400).json({ msg: "Le Token n'est pas fourni" });
        }


        // Find the user by their ID
        const userFound = await userCollection.findOne({ _id: myToken.user_id });
        // Check if the user exists
        if (!userFound) {
            return res.status(404).json({ msg: "User not found" });
        }

        let address = {}

        address.street = propertyData.street.toLowerCase();
        address.postalCode = propertyData.postalCode.toLowerCase();
        address.city = propertyData.city.toLowerCase();
        address.province = propertyData.province.toLowerCase();
        address.country = propertyData.country.toLowerCase();


        // Check for name and address duplication in parallel
        const [propertyWithName, propertyWithAddress] = await Promise.all([

            propertyCollection.findOne({ name: propertyData.name.toLowerCase() }),

            propertyCollection.findOne({
                'address.street': address.street.toLowerCase(),
                'address.postalCode': address.postalCode.toLowerCase(),
                'address.city': address.city.toLowerCase(),
                'address.province': address.province.toLowerCase(),
                'address.country': address.country.toLowerCase()
            })

        ]);

        if (propertyWithName) {
            return res.status(400).json({ msg: "A property with this name already exists." });
        }

        if (propertyWithAddress) {
            return res.status(400).json({ msg: "A property with this address already exists." });
        }

        // console.log(propertyData);
        // console.log(adress);

        let photos_ = [];

        // Check if there are images in the request
        if (req.files) {
            // Iterate over the field names defined in Multer
            const imageKeys = ['photo1', 'photo2', 'photo3', 'photo4', 'photo5', 'photo6'];

            // Filter the images present in the request
            const uploadPromises = imageKeys
                .filter(key => req.files[key]) // Ensure the field exists
                .map(async (key) => {
                    const image = req.files[key][0]; // Get the image from the corresponding field
                    const { downloadURL } = await uploadImageProperty(image); // Upload image to Firebase
                    return downloadURL;
                });

            // Wait for all images to upload and store URLs
            photos_ = await Promise.all(uploadPromises);
        }

        // Create a new property with the provided data
        const newProperty = new Property({
            owners: [myToken.user_id],
            address: address,
            name: propertyData.name.toLowerCase(),
            type: propertyData.type.toLowerCase(),
            description: propertyData.description.toLowerCase(),
            photos: photos_ // Add the URLs of the photos
        });


        newProperty.set('tenants', undefined);
        newProperty.set('workers', undefined);
        newProperty.set('inventory', undefined);
        newProperty.set('contracts', undefined);
        newProperty.set('units', undefined);


        // Insert the new property into the properties collection and update the users collection
        await Promise.all([
            propertyCollection.insertOne(newProperty),
            userCollection.updateOne(
                { _id: userFound._id },
                { $addToSet: { properties: newProperty._id } }
            )
        ]);

        res.status(200).json({ msg: "Property created OK" });

    } catch (error) {
        console.error(error);
        // logger.error('PROPERTY CREATE: An error occurred while creating a property', { error: error, request: req.body });
        return res.status(500).json({ msg: "Internal server error", error: error });
    }
}


module.exports = {
    NewProperty,
};