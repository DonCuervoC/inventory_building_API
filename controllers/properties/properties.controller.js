// const User = require("../models/user");
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

const { getDb } = require('../../mongoConnection');
const { validatePropertyFields, validatePropertyUpdateFields } = require('../../utils/validatorFields');
const { uploadFile, uploadImageProperty, deleteFile } = require('../../utils/uploadFile');
const { setCache, getCache, deleteCache } = require('../../utils/cache.js');
const { OwnerHasProperty, RoleAuthEditProperty } = require('../../auth/userAccess/access.users.js');

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
const FBFN_PROPERTIES = process.env.FBFN_PROPERTIES;

const CREATED_STATUS = process.env.CREATED_STATUS;
const DELETED_STATUS = process.env.DELETED_STATUS;
const WATCHED_STATUS = process.env.WATCHED_STATUS;
const UPDATED_STATUS = process.env.UPDATED_STATUS;
const ERROR_STATUS = process.env.ERROR_STATUS;

const mainDb = getDb(`${MYDATABASE}`);
const userCollection = mainDb.collection(G_USER_COLLECTION);
const propertyCollection = mainDb.collection(PROPERTIES_COLLECTION);

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

async function UpdateProperty(req, res) {
    try {
        // Validate the property fields
        await validatePropertyUpdateFields(req);

        // Check for validation errors
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ errors: validationErrors.array() });
        }

        const propertyData = req.body;

        const token = req.headers.authorization.replace("Bearer ", "");
        const myToken = jwt.decoded(token);

        if (!token) {
            return res.status(400).json({ msg: "Token not provided" });
        }

        // Find the user by their ID
        const userFound = await userCollection.findOne({ _id: myToken.user_id });
        if (!userFound) {
            return res.status(404).json({ msg: "User not found" });
        }

        const { propertyId } = req.params;

        const isUserOwnerOfProperty = OwnerHasProperty(userFound, propertyId);
        const isUserAuthorized = RoleAuthEditProperty(userFound);

        if (!isUserOwnerOfProperty || !isUserAuthorized) {
            return res.status(401).json({ msg: "Unauthorized" });
        }

        // Find the property by ID
        const existingProperty = await propertyCollection.findOne({ _id: propertyId });

        if (!existingProperty) {
            return res.status(404).json({ msg: "Property not found" });
        }

        // Prepare address fields separately
        let address = { ...existingProperty.address }; // Start with existing address data
        if (propertyData.street) {
            address.street = propertyData.street.toLowerCase();
        }
        if (propertyData.postalCode) {
            address.postalCode = propertyData.postalCode.toLowerCase();
        }
        if (propertyData.city) {
            address.city = propertyData.city.toLowerCase();
        }
        if (propertyData.province) {
            address.province = propertyData.province.toLowerCase();
        }
        if (propertyData.country) {
            address.country = propertyData.country.toLowerCase();
        }

        // Check for name and address duplication in parallel, excluding the current property
        const [propertyWithName, propertyWithAddress] = await Promise.all([
            propertyCollection.findOne({ name: propertyData.name ? propertyData.name.toLowerCase() : existingProperty.name, _id: { $ne: propertyId } }),
            propertyCollection.findOne({
                'address.street': address.street || existingProperty.address.street,
                'address.postalCode': address.postalCode || existingProperty.address.postalCode,
                'address.city': address.city || existingProperty.address.city,
                'address.province': address.province || existingProperty.address.province,
                'address.country': address.country || existingProperty.address.country,
                _id: { $ne: propertyId }
            })
        ]);

        if (propertyWithName) {
            return res.status(400).json({ msg: "A property with this name already exists." });
        }

        if (propertyWithAddress) {
            return res.status(400).json({ msg: "A property with this address already exists." });
        }

        // Prepare updated property data
        const updatedProperty = {
            ...existingProperty, // Retain existing data
            address: address, // Update address
            name: propertyData.name ? propertyData.name.toLowerCase() : existingProperty.name,
            type: propertyData.type ? propertyData.type.toLowerCase() : existingProperty.type,
            description: propertyData.description ? propertyData.description.toLowerCase() : existingProperty.description,
            // photos: photos_ // Update the URLs of the photos
        };

        // Update the property in the properties collection
        await propertyCollection.updateOne(
            { _id: propertyId },
            { $set: updatedProperty }
        );

        // Delete the cached data for this user
        deleteCache(`${propertyId}`);

        res.status(200).json({ msg: "Property updated successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Internal server error", error: error });
    }
}

async function GetMyProperties(req, res) {
    try {
        // Retrieve and validate the token
        const token = req.headers.authorization.replace("Bearer ", "");
        const myToken = jwt.decoded(token);

        if (!token) {
            return res.status(400).json({ msg: "Token not provided" });
        }

        // Find the user by their ID
        const userFound = await userCollection.findOne({ _id: myToken.user_id });
        if (!userFound) {
            return res.status(404).json({ msg: "User not found" });
        }

        const isUserAuthorized = RoleAuthEditProperty(userFound);
        if (!isUserAuthorized) {
            return res.status(401).json({ msg: "Unauthorized" });
        }

        // Get the IDs of the user's properties
        const propertyIds = userFound.properties;

        // Find all properties in the collection using the found IDs
        const properties = await propertyCollection.find({
            _id: { $in: propertyIds }
        }).toArray();

        // Format the data of each property
        const propertiesDetails = properties.map(property => {
            // Ensure each field is an array, even if empty or undefined
            const units = property.units || [];
            const tenants = property.tenants || [];
            const workers = property.workers || [];
            const owners = property.owners || [];

            return {
                id: property._id,
                name: property.name,
                photos: property.photos,
                // units: units, // IDs of the units
                // tenants: tenants, // IDs of the tenants
                // workers: workers, // IDs of the workers
                // owners: owners, // IDs of the owners
                // unitsCount: units.length,
                // tenantsCount: tenants.length,
                // workersCount: workers.length,
                // ownersCount: owners.length,
                // message: (units.length === 0 && tenants.length === 0 && workers.length === 0 && owners.length === 0)
                //     ? "No values have been registered yet."
                //     : null
            };
        });

        // Return the response with the details of the properties and the total number
        res.status(200).json({
            properties: propertiesDetails,
            totalProperties: properties.length
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Internal server error", error: error });
    }
}

async function GetSingleProperty(req, res) {
    try {
        // Retrieve and validate the token
        const token = req.headers.authorization.replace("Bearer ", "");
        const myToken = jwt.decoded(token);

        if (!token) {
            return res.status(400).json({ msg: "Token not provided" });
        }

        // Find the user by their ID
        const userFound = await userCollection.findOne({ _id: myToken.user_id });
        if (!userFound) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Check if the property ID is provided in the request parameters
        const { propertyId } = req.params;
        if (!propertyId) {
            return res.status(400).json({ msg: "Property ID not provided" });
        }

        const isUserOwnerOfProperty = OwnerHasProperty(userFound, propertyId);
        const isUserAuthorized = RoleAuthEditProperty(userFound);

        if (!isUserOwnerOfProperty || !isUserAuthorized) {
            return res.status(401).json({ msg: "Unauthorized" });
        }

        const cacheKey = `${propertyId}`;
        const [cachedSingleProperty, foundInCache] = getCache(cacheKey);

        if (foundInCache) {
            // If data is found in cache, return it
            console.log('Data found in cache. Returning cached data...');
            return res.status(200).json(cachedSingleProperty);
        }


        // Find the property by its ID
        const existingProperty = await propertyCollection.findOne({ _id: propertyId });
        if (!existingProperty) {
            return res.status(404).json({ msg: "Property not found" });
        }

        // Ensure that each property attribute is properly instantiated
        const propertyDetails = {
            id: existingProperty._id,
            name: existingProperty.name,
            description: existingProperty.description,
            address: existingProperty.address,
            photos: existingProperty.photos || [],
            units: existingProperty.units || [],
            tenants: existingProperty.tenants || [],
            workers: existingProperty.workers || [],
            owners: existingProperty.owners || [],
            inventory: existingProperty.inventory || [],
            contracts: existingProperty.contracts || [],
            type: existingProperty.type,
        };

        // Cache the user data with a custom TTL if needed
        setCache(cacheKey, propertyDetails, 150); // Use the default TTL or pass a custom TTL if needed

        // Return the full details of the property
        res.status(200).json(propertyDetails);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Internal server error", error: error });
    }
}

async function UploadPhoto(req, res) {
    try {

        // Retrieve and validate the token
        const token = req.headers.authorization.replace("Bearer ", "");
        const myToken = jwt.decoded(token);

        if (!token) {
            return res.status(400).json({ msg: "Token not provided" });
        }

        // Check if the property ID is provided in the request parameters
        const { propertyId } = req.params;

        // Find the user by their ID
        const userFound = await userCollection.findOne({ _id: myToken.user_id });
        if (!userFound) {
            return res.status(404).json({ msg: "User not found" });
        }

        const isUserOwnerOfProperty = OwnerHasProperty(userFound, propertyId);
        const isUserAuthorized = RoleAuthEditProperty(userFound);

        if (!isUserOwnerOfProperty || !isUserAuthorized) {
            return res.status(401).json({ msg: "Unauthorized" });
        }

        if (!propertyId) {
            return res.status(400).json({ msg: "Property ID not provided" });
        }

        const findProperty = await propertyCollection.findOne({ _id: propertyId });

        if (!findProperty) {
            return res.status(404).json({ msg: "Property not found" });
        }

        if (findProperty.photos.length >= 6) {
            return res.status(400).json({ msg: "Photo limit reached (6). Please delete a photo before adding a new one." });
        }

        // Check if the number of existing photos exceeds the limit
        const existingPhotosCount = findProperty.photos.length;
        const maxPhotosAllowed = 6;

        // Calculate the number of additional photos that can be uploaded
        const availableSlots = maxPhotosAllowed - existingPhotosCount;

        // Check if the number of new photos exceeds the available slots
        if (req.files && req.files.length > availableSlots) {
            return res.status(400).json({ msg: `Cannot upload more than ${availableSlots} photos. Please delete some photos before adding new ones.` });
        }

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
            const photos_ = await Promise.all(uploadPromises);

            // Update the property by adding new photo URLs to the existing array
            await propertyCollection.updateOne(
                { _id: propertyId },
                { $addToSet: { photos: { $each: photos_ } } }
            );

            res.status(200).json({ msg: "Photos added successfully" });
        } else {
            res.status(400).json({ msg: "No photos provided" });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Internal server error", error: error });
    }
}

async function DeletePhoto(req, res) {

    try {

        // Retrieve and validate the token
        const token = req.headers.authorization.replace("Bearer ", "");
        const myToken = jwt.decoded(token);

        if (!token) {
            return res.status(400).json({ msg: "Token not provided" });
        }

        // Check if the property ID is provided in the request parameters
        const { propertyId } = req.params;
        const { photoURL } = req.body;

        // Check if the property ID and photo URL are provided
        if (!propertyId || !photoURL) {
            return res.status(400).json({ msg: "Property ID or photo URL not provided" });
        }

        // Execute both queries in parallel
        const [userFound, findProperty] = await Promise.all([
            userCollection.findOne({ _id: myToken.user_id }),
            propertyCollection.findOne({ _id: propertyId })
        ]);

        // Validate user
        if (!userFound) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Validate property
        if (!findProperty) {
            return res.status(404).json({ msg: "Property not found" });
        }

        // // Find the user by their ID
        // const userFound = await userCollection.findOne({ _id: myToken.user_id });
        // if (!userFound) {
        //     return res.status(404).json({ msg: "User not found" });
        // }

        const isUserOwnerOfProperty = OwnerHasProperty(userFound, propertyId);
        const isUserAuthorized = RoleAuthEditProperty(userFound);

        if (!isUserOwnerOfProperty || !isUserAuthorized) {
            return res.status(401).json({ msg: "Unauthorized" });
        }

        if (!propertyId) {
            return res.status(400).json({ msg: "Property ID not provided" });
        }

        // const findProperty = await propertyCollection.findOne({ _id: propertyId });

        // if (!findProperty) {
        //     return res.status(404).json({ msg: "Property not found" });
        // }

        // Check if the photo exists in the property
        const photoIndex = findProperty.photos.indexOf(photoURL);

        if (photoIndex === -1) {
            return res.status(404).json({ msg: "Photo not found" });
        }

        await deleteFile(`${FBFN_PROPERTIES}/${photoURL}`);

        // Remove the photo URL from the array
        await propertyCollection.updateOne(
            { _id: propertyId },
            { $pull: { photos: photoURL } } // Use $pull to remove the photo URL from the array
        );

        res.status(200).json({ msg: "Photo deleted successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Internal server error", error: error });
    }
}

async function AddCoOwnerToProperty(req, res) {
    try {

        const token = req.headers.authorization.replace("Bearer ", "");
        const myToken = jwt.decoded(token);
        const { propertyId, userId } = req.params;

        if (!token) {
            return res.status(400).json({ msg: "Le Token n'est pas fourni" });
        }
        
        // Execute both queries in parallel
        const [ownerFound, findProperty, userFound] = await Promise.all([
            userCollection.findOne({ _id: myToken.user_id }),
            propertyCollection.findOne({ _id: propertyId }),
            userCollection.findOne({ _id: userId })
        ]);

        // Validate owner
        if (!ownerFound) {
            return res.status(404).json({ msg: "Owner not found" });
        }
        // Validate property
        if (!findProperty) {
            return res.status(404).json({ msg: "Property not found" });
        }

        // Validate property
        if (!userFound) {
            return res.status(404).json({ msg: "Co-owner not found" });
        }

        const isUserOwnerOfProperty = OwnerHasProperty(ownerFound, propertyId);
        const isOwnerAuthorized = RoleAuthEditProperty(ownerFound);
        const isUserAuthorized = RoleAuthEditProperty(userFound);

        if (!isOwnerAuthorized || !isUserOwnerOfProperty || !isUserAuthorized) {
            return res.status(401).json({ msg: "Unauthorized" });
        }

        await Promise.all([
            propertyCollection.updateOne(
                { _id: propertyId },
                { $addToSet: { owners: userId } }
            ),
            userCollection.updateOne(
                { _id: userId },
                { $addToSet: { properties: propertyId } }
            )
        ]);

        res.status(200).json({ msg: "Property created OK" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Internal server error", error: error });
    }
}

async function RemoveOwnerFromProperty(req, res) {
    try {
        // Retrieve and validate the token
        const token = req.headers.authorization.replace("Bearer ", "");
        const myToken = jwt.decoded(token);
        const { propertyId, userId } = req.params;

        if (!token) {
            return res.status(400).json({ msg: "Token not provided" });
        }

        // Execute both queries in parallel
        const [ownerFound, findProperty, userFound] = await Promise.all([
            userCollection.findOne({ _id: myToken.user_id }),
            propertyCollection.findOne({ _id: propertyId }),
            userCollection.findOne({ _id: userId })
        ]);

        // Validate owner
        if (!ownerFound) {
            return res.status(404).json({ msg: "Owner not found" });
        }
        // Validate property
        if (!findProperty) {
            return res.status(404).json({ msg: "Property not found" });
        }
        // Validate co-owner
        if (!userFound) {
            return res.status(404).json({ msg: "Co-owner not found" });
        }

        const isUserOwnerOfProperty = OwnerHasProperty(ownerFound, propertyId);
        const isOwnerAuthorized = RoleAuthEditProperty(ownerFound);
        const isUserAuthorized = RoleAuthEditProperty(userFound);

        if (!isOwnerAuthorized || !isUserOwnerOfProperty || !isUserAuthorized) {
            return res.status(401).json({ msg: "Unauthorized" });
        }

        // Remove owner from the property and remove property from the user
        await Promise.all([
            propertyCollection.updateOne(
                { _id: propertyId },
                { $pull: { owners: userId } } // Remove the userId from the owners array
            ),
            userCollection.updateOne(
                { _id: userId },
                { $pull: { properties: propertyId } } // Remove the propertyId from the properties array
            )
        ]);

        res.status(200).json({ msg: "Co-owner removed successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Internal server error", error: error });
    }
}




module.exports = {
    NewProperty,
    UpdateProperty,
    GetMyProperties,
    GetSingleProperty,
    UploadPhoto,
    DeletePhoto,
    AddCoOwnerToProperty,
    RemoveOwnerFromProperty
};