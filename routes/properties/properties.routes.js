const { Router } = require("express");

const tknAuthenticated = require("../../auth/middlewares/jwt.authenticated.js");
const propertiesController = require('../../controllers/properties/properties.controller.js');

const { upload } = require('../../utils/multer.js');
const api = Router();


// OWNERS
//Register
api.post('/property/new', [
    tknAuthenticated.ensureAuthOwner,
    tknAuthenticated.isActiveSession],
    [
        upload.fields([
            { name: 'photo1', maxCount: 1 },
            { name: 'photo2', maxCount: 1 },
            { name: 'photo3', maxCount: 1 },
            { name: 'photo4', maxCount: 1 },
            { name: 'photo5', maxCount: 1 },
            { name: 'photo6', maxCount: 1 }])
    ],
    propertiesController.NewProperty);


// // update 
api.put('/property/update/:propertyId', [
    tknAuthenticated.ensureAuth,
    tknAuthenticated.isActiveSession],
    propertiesController.UpdateProperty);

//Get all properties
api.get('/property/all', [
    tknAuthenticated.ensureAuth,
    tknAuthenticated.isActiveSession],
    propertiesController.GetMyProperties);

//Get a property by id
api.get('/property/single/:propertyId', [
    tknAuthenticated.ensureAuth,
    tknAuthenticated.isActiveSession],
    propertiesController.GetSingleProperty);

// ADD photos to property
api.patch('/property/photos/add/:propertyId', [
    tknAuthenticated.ensureAuthOwner,
    tknAuthenticated.isActiveSession],
    [
        upload.fields([
            { name: 'photo1', maxCount: 1 },
            { name: 'photo2', maxCount: 1 },
            { name: 'photo3', maxCount: 1 },
            { name: 'photo4', maxCount: 1 },
            { name: 'photo5', maxCount: 1 },
            { name: 'photo6', maxCount: 1 }])
    ],
    propertiesController.UploadPhoto);

//Delete a photo from property
api.delete('/property/photos/del/:propertyId', [
    tknAuthenticated.ensureAuth,
    tknAuthenticated.isActiveSession],
    propertiesController.DeletePhoto);


api.delete('/property/owner/add/:propertyId', [
    tknAuthenticated.ensureAuth,
    tknAuthenticated.isActiveSession],
    propertiesController.DeletePhoto);



module.exports = rouapiter;
