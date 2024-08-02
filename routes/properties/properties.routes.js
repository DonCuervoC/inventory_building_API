const { Router } = require("express");

const tknAuthenticated = require("../../auth/middlewares/jwt.authenticated.js");
const propertiesController = require('../../controllers/properties/properties.controller.js');

const { upload } = require('../../utils/multer.js');
const router = Router();


// OWNERS
//Register
router.post('/property/new', [
    tknAuthenticated.ensureAuthOwner,
    tknAuthenticated.isActiveSession
],
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
// router.patch('/user',
//     [
//         tknAuthenticated.ensureAuth,
//         tknAuthenticated.isActiveSession
//     ],
//     [
//         upload.fields([{ name: 'image', maxCount: 1 }])
//     ],
//     globalUserController.Edit);



module.exports = router;
