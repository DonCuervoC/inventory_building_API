const { Router } = require("express");

const tknAuthenticated = require("../../auth/middlewares/jwt.authenticated.js");
const globalUserController = require('../../controllers/users/user.global.controller.js');

const { upload } = require('../../utils/multer.js');
const router = Router();


// OWNERS
//Register
router.post('/owner/new', globalUserController.Register('owner')),

// Login
router.post('/login', globalUserController.Login);

//Logout
router.post('/logout',
[
    tknAuthenticated.ensureAuth,
    tknAuthenticated.isActiveSession
],
    globalUserController.Logout);


// update 
router.patch('/user',
    [
        tknAuthenticated.ensureAuth,
        tknAuthenticated.isActiveSession
    ],
    [
        upload.fields([{ name: 'image', maxCount: 1 }])
    ],
    globalUserController.Edit);

//GETME 
router.get('/me',
    [
        tknAuthenticated.ensureAuth,
        tknAuthenticated.isActiveSession
    ],
    globalUserController.getMe
);


router.get('/user',
    [
        tknAuthenticated.ensureAuth,
        tknAuthenticated.isActiveSession
    ],
    globalUserController.getUserRequest
);



module.exports = router;
