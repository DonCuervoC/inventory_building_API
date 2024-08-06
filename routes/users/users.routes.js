const { Router } = require("express");

const tknAuthenticated = require("../../auth/middlewares/jwt.authenticated.js");
const globalUserController = require('../../controllers/users/user.global.controller.js');

const { upload } = require('../../utils/multer.js');
const api = Router();


// OWNERS
//Register
api.post('/owner/new', globalUserController.Register('owner')),

// Login
api.post('/login', globalUserController.Login);

//Logout
api.post('/logout',
[
    tknAuthenticated.ensureAuth,
    tknAuthenticated.isActiveSession
],
    globalUserController.Logout);


// update 
api.patch('/user',
    [
        tknAuthenticated.ensureAuth,
        tknAuthenticated.isActiveSession
    ],
    [
        upload.fields([{ name: 'image', maxCount: 1 }])
    ],
    globalUserController.Edit);

//GETME 
api.get('/me',
    [
        tknAuthenticated.ensureAuth,
        tknAuthenticated.isActiveSession
    ],
    globalUserController.getMe
);


api.get('/user',
    [
        tknAuthenticated.ensureAuth,
        tknAuthenticated.isActiveSession
    ],
    globalUserController.getUserRequest
);



module.exports = api;
