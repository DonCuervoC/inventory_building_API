const { Router } = require("express");

const tknAuthenticated = require("../../auth/middlewares/jwt.authenticated.js");
const propertiesController = require('../../controllers/properties/properties.controller.js');

const { upload } = require('../../utils/multer.js');
const router = Router();


// OWNERS
//Register
router.post('/property/new', [
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
router.put('/property/update/:propertyId', [
    tknAuthenticated.ensureAuth,
    tknAuthenticated.isActiveSession],
    propertiesController.UpdateProperty);

//Get all properties
router.get('/property/all', [
    tknAuthenticated.ensureAuth,
    tknAuthenticated.isActiveSession],
    propertiesController.GetMyProperties);

//Get a property by id
router.get('/property/single/:propertyId', [
    tknAuthenticated.ensureAuth,
    tknAuthenticated.isActiveSession],
    propertiesController.GetSingleProperty);

// ADD photos to property
router.patch('/property/photos/add/:propertyId', [
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
router.delete('/property/photos/del/:propertyId', [
    tknAuthenticated.ensureAuth,
    tknAuthenticated.isActiveSession],
    propertiesController.DeletePhoto);



module.exports = router;
